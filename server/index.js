const express = require("express");
const User = require("./models/user");
const helmet = require("helmet");

const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const authRouter = require("./routes/auth/auth");
const profileRouter = require("./routes/user/profile");
const hospitalRouter = require("./routes/hospital/hospital");
const appointmentRouter = require("./routes/appointments/appointment");
const otherroutes = require("./routes/otherroutes/otherroutes");
// const hospitalroute = require("./modules/hospital/index");   ⭕ ***Deprecated***
const client = require("prom-client");
const { connectDB, corsConfig } = require("./utils");
const Hospital = require("./models/hospital");
const {
  createUserFromGoogleSignIn,
} = require("./controllers/auth/authController");
require("dotenv").config();

// Diagnostic listeners to capture unexpected exits
process.on("exit", (code) => {
  console.log(`Process exiting with code: ${code}`);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Additional signal handlers to capture external termination signals
process.on("SIGINT", () => {
  console.log("Received SIGINT (Ctrl+C) - ignoring for now (debug mode)");
  // Intentionally do not exit so we can debug why SIGINT was sent.
});
process.on("SIGTERM", () => {
  console.log("Received SIGTERM - ignoring for now (debug mode)");
  // Intentionally do not exit so we can capture diagnostics
});
process.on("beforeExit", (code) => {
  console.log("Process beforeExit event with code:", code);
});
process.on("message", (msg) => {
  console.log("Process message event:", msg);
});

// Heartbeat to keep the event loop busy and provide periodic diagnostics
setInterval(() => {
  try {
    console.log("Heartbeat: server alive at", new Date().toISOString());
  } catch (e) {
    // swallow
  }
}, 30000);

// JWT Secret Key
const jwtSecret = process.env.JWT_SECRET;

// Database Connection
const uri = process.env.MONGO_URI;
connectDB(uri);

// Metrics Collection (Prometheus)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Setting Up Express Server
const app = express();
const port = process.env.PORT || 8081;

// Enable CORS
corsConfig(app);

// Body Parser Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());

// Make manifest.json public (no auth, no middleware)
const path = require("path");
app.use((req, res, next) => {
  if (req.path === "/manifest.json") return next();
  next();
});
app.use(
  "/manifest.json",
  express.static(path.join(__dirname, "../client/public/manifest.json"))
);

// Allow OPTIONS preflight for /auth/register (CORS)
// Note: CORS is already handled by corsConfig middleware, this is redundant but kept for explicit handling
app.options("/auth/register", (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://sehat-station.vercel.app",
    "https://sehat-station-83muwl77u-pushpraj-pandeys-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080",
    "http://localhost:8081",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-auth-token, Origin"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

// Request logging middleware for debugging (logs headers and body for auth routes)
app.use((req, res, next) => {
  try {
    if (req.path && req.path.startsWith("/auth")) {
      console.log("--- Incoming Auth Request ---");
      console.log("Method:", req.method);
      console.log("Path:", req.path);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      // body-parser has already run, so req.body should be available
      console.log("Body:", JSON.stringify(req.body, null, 2));
      console.log("-----------------------------");
    }
  } catch (err) {
    console.error("Error in logging middleware:", err);
  }
  next();
});

// Session Middleware (Required for Passport)
app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);

// Initialize Passport and Sessions
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth2.0 Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      console.log("check");
      const { id, displayName, emails } = req.user;
      const email = emails[0].value;
      console.log("check 1");
      let userOrHospital =
        (await User.findOne({ email })) || (await Hospital.findOne({ email }));
      console.log("check 2");
      let token;
      if (!userOrHospital) {
        const { user, token: newToken } = await createUserFromGoogleSignIn({
          id,
          displayName,
          emails,
        });
        token = newToken;
        console.log(user, token);
      } else {
        const payload = { user: { id: userOrHospital.id } };
        token = jwt.sign(payload, jwtSecret, { expiresIn: "3d" });
        console.log(token);
      }

      // Use window.opener.postMessage to send token to parent window and close the OAuth window
      res.send(`
        <script>
          window.opener.postMessage({ token: '${token}' }, 'http://localhost:3000');
          window.close();
        </script>
      `);
    } catch (error) {
      console.error("Google sign-in error:", error);
      res.status(500).json({ message: "Error signing in with Google", error });
    }
  }
);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid", err });
  }
};

// Logout Route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("https://med-space.vercel.app/"); // Redirect to home page after logout
  });
});

// Protected Route Example (Requires JWT Authentication)
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ msg: `Hello, ${req.user.name}. Your email is ${req.user.email}` });
});

// Health Check Endpoint
app.get("/ping", async (_, res) => {
  res.status(200).json({ message: "pong" });
});

// Metrics Endpoint for Prometheus
app.get("/metrics", async (_, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

// Authentication Routes
app.use("/auth", authRouter);

// See all routes in profileRouter
console.log(
  "Profile Routes:",
  profileRouter.stack.map((layer) => layer.route?.path).filter(Boolean)
);

// User Profile Routes - separate each route for clarity
app.use("/auth", profileRouter);

// Direct route for add doctor to ensure it works
app.post("/auth/profile/adddoctor", authenticateToken, (req, res) => {
  console.log(
    "Add doctor direct route hit - Request body:",
    JSON.stringify(req.body)
  );
  console.log("User from token:", req.user);
  require("./controllers/user/profileController").addDoctor(req, res);
});

// Hospital Routes
app.use("/hospitalapi", hospitalRouter);

// Appointment Routes
app.use("/hospitalapi", appointmentRouter);

// other routes
app.use("/otherroutes", otherroutes);
// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
