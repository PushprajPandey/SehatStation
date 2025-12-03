import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import styled from 'styled-components';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import { useRecoilValue } from 'recoil'; // Import Recoil
import { mode } from '../store/atom'; // Import the mode atom
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';



const AboutPage = () => {
  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  const slideIn = useSpring({
    transform: 'translateX(0%)',
    from: { transform: 'translateX(-100%)' },
    config: { duration: 1000 },
  });

  const [viewed, setViewed] = useState({
    users: false,
    opd: false,
    accidents: false,
    hospitals: false,
  });

  const dark = useRecoilValue(mode);

  return (
    <Container className={`${
      dark === 'dark'
        ? 'relative text-white py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-700 via-gray-900 to-black overflow-hidden'
        : 'relative text-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-white overflow-hidden'
    }`} dark={dark}>
      <animated.div style={fadeIn}>
        {/* Vision and Mission Section */}
        <VisionMissionContainer>
          <Box dark={dark}>
            <VisionTitle dark={dark} className="font-semibold">
              Our Vision
            </VisionTitle>
            <VisionText dark={dark} className="font-sans">
              At Med-Sync, we envision a world where accessing outpatient care
              is as simple as a few clicks. By leveraging technology and
              innovation, we aim to provide a platform that bridges the gap
              between patients and healthcare providers, making high-quality
              care accessible to everyone, anywhere.
            </VisionText>
          </Box>
          <Box dark={dark}>
            <MissionTitle dark={dark} className="font-semibold">
              Our Mission
            </MissionTitle>
            <MissionText dark={dark} className="font-sans">
              Our mission is to revolutionize outpatient care by creating a
              comprehensive, easy-to-use platform that empowers patients and
              healthcare providers alike. We are committed to building
              technology that simplifies healthcare processes, improves access,
              and enhances patient experience.
            </MissionText>
          </Box>
        </VisionMissionContainer>

        {/* Core Values Section */}
        <motion.section 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-3xl font-bold text-center mb-12 ${
            dark === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "Continuously evolving our technology to meet healthcare challenges",
                icon: "🔬"
              },
              {
                title: "Accessibility",
                description: "Making quality healthcare available to everyone, everywhere",
                icon: "🌍"
              },
              {
                title: "Security",
                description: "Ensuring the highest standards of data protection and privacy",
                icon: "🔒"
              },
              {
                title: "Excellence",
                description: "Maintaining superior quality in all our services",
                icon: "⭐"
              },
              {
                title: "Empathy",
                description: "Understanding and addressing patient needs with care",
                icon: "💝"
              },
              {
                title: "Collaboration",
                description: "Working together with healthcare providers for better outcomes",
                icon: "🤝"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl ${
                  dark === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm'
                    : 'bg-white shadow-lg'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className={`text-xl font-bold mb-2 ${
                  dark === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {value.title}
                </h3>
                <p className={dark === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Impact Statistics Section */}
        <StatsSection>
          <StatItem>
            <VisibilitySensor
              partialVisibility
              onChange={(isVisible) => {
                if (isVisible) setViewed(prev => ({ ...prev, users: true }));
              }}
            >
              {({ isVisible }) => (
                <StatNumber>
                  {viewed.users || isVisible ? (
                    <CountUp start={0} end={1234} duration={3} suffix="+" />
                  ) : (
                    "1234+"
                  )}
                </StatNumber>
              )}
            </VisibilitySensor>
            Active Users
          </StatItem>

          <StatItem>
            <VisibilitySensor
              partialVisibility
              onChange={(isVisible) => {
                if (isVisible) setViewed(prev => ({ ...prev, opd: true }));
              }}
            >
              {({ isVisible }) => (
                <StatNumber>
                  {viewed.opd || isVisible ? (
                    <CountUp start={0} end={567} duration={3} suffix="+" />
                  ) : (
                    "567+"
                  )}
                </StatNumber>
              )}
            </VisibilitySensor>
            Successful Appointments
          </StatItem>

          <StatItem>
            <VisibilitySensor
              partialVisibility
              onChange={(isVisible) => {
                if (isVisible) setViewed(prev => ({ ...prev, hospitals: true }));
              }}
            >
              {({ isVisible }) => (
                <StatNumber>
                  {viewed.hospitals || isVisible ? (
                    <CountUp start={0} end={45} duration={3} suffix="+" />
                  ) : (
                    "45+"
                  )}
                </StatNumber>
              )}
            </VisibilitySensor>
            Partner Hospitals
          </StatItem>

          <StatItem>
            <VisibilitySensor
              partialVisibility
              onChange={(isVisible) => {
                if (isVisible) setViewed(prev => ({ ...prev, accidents: true }));
              }}
            >
              {({ isVisible }) => (
                <StatNumber>
                  {viewed.accidents || isVisible ? (
                    <CountUp start={0} end={99} duration={3} suffix="%" />
                  ) : (
                    "99%"
                  )}
                </StatNumber>
              )}
            </VisibilitySensor>
            Patient Satisfaction
          </StatItem>
        </StatsSection>

        {/* Call to Action Section */}
        <JoinUsSection dark={dark}>
          <JoinUsTitle dark={dark}>Ready to Transform Healthcare?</JoinUsTitle>
          <JoinUsText dark={dark}>
            Join us in our mission to make healthcare more accessible, efficient, and patient-centric. 
            Whether you're a healthcare provider or a patient, we're here to support your journey 
            towards better healthcare management.
          </JoinUsText>
          <motion.div 
            className="mt-8 flex justify-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/register"
              className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                dark === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Get Started Today
            </Link>
          </motion.div>
        </JoinUsSection>
      </animated.div>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 100px;
  background-color: ${({ dark }) => (dark === 'dark' ? '#1a202c' : '#fff')};
  color: ${({ dark }) => (dark === 'dark' ? '#e2e8f0' : '#333')};
`;

// Two-box structure for Vision and Mission
const VisionMissionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Box = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: ${({ dark }) => (dark === 'dark' ? '#2d3748' : '#f0f8ff')};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VisionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ dark }) => (dark === 'dark' ? '#f6e05e' : '#c229b8')};
`;

const VisionText = styled.p`
  font-size: 1.125rem;
  color: ${({ dark }) => (dark === 'dark' ? '#e2e8f0' : '#161D6F')};
  line-height: 1.6;
`;

const MissionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ dark }) => (dark === 'dark' ? '#f6e05e' : '#c229b8')};
`;

const MissionText = styled.p`
  font-size: 1.125rem;
  color: ${({ dark }) => (dark === 'dark' ? '#e2e8f0' : '#333')};
  line-height: 1.6;
`;

// Team Grid
const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 1.75rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TeamCard = styled.div`
  background-color: ${({ dark }) => (dark === 'dark' ? '#2d3748' : '#F4F6FF')};
  color: ${({ dark }) => (dark === 'dark' ? '#e2e8f0' : '#333')};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 450px;
  text-align: center;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileImage = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  margin: 0 auto;
  display: block;
`;
const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;

  a {
    &:hover {
      color: ${({ dark }) =>
        dark === 'dark' ? 'white' : 'blue'}; /* Optional hover effect */
    }
  }
`;

const Name = styled.h4`
  font-size: 1.25rem;
  margin-bottom: 0.2rem;
  color: ${({ dark }) => (dark === 'dark' ? '#B7E0FF' : '#333')};
  font-weight: bold;
`;

const Role = styled.h5`
  font-size: 1rem;
  margin-bottom: 0.2rem;
  color: ${({ dark }) => (dark === 'dark' ? '#FFF4B5' : '#c229b8')};
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${({ dark }) => (dark === 'dark' ? 'white' : '#666')};
  line-height: 1.4;
`;

// Community Section
const GitTeamTitle = styled.h3`
  font-size: 2.5rem;
  color: ${({ dark }) => (dark === 'dark' ? '#f6e05e' : '#c229b8')};
  text-align: center;
  margin-top: 2rem;
`;

// Join Us Section
const JoinUsSection = styled.div`
  margin-top: 3rem;
  text-align: center;
  padding: 2rem;
  background-color: ${({ dark }) => (dark === 'dark' ? '#2d3748' : '#fff')};
  border-radius: 8px;
`;

const JoinUsTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ dark }) => (dark === 'dark' ? '#f6e05e' : '#c229b8')};
`;

const JoinUsText = styled.p`
  font-size: 1.125rem;
  color: ${({ dark }) => (dark === 'dark' ? '#e2e8f0' : '#666')};
`;

const Title = styled.h3`
  font-size: 2.5rem;
  color: ${({ dark }) => (dark === 'dark' ? '#f6e05e' : '#c229b8')};
  text-align: center;
  margin-bottom: 2rem;
  font-weight: bold;
`;

const StatsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 3rem 0;
  background-color: #e8f4f8;
  width: 100%;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.2rem;
  color: #333;
  font-weight: bold;
  width: 45%;
  margin: 1rem;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  color: #66b3ff;
  margin-bottom: 0.3rem;
`;

export default AboutPage;
