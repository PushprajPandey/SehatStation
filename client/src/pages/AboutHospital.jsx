import React from "react";
import hospitalsData from "../data/hospitalsData";

const AboutHospital = () => {
  return (
    <div
      className="about-hospital-page"
      style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
        }}
      >
        About Hospital
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          lineHeight: "1.7",
          marginBottom: "1.2rem",
        }}
      >
        Welcome to SehatStation Hospital!
        <br />
        <br />
        SehatStation Hospital is dedicated to providing high-quality healthcare
        services with a focus on patient care, advanced medical technology, and
        a team of experienced professionals. Our hospital offers a wide range of
        medical services, including OPD consultations, lab tests, health
        checkups, and more. We strive to create a comfortable and safe
        environment for all our patients and visitors.
      </p>
      <ul style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>
        <li>Comprehensive OPD and specialist consultations</li>
        <li>Modern diagnostic and laboratory facilities</li>
        <li>24/7 emergency care and support</li>
        <li>Patient-centric approach and personalized treatment plans</li>
        <li>Experienced doctors, nurses, and support staff</li>
      </ul>
      <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
        Thank you for choosing SehatStation Hospital for your healthcare needs.
        We are committed to your well-being and look forward to serving you.
      </p>

      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          marginTop: "2rem",
        }}
      >
        List of Hospitals
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "1rem",
            marginBottom: "2rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f2f6fa", fontWeight: "bold" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Name
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                City
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                State
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Website
              </th>
            </tr>
          </thead>
          <tbody>
            {hospitalsData.map((hospital) => (
              <tr key={hospital._id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {hospital.name}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {hospital.address?.city || "N/A"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {hospital.address?.state || "N/A"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {hospital.website ? (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2563eb", textDecoration: "underline" }}
                    >
                      {hospital.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AboutHospital;
