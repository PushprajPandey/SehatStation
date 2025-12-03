import React from "react";
import MultiStepRegistration from "../components/MultiStepRegistration";
import "../styles/Login.css";
import { useRecoilValue } from "recoil"; // Import Recoil to use the dark mode state
import { mode } from "../store/atom"; // Import dark mode atom

function Registration() {
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
            Register to access appointments, hospitals, and more.
          </p>
        </div>
        {/* Right side: registration form */}
        <div className="medsync-auth-right">
          <h2 className="medsync-auth-form-title">Register</h2>
          <MultiStepRegistration />
        </div>
      </div>
    </div>
  );
}

export default Registration;
