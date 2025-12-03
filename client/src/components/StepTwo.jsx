import { useState, useContext } from "react";
import { useRecoilValue } from "recoil";
import RegistrationContext from "../store/RegistrationContext";
import { isEmpty } from "lodash";
import { mode } from "../store/atom"; // Importing the atom for mode

const btnDivStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "5px",
};

function StepTwo() {
  const { basicDetails, otherDetails, setOtherDetails, nextStep, prevStep } =
    useContext(RegistrationContext);
  const { street, city, state, postalCode } = otherDetails.address;
  const [errors, setErrors] = useState({ frontend: {}, backend: {} });
  const dark = useRecoilValue(mode);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "department") {
      // Multi-select department
      setOtherDetails((prevDetails) => {
        let newDepartments = Array.isArray(prevDetails.department)
          ? [...prevDetails.department]
          : [];
        if (checked) {
          if (!newDepartments.includes(value)) newDepartments.push(value);
        } else {
          newDepartments = newDepartments.filter((d) => d !== value);
        }
        return { ...prevDetails, department: newDepartments };
      });
      setErrors((prev) => ({
        ...prev,
        frontend: { ...prev.frontend, department: "" },
      }));
      return;
    }
    if (name in otherDetails.address) {
      setOtherDetails((prevDetails) => ({
        ...prevDetails,
        address: {
          ...prevDetails.address,
          [name]: value,
        },
      }));
    } else {
      setOtherDetails({ ...otherDetails, [name]: value });
    }
    setErrors((prev) => ({
      ...prev,
      frontend: { ...prev.frontend, [name]: "" },
    }));
  };

  const handleCommaSeparatedValues = (e) => {
    const { name, value } = e.target;
    setOtherDetails((prevDetails) => ({
      ...prevDetails,
      [name]: [...prevDetails.medicalHistory, ...value.trim().split(",")],
    }));
    setErrors((prev) => ({
      ...prev,
      frontend: { ...prev.frontend, [name]: "" },
    }));
  };

  const validateForm = () => {
    const { street, city, state, postalCode } = otherDetails.address;
    const newErrors = {};
    if (!street) newErrors.street = "Street is required";
    if (!city) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";
    if (!postalCode) newErrors.postalCode = "Pin Code is required";
    if (basicDetails.type === "user") {
      if (!otherDetails.gender) newErrors.gender = "Gender is required";
      if (!otherDetails.dob) newErrors.dob = "DOB is required";
    }
    if (basicDetails.type === "hospital") {
      if (isEmpty(otherDetails.department))
        newErrors.department = "Departments is required";
      if (isEmpty(otherDetails.availableServices))
        newErrors.availableServices = "At least one service is required";
    }
    return newErrors;
  };

  const handleContinue = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, frontend: validationErrors }));
      return;
    }
    nextStep();
  };

  return (
    <div
      className={
        dark === "dark"
          ? "auth-step-card auth-step-card-dark"
          : "auth-step-card"
      }
    >
      <form className="auth-form">
        <h2
          className={
            dark === "dark"
              ? "auth-step-title auth-step-title-dark"
              : "auth-step-title"
          }
        >
          Address
        </h2>
        <div className="auth-step-section address-grid">
          <div className="address-field">
            <label
              htmlFor="street"
              className={dark === "dark" ? "auth-step-label-dark" : ""}
            >
              Street <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="street"
              type="text"
              name="street"
              placeholder="Enter street details"
              value={street}
              onChange={handleChange}
              required
              className={dark === "dark" ? "auth-step-input-dark" : ""}
            />
            <span className="helper-text"></span>
            {errors.frontend.street && (
              <span className="error">{errors.frontend.street}</span>
            )}
            {errors.backend.street && (
              <span className="error">{errors.backend.street}</span>
            )}
          </div>
          <div className="address-field">
            <label
              htmlFor="city"
              className={dark === "dark" ? "auth-step-label-dark" : ""}
            >
              City <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="city"
              type="text"
              name="city"
              placeholder="Enter your city"
              value={city}
              onChange={handleChange}
              required
              className={dark === "dark" ? "auth-step-input-dark" : ""}
            />
            <span className="helper-text"></span>
            {errors.frontend.city && (
              <span className="error">{errors.frontend.city}</span>
            )}
            {errors.backend.city && (
              <span className="error">{errors.backend.city}</span>
            )}
          </div>
        </div>
        <div className="auth-step-section address-grid">
          <div className="address-field">
            <label
              htmlFor="state"
              className={dark === "dark" ? "auth-step-label-dark" : ""}
            >
              State <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="state"
              type="text"
              name="state"
              placeholder="Enter your state"
              value={state}
              onChange={handleChange}
              required
              className={dark === "dark" ? "auth-step-input-dark" : ""}
            />
            <span className="helper-text"></span>
            {errors.frontend.state && (
              <span className="error">{errors.frontend.state}</span>
            )}
            {errors.backend.state && (
              <span className="error">{errors.backend.state}</span>
            )}
          </div>
          <div className="address-field">
            <label
              htmlFor="postalCode"
              className={dark === "dark" ? "auth-step-label-dark" : ""}
            >
              Pin Code <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              name="postalCode"
              placeholder="Enter Pin code"
              value={postalCode}
              onChange={handleChange}
              required
              className={dark === "dark" ? "auth-step-input-dark" : ""}
            />
            <span className="helper-text"></span>
            {errors.frontend.postalCode && (
              <span className="error">{errors.frontend.postalCode}</span>
            )}
            {errors.backend.postalCode && (
              <span className="error">{errors.backend.postalCode}</span>
            )}
          </div>
        </div>
        <h2
          className={
            dark === "dark"
              ? "auth-step-title auth-step-title-dark"
              : "auth-step-title"
          }
        >
          Other Info
        </h2>
        {basicDetails.type === "hospital" && (
          <div className="auth-step-section other-info-grid">
            <div className="other-info-field">
              <label
                htmlFor="website"
                className={dark === "dark" ? "auth-step-label-dark" : ""}
              >
                Website
              </label>
              <input
                id="website"
                type="text"
                name="website"
                placeholder="www.hospital.com"
                value={otherDetails.website}
                onChange={handleChange}
                required
                className={dark === "dark" ? "auth-step-input-dark" : ""}
              />
              <span className="helper-text"></span>
            </div>
            <div className="other-info-field">
              <label className={dark === "dark" ? "auth-step-label-dark" : ""}>
                Department <span style={{ color: "red" }}>*</span>
              </label>
              <div className="pill-select-group">
                {[
                  "cardiology",
                  "neurology",
                  "orthopedics",
                  "pediatrics",
                  "gynecology",
                  "dermatology",
                ].map((dept) => {
                  const selected =
                    Array.isArray(otherDetails.department) &&
                    otherDetails.department.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      className={selected ? "pill-btn selected" : "pill-btn"}
                      onClick={() => {
                        setOtherDetails((prevDetails) => {
                          let newDepartments = Array.isArray(
                            prevDetails.department
                          )
                            ? [...prevDetails.department]
                            : [];
                          if (selected) {
                            newDepartments = newDepartments.filter(
                              (d) => d !== dept
                            );
                          } else {
                            newDepartments.push(dept);
                          }
                          return { ...prevDetails, department: newDepartments };
                        });
                        setErrors((prev) => ({
                          ...prev,
                          frontend: { ...prev.frontend, department: "" },
                        }));
                      }}
                    >
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </button>
                  );
                })}
              </div>
              <div className="pill-selected-list">
                {Array.isArray(otherDetails.department) &&
                  otherDetails.department.length > 0 &&
                  otherDetails.department.map((dept) => (
                    <span key={dept} className="pill-selected">
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      <button
                        type="button"
                        className="pill-remove"
                        onClick={() => {
                          setOtherDetails((prevDetails) => {
                            let newDepartments = Array.isArray(
                              prevDetails.department
                            )
                              ? [...prevDetails.department]
                              : [];
                            newDepartments = newDepartments.filter(
                              (d) => d !== dept
                            );
                            return {
                              ...prevDetails,
                              department: newDepartments,
                            };
                          });
                          setErrors((prev) => ({
                            ...prev,
                            frontend: { ...prev.frontend, department: "" },
                          }));
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
              <span className="helper-text">
                Click to select or remove departments
              </span>
              {errors.frontend.department && (
                <span className="error">{errors.frontend.department}</span>
              )}
              {errors.backend.department && (
                <span className="error">{errors.backend.department}</span>
              )}
            </div>
            <div className="other-info-field" style={{ gridColumn: "1 / -1" }}>
              <label
                htmlFor="availableServices"
                className={dark === "dark" ? "auth-step-label-dark" : ""}
              >
                Available Services <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="availableServices"
                type="text"
                name="availableServices"
                placeholder="OPD, Cancer Treatment, etc.. "
                value={otherDetails.availableServices}
                onChange={handleCommaSeparatedValues}
                className={dark === "dark" ? "auth-step-input-dark" : ""}
              />
              <span className="helper-text">
                Separate with commas, e.g. OPD, Cancer Treatment
              </span>
              {errors.frontend.availableServices && (
                <span className="error">
                  {errors.frontend.availableServices}
                </span>
              )}
              {errors.backend.availableServices && (
                <span className="error">
                  {errors.backend.availableServices}
                </span>
              )}
            </div>
          </div>
        )}
        {basicDetails.type === "user" && (
          <>
            <div className="auth-step-section">
              <label
                htmlFor="dob"
                className={dark === "dark" ? "auth-step-label-dark" : ""}
              >
                DOB <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="dob"
                type="date"
                name="dob"
                placeholder="DD/MM/YYYY"
                required
                value={otherDetails.dob}
                onChange={handleChange}
                className={dark === "dark" ? "auth-step-input-dark" : ""}
              />
              {errors.frontend.dob && (
                <span className="error">{errors.frontend.dob}</span>
              )}
              {errors.backend.dob && (
                <span className="error">{errors.backend.dob}</span>
              )}
            </div>
            <div className="auth-step-section">
              <label
                htmlFor="gender"
                className={dark === "dark" ? "auth-step-label-dark" : ""}
              >
                Gender <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={otherDetails.gender}
                onChange={handleChange}
                required
                className={dark === "dark" ? "auth-step-input-dark" : ""}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.frontend.gender && (
                <span className="error">{errors.frontend.gender}</span>
              )}
              {errors.backend.gender && (
                <span className="error">{errors.backend.gender}</span>
              )}
            </div>
          </>
        )}
        <div className="auth-step-btn-row">
          <button
            type="button"
            onClick={prevStep}
            className={
              dark === "dark" ? "auth-button auth-button-dark" : "auth-button"
            }
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className={
              dark === "dark" ? "auth-button auth-button-dark" : "auth-button"
            }
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export default StepTwo;
