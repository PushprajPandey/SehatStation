import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clipboard, PhoneCall, Hospital } from 'lucide-react';
import Navbar from '../components/Navbar';
import StaticLineChart from '../components/Chart';
import Review from '../components/Review';
import TableComponent from '../components/TableComponent';
import PatientDistributionChart from '../components/PatientDistributionChart';
import '../styles/Home.css';
import { useRecoilValue } from 'recoil';
import { mode } from '../store/atom';

const ServiceCard = ({ icon: Icon, title, details }) => {
  const dark = useRecoilValue(mode);
  return (
    <motion.div
      className={`rounded-3xl p-8 flex flex-col items-end justify-between backdrop-blur-sm ${
        dark === 'dark' 
          ? 'bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 text-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
          : 'bg-gradient-to-br from-white/90 via-blue-50/90 to-blue-100/90 text-gray-800 shadow-[0_8px_30px_rgb(59,130,246,0.12)]'
      } border border-opacity-10 ${dark === 'dark' ? 'border-white' : 'border-blue-500'}`}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-2xl mb-6 ${
          dark === 'dark' 
            ? 'bg-blue-500/10' 
            : 'bg-blue-500/10'
        }`}>
          <Icon size={48} className={`${
            dark === 'dark' 
              ? 'text-blue-400' 
              : 'text-blue-600'
          }`} />
        </div>
        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
          {title}
        </h3>
        <p className={`mb-8 leading-relaxed ${
          dark === 'dark' 
            ? 'text-gray-300' 
            : 'text-gray-600'
        }`}>
          {details}
        </p>
      </div>
      <Link 
        className={`group flex items-center gap-2 font-medium ${
          dark === 'dark' 
            ? 'text-blue-400' 
            : 'text-blue-600'
        }`}
      >
        Read more 
        <span className="transition-all duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100">→</span>
      </Link>
    </motion.div>
  );
};

const Button = ({ children, primary, to }) => {
  const dark = useRecoilValue(mode);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Link
        to={to}
        className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
          primary
            ? dark === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]'
              : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]'
            : dark === 'dark'
              ? 'bg-gray-800/80 text-gray-200 hover:bg-gray-700/80 border border-blue-500/30 hover:border-blue-500/50'
              : 'bg-white/80 text-blue-600 hover:bg-blue-50/80 border border-blue-500/30 hover:border-blue-500/50'
        } backdrop-blur-sm`}
      >
        {children}
      </Link>
    </motion.div>
  );
};

function Home() {
  const dark = useRecoilValue(mode);
  const services = [
    {
      icon: Clipboard,
      title: 'Easy Registration',
      details:
        'Quickly and easily register for your OPD appointment with just a few simple steps. Save time by avoiding long waits and secure your preferred time slot hassle-free.',
    },
    {
      icon: Hospital,
      title: 'Medical Resource Data Sharing',
      details:
        'Stay updated on the latest data regarding hospital equipment to ensure you have access to the most current information.',
    },
    {
      icon: PhoneCall,
      title: '24/7 Support',
      details:
        "We are here to assist you at any time of the day, ensuring you receive the support you need whenever it's convenient for you.",
    },
  ];

  return (
    <>
      {/*google-site-verification: google702f0a7aa8f19d22.html*/}
      <div className={`min-h-screen ${
        dark === 'dark' 
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black' 
          : 'bg-gradient-to-b from-blue-50 via-white to-blue-50'
      }`}>
        <Navbar />

        <header className={`relative py-32 md:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden ${
          dark === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
            : 'bg-gradient-to-br from-blue-100 via-white to-blue-50 text-gray-900'
        }`}>
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          </motion.div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
            >
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                dark === 'dark'
                  ? 'from-blue-400 via-blue-500 to-blue-600'
                  : 'from-blue-600 via-blue-700 to-blue-800'
              }`}>
                Revolutionizing
              </span>
              <br />
              <span className={`${
                dark === 'dark' 
                  ? 'text-gray-200' 
                  : 'text-gray-900'
              }`}>
                OPD Registration
              </span>
            </motion.h1>

            <motion.p
              className={`text-xl sm:text-2xl md:text-3xl mb-12 max-w-3xl font-medium ${
                dark === 'dark' 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
              }`}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Skip the queue and get the care you need faster.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Button to="/opd-registration" primary>Book Appointment</Button>
              <Button to="/services">Explore Services</Button>
            </motion.div>
          </div>

          {/* Enhanced floating elements */}
          <motion.div
            className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section className="mb-20">
            <motion.h2
              className={`text-4xl font-bold text-center mb-16 ${
                dark === 'dark' 
                  ? 'text-blue-400' 
                  : 'text-blue-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our Services
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              transition={{ staggerChildren: 0.2 }}
            >
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </motion.div>
            <motion.div className="flex justify-center items-center">
              <Button to="/services">View All</Button>
            </motion.div>
          </section>

          <section className="mb-20">
            <motion.h2
              className={`text-4xl font-bold text-center mb-16 ${
                dark === 'dark' 
                  ? 'text-blue-400' 
                  : 'text-blue-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Insights and Analytics
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <motion.div
                className={`rounded-2xl shadow-lg p-6 ${
                  dark === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm'
                    : 'bg-white'
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className={`text-xl font-semibold mb-6 ${
                  dark === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Patient Flow Analysis
                </h3>
                <div className="h-64">
                  <StaticLineChart />
                </div>
              </motion.div>

              <motion.div
                className={`rounded-2xl shadow-lg p-6 ${
                  dark === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm'
                    : 'bg-white'
                }`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className={`text-xl font-semibold mb-6 ${
                  dark === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Patient Distribution
                </h3>
                <PatientDistributionChart />
              </motion.div>
            </div>

            <motion.div
              className={`rounded-2xl shadow-lg p-6 ${
                dark === 'dark'
                  ? 'bg-gray-800/50 backdrop-blur-sm'
                  : 'bg-white'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className={`text-xl font-semibold mb-6 ${
                dark === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Time Slot Distribution
              </h3>
              <TableComponent />
            </motion.div>
          </section>

          <Review />
        </main>
      </div>
    </>
  );
}

export default Home;
