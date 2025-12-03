import React, { useContext, useState } from "react";
import { useRecoilValue } from "recoil";
import { mode } from "../store/atom"; // Importing the mode atom for dark mode
import RegistrationContext from "../store/RegistrationContext";
import { notify } from "../components/notification";
import { useNavigate } from "react-router-dom";
import { databaseUrls } from "../data/databaseUrls";

const btnDivStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "5px",
};

const renderFields = (key, value, dark) => {
  if (
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0) ||
    (typeof value === "string" && key === "password") ||
    key === "confirmPassword"
  ) {
    return null; // Don't render empty fields
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      <div key={key}>
        {Object.entries(value).map(([nestedKey, nestedValue]) =>
          renderFields(nestedKey, nestedValue, dark)
        )}
      </div>
    );
  } else if (Array.isArray(value)) {
    return (
      <div key={key}>
        <h3
          className={`font-bold mb-1 ${dark === "dark" ? "text-yellow-400" : "text-gray-700"}`}
        >
          {`${key.charAt(0).toUpperCase() + key.slice(1)}:`}
        </h3>
        {value.map((item) => (
          <h3
            key={key}
            className={`ml-1 mb-1 ${dark === "dark" ? "text-yellow-400" : "text-gray-500"}`}
          >
            {`${item}`}
          </h3>
        ))}
      </div>
    );
  } else {
    return (
      <h1
        className={`mb-2 font-bold ${dark === "dark" ? "text-yellow-400" : "text-gray-700"}`}
      >
        {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
      </h1>
    );
  }
};

function ReviewDetails() {
  const { basicDetails, otherDetails, prevStep } =
    useContext(RegistrationContext);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dark = useRecoilValue(mode);

  const handleRegister = async (e) => {
    e.preventDefault();
    const endpoint = databaseUrls.auth.register;
    const payload = { ...basicDetails, ...otherDetails };
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        notify("Registration successful", "success");
        navigate("/login");
      } else {
        notify(
          data.message ||
            (data.error && data.error.message) ||
            "An error occurred. Please try again.",
          "warn"
        );
      }
    } catch (error) {
      notify("Error connecting to the server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        dark === "dark"
          ? "auth-step-card auth-step-card-dark"
          : "auth-step-card"
      }
    >
      <h2
        className={
          dark === "dark"
            ? "auth-step-title auth-step-title-dark"
            : "auth-step-title"
        }
      >
        Review and Register
      </h2>
      <div
        className="auth-step-section"
        style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}
      >
        <div style={{ flex: 1 }}>
          {Object.entries(basicDetails).map(([key, value]) =>
            renderFields(key, value, dark)
          )}
        </div>
        <div style={{ flex: 1 }}>
          {Object.entries(otherDetails).map(([key, value]) =>
            renderFields(key, value, dark)
          )}
        </div>
      </div>
      <div className="auth-step-btn-row">
        <button
          type="button"
          className={
            dark === "dark" ? "auth-button auth-button-dark" : "auth-button"
          }
          onClick={prevStep}
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="button"
          className={
            dark === "dark" ? "auth-button auth-button-dark" : "auth-button"
          }
          onClick={handleRegister}
          disabled={isLoading}
        >
          {!isLoading ? (
            "Register"
          ) : (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span className="ml-2">Registering</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ReviewDetails;
