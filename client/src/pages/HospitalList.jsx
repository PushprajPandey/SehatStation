import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import "../styles/HospitalList.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UserContext } from "../store/userContext";
import hospitalsData from "../data/hospitalsData"; // Import local hospital data
import { databaseUrls } from "../data/databaseUrls";

import { useRecoilState } from "recoil";
import { mode } from "../store/atom";

const mindate = new Date().toISOString().split("T")[0];

const HospitalsList = () => {
  const [dark] = useRecoilState(mode);
  const { user } = useContext(UserContext);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  // Removed booking-related state
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [showFilterMenu, setShowFilterMenu] = useState(false); // Filter menu visibility state
  const [filters, setFilters] = useState({
    departments: "",
    availableServices: "",
    ratings: "",
  });
  const navigate = useNavigate();

  // Fetch hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(databaseUrls.hospitals.all);

        // Combine local data and fetched data
        const combinedHospitals = [...hospitalsData, ...response.data];
        setHospitals(combinedHospitals);
        setFilteredHospitals(combinedHospitals);
      } catch (error) {
        console.error("Error fetching hospitals", error);
        // Set local data as fallback in case of error
        setHospitals(hospitalsData);
        setFilteredHospitals(hospitalsData);
      }
    };

    fetchHospitals();
  }, []);

  // Removed booking handler

  // Removed booking form change handler

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter hospitals by name or address (street, city, or state)
    const filtered = hospitals.filter((hospital) => {
      const nameMatch = hospital.name?.toLowerCase().includes(query) || false;
      const address = hospital.address || {}; // Default to an empty object if address is null or undefined
      const streetMatch =
        address.street?.toLowerCase().includes(query) || false;
      const cityMatch = address.city?.toLowerCase().includes(query) || false;
      const stateMatch = address.state?.toLowerCase().includes(query) || false;

      return nameMatch || streetMatch || cityMatch || stateMatch;
    });

    setFilteredHospitals(filtered);
  };

  const handleFilterToggle = () => {
    setShowFilterMenu(!showFilterMenu); // Toggle filter menu visibility
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const filtered = hospitals.filter((hospital) => {
      const departmentMatch = filters.departments
        ? hospital.departments?.includes(filters.departments)
        : true;
      const serviceMatch = filters.availableServices
        ? hospital.availableServices?.includes(filters.availableServices)
        : true;
      const ratingMatch = filters.ratings
        ? hospital.ratings >= parseFloat(filters.ratings)
        : true;

      return departmentMatch && serviceMatch && ratingMatch;
    });

    setFilteredHospitals(filtered);
  };

  const clearFilters = () => {
    setFilters({
      departments: "",
      availableServices: "",
      ratings: "",
    });
    setFilteredHospitals(hospitals); // Reset to the full list
  };

  return (
    <>
      <Navbar />
      <div
        className={`${
          dark === "dark"
            ? "relative text-white py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-700 via-gray-900 to-black overflow-hidden"
            : "relative text-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-white overflow-hidden"
        } `}
      >
        <h2 className={`${dark === "dark" ? "text-white" : "text-black"} `}>
          SehatStation Hospitals
        </h2>

        {/* Search bar */}
        <div className="search-bar mb-4">
          <input
            type="text"
            className="form-input w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Filter menu button */}
        <div className="filter-menu mb-4">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleFilterToggle}
          >
            {showFilterMenu ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filter menu */}
        {showFilterMenu && (
          <div className="filter-options bg-gray-100 p-4 rounded mb-4">
            <div className="mb-2">
              <label className="block text-gray-700">Department:</label>
              <input
                type="text"
                name="departments"
                value={filters.departments}
                onChange={handleFilterChange}
                className="form-input w-full rounded-md border-gray-300"
                placeholder="Enter department"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Available Services:</label>
              <input
                type="text"
                name="availableServices"
                value={filters.availableServices}
                onChange={handleFilterChange}
                className="form-input w-full rounded-md border-gray-300"
                placeholder="Enter service"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Ratings (&gt;=5):</label>
              <input
                type="number"
                name="ratings"
                value={filters.ratings}
                onChange={handleFilterChange}
                className="form-input w-full rounded-md border-gray-300"
                placeholder="Enter minimum rating"
                min="1"
                max="5"
                step="0.1"
              />
            </div>

            {/* Apply and Clear Filters buttons */}
            <div className="flex justify-between mt-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Hospital cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <div
              key={hospital._id}
              className={`${dark === "dark" ? "bg-gray-800 text-white shadow-md rounded-lg overflow-hidden" : "bg-white shadow-md rounded-lg overflow-hidden"}`}
            >
              <div className="bg-blue-500 text-white px-4 py-2">
                <h5 className="text-lg font-semibold">{hospital.name}</h5>
              </div>
              <div className="p-4">
                <p
                  className={`${dark === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <strong>Address:</strong> {hospital.address?.street || "N/A"},{" "}
                  {hospital.address?.city || "N/A"},{" "}
                  {hospital.address?.state || "N/A"}
                </p>
                <p
                  className={`${dark === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <strong>Phone:</strong> {hospital.phone || "N/A"}
                </p>
                <p
                  className={`${dark === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <strong>Website:</strong>{" "}
                  <a
                    href={hospital.website}
                    className="text-blue-500 underline"
                  >
                    {hospital.website || "N/A"}
                  </a>
                </p>
                <p
                  className={`${dark === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <strong>Departments:</strong>{" "}
                  {hospital.departments?.join(", ") || "N/A"}
                </p>
                <p
                  className={`${dark === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <strong>Available Services:</strong>{" "}
                  {hospital.availableServices?.join(", ") || "N/A"}
                </p>
                <p
                  className={`${dark === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <strong>Ratings:</strong> {hospital.ratings || "N/A"}/5
                </p>
                {/* Removed Running Appointments display as requested */}
              </div>

              {/* Removed Book Appointment and More Details buttons as requested */}

              {/* Removed booking form as requested */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HospitalsList;
