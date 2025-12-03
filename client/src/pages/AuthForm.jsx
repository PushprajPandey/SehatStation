import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { notify } from "../components/notification";
import "../styles/Login.css";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil"; // Import recoil
import { mode } from "../store/atom"; // Import dark mode atom
import { databaseUrls } from "../data/databaseUrls";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [formData, setFormData] = useState({
    type: "user", // 'user' for Patient, 'hospital' for Doctor
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    frontend: {},
    backend: {},
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
  });

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dark = useRecoilValue(mode); // Get dark mode state

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({
      ...prev,
      frontend: {
        ...prev.frontend,
        [e.target.name]: "", // Clear frontend error for the field being edited
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required (frontend)";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        frontend: validationErrors,
      }));
      return;
    }
    setIsSubmitting(true);

    try {
      console.log("Form Data being sent to backend:", formData); // Log to check the data

      const response = await fetch(databaseUrls.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Ensure formData includes type, email, and password
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        notify("Login successful", "success");
        window.location.href = "/profile";
      } else {
        if (data.errors) {
          const backendErrors = {};
          data.errors.forEach((error) => {
            backendErrors[error.field] = `${error.message} (backend)`;
          });
          setErrors((prev) => ({
            ...prev,
            backend: backendErrors,
          }));
        } else {
          notify(
            data.message || "An error occurred. Please try again.",
            "warn"
          );
        }
      }
    } catch (error) {
      notify("Error connecting to the server", "error");
      console.error("Network Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Function to handle Google Sign-In button click
  const handleGoogleSignIn = () => {
    // Open a new window for Google OAuth sign-in
    const googleSignInWindow = window.open(
      "https://medi-connect-f671.onrender.com/auth/google",
      "_blank",
      "width=500,height=600"
    );

    // Listen for messages from the OAuth window (token response)
    window.addEventListener("message", (event) => {
      if (event.origin === "https://medi-connect-f671.onrender.com") {
        // Ensure the event is from the correct origin
        const { token } = event.data;
        if (token) {
          localStorage.setItem("token", token); // Store the token in localStorage
          notify("Login successful", "success");
          window.location.href = "/profile"; // Redirect to profile page
        }
      }
    });
  };

  return (
    <div className="medsync-auth-bg">
      <div className="medsync-auth-wrapper">
        {/* Left side: logo and welcome */}
        <div className="medsync-auth-left">
          <img
            src="/favicon.png"
            alt="SehatStation Logo"
            className="auth-logo"
          />
          <h2 className="medsync-auth-title">Welcome</h2>
          <p className="medsync-auth-desc">
            Sign in to access your account and manage appointments, hospitals,
            and more.
          </p>
        </div>
        {/* Right side: form */}
        <div className="medsync-auth-right">
          <div className="medsync-auth-toggle">
            <button
              type="button"
              className={`medsync-auth-toggle-btn${formData.type === "user" ? " active" : ""}`}
              onClick={() => setFormData({ ...formData, type: "user" })}
            >
              Patient
            </button>
            <button
              type="button"
              className={`medsync-auth-toggle-btn${formData.type === "hospital" ? " active" : ""}`}
              onClick={() => setFormData({ ...formData, type: "hospital" })}
            >
              Doctor
            </button>
          </div>
          <h2 className="medsync-auth-form-title">
            Login as {formData.type === "user" ? "Patient" : "Doctor"}
          </h2>
          <form onSubmit={handleSubmit} className="medsync-auth-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="medsync-auth-input"
            />
            {errors.frontend.email && (
              <span className="error">{errors.frontend.email}</span>
            )}
            {errors.backend.email && (
              <span className="error">{errors.backend.email}</span>
            )}
            <div className="medsync-auth-password-wrapper">
              <input
                type={showPassword.password ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="medsync-auth-input"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="medsync-auth-password-toggle"
              >
                {showPassword.password ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.frontend.password && (
              <span className="error">{errors.frontend.password}</span>
            )}
            {errors.backend.password && (
              <span className="error">{errors.backend.password}</span>
            )}
            <button type="submit" className="medsync-auth-btn">
              Login
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="medsync-auth-google-btn"
            >
              <FaGoogle className="mr-2" /> Sign in with Google
            </button>
            <Link to="/register" className="medsync-auth-link">
              Don't have an account? Register
            </Link>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="medsync-auth-link medsync-auth-forgot"
            >
              Forgot Password?
            </button>
          </form>
        </div>
      </div>
      {isSubmitting && (
        <div className="loader-overlay">
          <div className="loader-container">
            <TailSpin
              height="80"
              width="80"
              color="#2563eb"
              ariaLabel="loading"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
