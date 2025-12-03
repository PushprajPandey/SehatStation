import React, { useState, useEffect, useCallback, useContext } from "react";
import { NavLink } from "react-router-dom";
import { IoMenu, IoClose } from "react-icons/io5";
import { FaHome, FaHospital, FaUserPlus, FaHospitalAlt } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdOutlineLocalHospital, MdLogin, MdDarkMode } from "react-icons/md";
import { WiDaySunny } from "react-icons/wi";
import { useRecoilState } from "recoil";
import { mode } from "../store/atom";
import { UserContext } from "../store/userContext";
import PropTypes from "prop-types";
import { FiUser } from "react-icons/fi"; // New icon for user placeholder

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useRecoilState(mode);
  const [isNavbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Access isAuthenticated, user, and handleLogout from UserContext
  const { isAuthenticated, user, handleLogout } = useContext(UserContext);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const handleToggleMode = () => {
    setDark(dark === "light" ? "dark" : "light");
  };

  // Scroll event listener
  const controlNavbar = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.scrollY > lastScrollY) {
        // If scrolled down
        setNavbarVisible(false);
      } else {
        // If scrolled up
        setNavbarVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);

      // Cleanup function
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY, controlNavbar]);

  return (
    <nav
      className={`${
        dark === "dark"
          ? "bg-gradient-to-r from-gray-900/95 via-gray-900/95 to-black/95 text-gray-100 border-b border-gray-800"
          : "bg-gradient-to-r from-white/95 via-blue-50/95 to-white/95 text-gray-900 border-b border-blue-100"
      } fixed top-0 z-[100] w-full backdrop-blur-md transition-all duration-300 ease-in-out ${
        isNavbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 group transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <img
              src="../favicon.png"
              className="h-10 w-10 transition-transform duration-300 group-hover:rotate-6"
              alt="SehatStation Logo"
            />
            <span
              className={`text-2xl font-bold ${
                dark === "dark"
                  ? "bg-gradient-to-r from-blue-400 to-blue-200"
                  : "bg-gradient-to-r from-blue-700 to-blue-500"
              } bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-400 transition-all duration-300`}
            >
              SehatStation
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={handleToggleMode}
              className={`p-2 rounded-full transition-all duration-300 ${
                dark === "light"
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {dark === "light" ? (
                <WiDaySunny size={24} />
              ) : (
                <MdDarkMode size={24} />
              )}
            </button>

            {/* Navigation Links */}
            <div className="flex items-center gap-6 text-base font-medium">
              {[
                { to: "/", icon: <FaHome />, label: "Home" },
                { to: "/about", icon: <AiOutlineInfoCircle />, label: "About" },
                ...(!isAuthenticated
                  ? [
                      {
                        to: "/hospitals",
                        icon: <FaHospital />,
                        label: "Hospitals",
                      },
                    ]
                  : []),
                ...(isAuthenticated && user?.role === "user"
                  ? [
                      {
                        to: "/labtest",
                        icon: <MdOutlineLocalHospital />,
                        label: "Lab Tests",
                      },
                      {
                        to: "/hospitals-around",
                        icon: <FaHospitalAlt />,
                        label: "Hospitals Around",
                      },
                    ]
                  : []),
                ...(isAuthenticated && user?.role === "hospital"
                  ? [
                      {
                        to: "/hospitals-around",
                        icon: <FaHospitalAlt />,
                        label: "Hospitals Around",
                      },
                    ]
                  : []),
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center gap-2 py-2 px-3 rounded-full transition-all duration-300
                    ${
                      isActive
                        ? dark === "dark"
                          ? "bg-gray-800 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : "hover:bg-opacity-10 hover:bg-blue-500"
                    }
                  `}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/profile"
                  className={`flex items-center gap-2 py-2 px-4 rounded-full ${
                    dark === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-blue-50 hover:bg-blue-100"
                  } transition-all duration-300`}
                >
                  <FiUser className="text-xl" />
                  <span className="font-medium">
                    {user?.name || user?.hospitalName}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className={`py-2 px-6 rounded-full font-medium transition-all duration-300 ${
                    dark === "dark"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/login"
                  className={`py-2 px-6 rounded-full font-medium transition-all duration-300 ${
                    dark === "dark"
                      ? "bg-gray-800 hover:bg-gray-700 text-white"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                  }`}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={`py-2 px-6 rounded-full font-medium transition-all duration-300 ${
                    dark === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg transition-colors duration-300"
          >
            {isMobileMenuOpen ? (
              <IoClose className="text-2xl" />
            ) : (
              <IoMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden ${
            dark === "dark"
              ? "bg-gray-900/95 border-t border-gray-800"
              : "bg-white/95 border-t border-gray-100"
          } backdrop-blur-md`}
        >
          <div
            className={`${
              dark === "dark"
                ? "bg-gradient-to-r from-gray-700 via-gray-900 to-black text-gray-100"
                : "bg-[linear-gradient(90deg,_#a1c4fd_0%,_#c2e9fb_100%)] text-black"
            } lg:hidden absolute z-[100] flex text-xl md:text-2xl flex-col items-start pl-8 md:pl-12 gap-5 md:gap-7 top-16 md:top-[72px] w-full left-0 py-7 md:py-9 h-fit`}
          >
            <button
              onClick={handleToggleMode}
              className={`p-2 rounded-full transition-all duration-300 ${
                dark === "light"
                  ? "bg-blue-200 text-blue-600 hover:bg-blue-300"
                  : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {dark === "light" ? <WiDaySunny /> : <MdDarkMode />}
            </button>

            {/* Navbar Links */}
            <NavLink
              className={({ isActive }) =>
                `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
              }
              to="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome />
              <p className="hover:brightness-50 hover:font-semibold">Home</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
              }
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
            >
              <AiOutlineInfoCircle />
              <p className="hover:brightness-50 hover:font-semibold">About</p>
            </NavLink>

            {/* Conditional Links */}
            {!isAuthenticated && (
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
                }
                to="/hospitals"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaHospital />
                <p className="hover:brightness-50 hover:font-semibold">
                  Hospitals
                </p>
              </NavLink>
            )}

            {/* Show Lab Tests and Hospitals Around for regular user */}
            {isAuthenticated && user?.role === "user" && (
              <>
                <NavLink
                  className={({ isActive }) =>
                    `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
                  }
                  to="/labtest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MdOutlineLocalHospital />
                  <p className="hover:brightness-50 hover:font-semibold">
                    Lab Tests
                  </p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
                  }
                  to="/hospitals-around"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaHospitalAlt />
                  <p className="hover:brightness-50 hover:font-semibold">
                    Hospitals Around
                  </p>
                </NavLink>
              </>
            )}

            {/* Show only Hospitals Around for hospital */}
            {isAuthenticated && user?.role === "hospital" && (
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
                }
                to="/hospitals-around"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaHospitalAlt />
                <p className="hover:brightness-50 hover:font-semibold">
                  Hospitals Around
                </p>
              </NavLink>
            )}

            {isAuthenticated ? (
              <>
                {/* Profile Avatar with Name */}
                <NavLink
                  className={({ isActive }) =>
                    `${isActive ? "border-b border-white " : ""} flex gap-2 items-baseline`
                  }
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {" "}
                  <FiUser className="text-xl" />
                  <p className="hover:brightness-50 hover:font-semibold">
                    {user?.name || user?.hospitalName}
                  </p>
                </NavLink>

                <button
                  className="bg-white px-5 py-1 rounded-lg text-black font-bold hover:brightness-75"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 flex-col xs:flex-row w-full xs:w-auto pr-4 xs:pr-0">
                <NavLink
                  className="bg-white flex gap-2 w-full xs:w-auto items-center px-3 xs:px-4 py-1 rounded-lg text-black font-bold hover:brightness-75 login-btn"
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MdLogin />
                  Login
                </NavLink>
                <NavLink
                  className="bg-white flex gap-2 w-full xs:w-auto items-center px-3 xs:px-4 py-1 rounded-lg text-black font-bold hover:brightness-75"
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserPlus />
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

Navbar.propTypes = {
  user: PropTypes.object,
};

export default Navbar;
