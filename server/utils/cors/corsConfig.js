const cors = require("cors");

function corsConfig(app) {
  const allowedOrigins = [
    "https://learnstocks.netlify.app",
    "https://console.cron-job.org",
    "https://prodez-ai.netlify.app",
    "https://medi-connect-in.netlify.app",
    "https://med-space.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080", // Add localhost:8080 as it may be used in dev
    "http://localhost:8081", // Add localhost:8081 for backend dev
    "https://sehat-station.vercel.app/", // <-- Add your deployed frontend Vercel URL
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      // Log origin for debugging
      console.log("CORS check - Origin:", origin);
      // Allow requests with no 'Origin' (e.g., Postman or internal requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token", "Origin"],
    exposedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    credentials: true, // Allow credentials (cookies, tokens, etc.)
  };

  // Apply CORS using the options
  app.use(cors(corsOptions));

  // Additional middleware to set explicit CORS response headers and log preflight
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,x-auth-token,Origin"
      );
    }
    if (req.method === "OPTIONS") {
      console.log(
        "CORS preflight (OPTIONS) request for",
        req.url,
        "from",
        origin
      );
      return res.sendStatus(204);
    }
    next();
  });
}

module.exports = corsConfig;
