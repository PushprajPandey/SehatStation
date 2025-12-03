import React from "react";

const AboutDoctor = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
        }}
      >
        About Doctor
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          lineHeight: "1.7",
          marginBottom: "1.2rem",
        }}
      >
        Welcome to the About Doctor page!
        <br />
        <br />
        Here you will find information about our team of experienced and
        dedicated doctors who are committed to providing the best healthcare
        services to our patients. Each doctor brings a wealth of knowledge and
        expertise in their respective fields, ensuring comprehensive and
        personalized care for every patient.
      </p>
      <ul style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>
        <li>Highly qualified specialists in various medical fields</li>
        <li>Patient-centric approach and compassionate care</li>
        <li>Continuous learning and professional development</li>
        <li>Commitment to ethical medical practices</li>
      </ul>
      <p style={{ fontSize: "1.1rem" }}>
        Thank you for trusting SehatStation doctors with your health. We are
        dedicated to your well-being and strive to deliver the highest standards
        of medical care.
      </p>
    </div>
  );
};

export default AboutDoctor;
