import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import RegistrationContext from "../store/RegistrationContext";
import { useRecoilValue } from "recoil"; // Recoil hook for dark mode
import { mode } from "../store/atom"; // Assuming dark mode is stored in Recoil

function StepOne() {
  const { basicDetails, setBasicDetails, nextStep } =
    useContext(RegistrationContext);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({ frontend: {}, backend: {} });
  const [gender, setGender] = useState("male");
  const dark = useRecoilValue(mode);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const validateEmail = (email) => {
    const emailExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailExp.test(email);
  };
  const handleChange = (e) => {
    setBasicDetails({ ...basicDetails, [e.target.name]: e.target.value });
    setErrors((prev) => ({
      ...prev,
      frontend: { ...prev.frontend, [e.target.name]: "" },
    }));
  };
  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setBasicDetails({ ...basicDetails, gender: e.target.value });
  };
  const validateForm = () => {
    const newErrors = {};
    if (!basicDetails.name) newErrors.name = "First name is required";
    if (!basicDetails.phone || !/^\d{10}$/.test(basicDetails.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!basicDetails.email) newErrors.email = "Email is required";
    if (basicDetails.email && !validateEmail(basicDetails.email))
      newErrors.email = "Please enter a valid email address";
    if (!basicDetails.password) newErrors.password = "Password is required";
    if (!basicDetails.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (basicDetails.password !== basicDetails.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };
  const handleContinue = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, frontend: validationErrors }));
      return;
    }
    nextStep();
  };
  const userTypes = [
    { value: "user", label: "Patient" },
    { value: "hospital", label: "Doctor" },
  ];
  return (
    <div
      className={
        dark === "dark"
          ? "auth-step-card auth-step-card-dark"
          : "auth-step-card"
      }
    >
      <form className="auth-form">
        <div className="medsync-auth-toggle">
          {userTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              className={`medsync-auth-toggle-btn${basicDetails.type === type.value ? " active" : ""}`}
              onClick={() =>
                setBasicDetails({ ...basicDetails, type: type.value })
              }
            >
              {type.label}
            </button>
          ))}
        </div>
        <h2 className="medsync-auth-form-title">
          Register as {basicDetails.type === "user" ? "Patient" : "Doctor"}
        </h2>
        <div className="medsync-auth-form-row">
          <input
            type="text"
            name="name"
            placeholder="First Name"
            value={basicDetails.name}
            onChange={handleChange}
            className="medsync-auth-input"
          />
          <input
            type="text"
            name="surname"
            placeholder="Last Name"
            value={basicDetails.surname || ""}
            onChange={handleChange}
            className="medsync-auth-input"
          />
        </div>
        <div className="medsync-auth-form-row">
          <input
            type="email"
            name="email"
            placeholder="Your Email *"
            value={basicDetails.email}
            onChange={handleChange}
            className="medsync-auth-input"
          />
          <input
            type="text"
            name="phone"
            placeholder="Your Phone *"
            value={basicDetails.phone}
            onChange={handleChange}
            className="medsync-auth-input"
          />
        </div>
        <div className="medsync-auth-form-row">
          <div className="medsync-auth-password-wrapper">
            <input
              type={showPassword.password ? "text" : "password"}
              name="password"
              placeholder="Password *"
              value={basicDetails.password}
              onChange={handleChange}
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
          <div className="medsync-auth-password-wrapper">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password *"
              value={basicDetails.confirmPassword}
              onChange={handleChange}
              className="medsync-auth-input"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="medsync-auth-password-toggle"
            >
              {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="medsync-auth-form-row medsync-auth-gender-row">
          <label className="medsync-auth-gender-label">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === "male"}
              onChange={handleGenderChange}
            />{" "}
            Male
          </label>
          <label className="medsync-auth-gender-label">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === "female"}
              onChange={handleGenderChange}
            />{" "}
            Female
          </label>
        </div>
        <div className="medsync-auth-form-row">
          <Link to="/login" className="medsync-auth-link">
            Already have an account?
          </Link>
        </div>
        <button
          type="submit"
          className="medsync-auth-btn"
          onClick={handleContinue}
        >
          Register
        </button>
        {/* Error messages */}
        {Object.values(errors.frontend).map(
          (err, idx) =>
            err && (
              <span className="error" key={idx}>
                {err}
              </span>
            )
        )}
      </form>
    </div>
  );
}

export default StepOne;
