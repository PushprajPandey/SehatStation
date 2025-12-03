import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FaMapPin, FaHospital } from "react-icons/fa"; // Import the icons
import ReactDOMServer from "react-dom/server"; // Import ReactDOMServer to render icons to HTML
import { useRecoilState } from "recoil";
import { mode } from "../store/atom";
import "leaflet-routing-machine"; // Import Leaflet Routing Machine
import Skeleton from "@mui/material/Skeleton";
import Navbar from "../components/Navbar";
import "../styles/Nearbyhospitals.css";

const HospitalsAround = () => {
  // Separate real user location from searched location
  const [realLocation, setRealLocation] = useState({ lat: null, lng: null }); // user's true geolocation
  const [searchLocation, setSearchLocation] = useState({
    lat: null,
    lng: null,
  }); // location used for hospital search
  const [map, setMap] = useState(null);
  const [dark, setDark] = useRecoilState(mode);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [routeControl, setRouteControl] = useState(null); // State to store the current route
  const [distances, setDistances] = useState({}); // Store distances for each hospital (by index)
  const [address, setAddress] = useState("Fetching address..."); // State for the human-readable address
  const [manualMode, setManualMode] = useState(false);
  const [pickOnMap, setPickOnMap] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [addressInput, setAddressInput] = useState(""); // user-entered address/city
  const [currMarker, setCurrMarker] = useState(null); // reference to 'You are here' marker
  useEffect(() => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const successCallback = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setRealLocation({ lat: latitude, lng: longitude });
      setSearchLocation({ lat: latitude, lng: longitude }); // default search location is real location
      findHospitalsNearby(latitude, longitude);
      fetchAddress(latitude, longitude); // Fetch human-readable address
    };

    const errorCallback = (error) => {
      console.error("Error getting location: ", error);
      setLocationError(true);
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    );
  }, []);

  // Map click handler for pick-on-map mode
  useEffect(() => {
    if (!map) return;

    const onMapClick = (e) => {
      if (pickOnMap) {
        const { lat, lng } = e.latlng;
        setSearchLocation({ lat, lng });
        fetchAddress(lat, lng);
        findHospitalsNearby(lat, lng);
      }
    };

    map.on("click", onMapClick);
    return () => map.off("click", onMapClick);
  }, [map, pickOnMap]);

  // Keep the 'You are here' marker in sync when location changes
  useEffect(() => {
    if (!map || !realLocation.lat || !realLocation.lng) return;

    const currLocIconHtml = ReactDOMServer.renderToString(
      <FaMapPin style={{ color: "blue", fontSize: "24px" }} />
    );
    const currLocIcon = L.divIcon({
      html: currLocIconHtml,
      className: "",
      iconSize: [24, 24],
    });

    if (currMarker && currMarker.setLatLng) {
      try {
        currMarker.setLatLng([realLocation.lat, realLocation.lng]);
        currMarker.setIcon(currLocIcon);
        // Don't auto-center map here
      } catch (e) {
        console.error("Error updating current location marker:", e);
      }
    } else {
      // create marker if it doesn't exist
      try {
        const marker = L.marker([realLocation.lat, realLocation.lng], {
          icon: currLocIcon,
        })
          .addTo(map)
          .bindPopup("You are here!");
        setCurrMarker(marker);
      } catch (e) {
        console.error("Error creating current location marker:", e);
      }
    }
  }, [realLocation, map]);

  // Fetch human-readable address using reverse geocoding (Nominatim API)
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name); // Set the human-readable address
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Unable to fetch address");
    }
  };

  async function findHospitalsNearby(lat, lng) {
    setLoadingHospitals(true);
    const radius = 2000;

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        relation["amenity"="hospital"](around:${radius},${lat},${lng});
      );
      out center;`;

    // List of Overpass endpoints to try
    const endpoints = [
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass-api.de/api/interpreter",
      "https://overpass.openstreetmap.ru/api/interpreter",
      "https://overpass.nchc.org.tw/api/interpreter",
    ];

    let success = false;
    for (let i = 0; i < endpoints.length; i++) {
      const url = `${endpoints[i]}?data=${encodeURIComponent(query)}`;
      try {
        const response = await fetch(url);
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          // If response is not valid JSON, try next endpoint
          continue;
        }

        if (data && data.elements && data.elements.length > 0) {
          const hospitalData = data.elements.map((hospital) => {
            let hospitalLat, hospitalLng;
            if (hospital.type === "node") {
              hospitalLat = hospital.lat;
              hospitalLng = hospital.lon;
            } else if (
              hospital.type === "way" ||
              hospital.type === "relation"
            ) {
              hospitalLat = hospital.center.lat;
              hospitalLng = hospital.center.lon;
            }

            // Build a human-readable address from tags when available
            const tags = hospital.tags || {};
            const addrParts = [];
            if (tags["addr:housenumber"])
              addrParts.push(tags["addr:housenumber"]);
            if (tags["addr:street"]) addrParts.push(tags["addr:street"]);
            if (tags["addr:place"]) addrParts.push(tags["addr:place"]);
            if (tags["addr:city"]) addrParts.push(tags["addr:city"]);
            if (tags["addr:state"]) addrParts.push(tags["addr:state"]);
            const addressStr =
              addrParts.length > 0
                ? addrParts.join(", ")
                : tags["addr:full"] || tags["operator"] || "";

            return {
              name: tags.name || "Unnamed Hospital",
              lat: hospitalLat,
              lng: hospitalLng,
              address: addressStr,
            };
          });

          // Calculate distances to each hospital
          const calculatedDistances = hospitalData.reduce((acc, hospital) => {
            const distance =
              L.latLng(lat, lng).distanceTo(
                L.latLng(hospital.lat, hospital.lng)
              ) / 1000; // distance in km
            acc[hospital.name] = distance.toFixed(2); // Keep 2 decimal places
            return acc;
          }, {});

          setHospitals(hospitalData);
          setDistances(calculatedDistances); // Store distances
          success = true;
          break;
        } else {
          setHospitals([]);
          success = true;
          break;
        }
      } catch (error) {
        // Try next endpoint
        continue;
      }
    }
    if (!success) {
      setHospitals([]);
      alert(
        "Error fetching hospitals: All Overpass servers failed. Please try again later."
      );
    }
    setLoadingHospitals(false);
  }

  // Initialize map and markers
  useEffect(() => {
    if (searchLocation.lat && searchLocation.lng && !map) {
      const leafletMap = L.map("map").setView(
        [searchLocation.lat, searchLocation.lng],
        13
      );
      setMap(leafletMap);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMap);

      // The real location marker is handled by its own effect
    }

    // Add hospital markers
    if (map && hospitals.length > 0) {
      hospitals.forEach((hospital, idx) => {
        const hospitalIconHtml = ReactDOMServer.renderToString(
          <FaHospital style={{ color: "red", fontSize: "24px" }} />
        );
        const hospitalIcon = L.divIcon({
          html: hospitalIconHtml,
          className: "",
          iconSize: [24, 24],
        });

        const marker = L.marker([hospital.lat, hospital.lng], {
          icon: hospitalIcon,
        }).addTo(map);

        // Calculate distance (km) from real location
        const originLatLng =
          realLocation.lat && realLocation.lng
            ? L.latLng(realLocation.lat, realLocation.lng)
            : L.latLng(searchLocation.lat, searchLocation.lng);
        const distKm = (
          originLatLng.distanceTo(L.latLng(hospital.lat, hospital.lng)) / 1000
        ).toFixed(2);
        setDistances((prev) => ({ ...prev, [idx]: distKm }));

        // Directions URL (opens Google Maps directions in new tab)
        const directionsUrl =
          realLocation.lat && realLocation.lng
            ? `https://www.google.com/maps/dir/?api=1&origin=${realLocation.lat},${realLocation.lng}&destination=${hospital.lat},${hospital.lng}`
            : `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;

        // Popup content with address, distance and a Directions link
        const popupContent = `<div><strong>${hospital.name}</strong><br/>${hospital.address ? `<small>${hospital.address}</small><br/>` : ""}Distance: ${distKm} km<br/><a href="${directionsUrl}" target="_blank" rel="noreferrer">Directions</a><br/><small>Click marker to route</small></div>`;
        marker.bindPopup(popupContent);

        // On marker click, show the route and open popup
        marker.on("click", () => {
          showRouteToHospital(hospital);
          marker.openPopup();
        });
      });
    }
  }, [searchLocation, map, hospitals, realLocation]);

  // Show route from current location to selected hospital
  const showRouteToHospital = (hospital) => {
    // Only proceed if the map is initialized
    if (!map) return;

    // Remove the previous route if it exists
    if (routeControl) {
      try {
        map.removeControl(routeControl);
      } catch (error) {
        console.error("Error removing route control:", error);
      }
    }

    // Use real location for route origin if available, else fallback to search location
    const originLatLng =
      realLocation.lat && realLocation.lng
        ? L.latLng(realLocation.lat, realLocation.lng)
        : L.latLng(searchLocation.lat, searchLocation.lng);

    // Add loading feedback
    const loadingDiv = document.createElement("div");
    loadingDiv.innerText = "Calculating route...";
    loadingDiv.style.position = "absolute";
    loadingDiv.style.top = "10px";
    loadingDiv.style.left = "50%";
    loadingDiv.style.transform = "translateX(-50%)";
    loadingDiv.style.background = "#2563eb";
    loadingDiv.style.color = "#fff";
    loadingDiv.style.padding = "8px 16px";
    loadingDiv.style.borderRadius = "8px";
    loadingDiv.style.zIndex = "9999";
    loadingDiv.id = "route-loading";
    document.body.appendChild(loadingDiv);

    // Create a new route control
    const newRouteControl = L.Routing.control({
      waypoints: [
        originLatLng, // Real user location or fallback
        L.latLng(hospital.lat, hospital.lng), // Hospital location
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      createMarker: () => {},
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
      },
    })
      .on("routesfound", function () {
        const loading = document.getElementById("route-loading");
        if (loading) loading.remove();
      })
      .on("routingerror", function () {
        const loading = document.getElementById("route-loading");
        if (loading) loading.remove();
        alert(
          "Unable to calculate route. Please try again or check your network."
        );
      })
      .addTo(map);

    setRouteControl(newRouteControl);
  };

  return (
    <>
      <Navbar />
      <div className="content-container">
        {" "}
        {/* Add this wrapper for margin */}
        {searchLocation.lat && searchLocation.lng ? (
          <div className="flex flex-col-reverse  py-16  md:flex-row ">
            <div
              className={`h-1/2 md:w-[30%] md:h-screen  md:overflow-y-scroll ${
                dark === "dark"
                  ? "bg-gray-900 text-gray-200"
                  : "bg-white text-gray-800"
              }`}
            >
              <div
                className={`${
                  dark === "dark"
                    ? "bg-gradient-to-r from-gray-700 via-gray-900 to-black text-gray-100 shadow-2xl"
                    : "bg-[linear-gradient(90deg,_#a1c4fd_0%,_#c2e9fb_100%)] text-black"
                } px-2 py-2.5 `}
              >
                <p className="font-bold">Your Location: {address}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="bg-indigo-500 text-white px-3 py-1 rounded"
                    onClick={() => setManualMode(!manualMode)}
                  >
                    {manualMode ? "Cancel Manual" : "Manual Location"}
                  </button>
                  <button
                    className={`bg-green-500 text-white px-3 py-1 rounded ${pickOnMap ? "opacity-80" : ""}`}
                    onClick={() => setPickOnMap((prev) => !prev)}
                  >
                    {pickOnMap ? "Disable Pick-on-Map" : "Pick on Map"}
                  </button>
                </div>
              </div>
              {manualMode && (
                <div className="p-2">
                  <label className="block text-sm">City or Address:</label>
                  <input
                    type="text"
                    placeholder="Type a city or address (eg. Bangalore, MG Road)"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="border p-1 rounded w-full mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={async () => {
                        if (!addressInput || addressInput.trim() === "") return;
                        try {
                          const resp = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                              addressInput
                            )}&limit=1`
                          );
                          const results = await resp.json();
                          if (results && results.length > 0) {
                            const { lat, lon } = results[0];
                            setSearchLocation({
                              lat: parseFloat(lat),
                              lng: parseFloat(lon),
                            });
                            fetchAddress(parseFloat(lat), parseFloat(lon));
                            findHospitalsNearby(
                              parseFloat(lat),
                              parseFloat(lon)
                            );
                            if (map)
                              map.setView(
                                [parseFloat(lat), parseFloat(lon)],
                                13
                              );
                          } else {
                            alert("Location not found. Try a different query.");
                          }
                        } catch (err) {
                          console.error("Error geocoding address:", err);
                          alert(
                            "Geocoding failed. Check network and try again."
                          );
                        }
                      }}
                    >
                      Search & Apply
                    </button>
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setAddressInput("");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              <div>
                {loadingHospitals ? (
                  <p>Loading hospitals...</p>
                ) : hospitals.length > 0 ? (
                  <div className="container mx-auto ">
                    <br />
                    <h3
                      className={`text-lg tracking-widest text-center font-semibold ${
                        dark === "dark" ? "text-[#f6e05e]" : "text-[#c229b8]"
                      }`}
                    >
                      Hospitals within 2km:
                    </h3>
                    <br />
                    <div className="flex flex-col w-full">
                      {hospitals.map((hospital, index) => {
                        return (
                          <div
                            key={index}
                            className={`mx-auto w-full  rounded-xl shadow-2xl  p-4 mb-3
                               ${
                                 dark === "dark"
                                   ? "bg-[#2d3748] text-[#e2e8f0]"
                                   : "bg-[#fff] text-[#333]"
                               }`}
                          >
                            <div className="uppercase tracking-wide text-[10px] text-custom-blue font-semibold ">
                              Hospital
                            </div>
                            <h1
                              className={`block mt-1 text-lg leading-tight font-semibold  ${
                                dark === "dark"
                                  ? "text-[#f6e05e]"
                                  : "text-[#c229b8]"
                              }`}
                            >
                              {hospital.name}
                            </h1>
                            {/* <div className="mt-2 text-sm">
                          <span className="text-gray-700 font-semibold">Address:</span>
                          <p className='text-xs'>{hospital.address}</p>
                        </div> */}
                            <div className="mt-2 text-sm">
                              <span className="font-semibold">
                                Coordinates:
                              </span>
                              <p className="text-xs">
                                Lat: {hospital.lat}, Lon: {hospital.lng}
                              </p>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className=" font-semibold">Distance:</span>
                              <p className="text-xs">{distances[index]} km</p>
                            </div>
                            <button
                              onClick={() => showRouteToHospital(hospital)}
                              className="mt-4 bg-blue-500 text-white px-3 py-1 rounded mr-2"
                            >
                              Show Route
                            </button>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${realLocation.lat},${realLocation.lng}&destination=${hospital.lat},${hospital.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-block bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Directions
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p>No hospitals found nearby.</p>
                )}
              </div>
            </div>
            <div
              id="map"
              className="h-[50vh] w-full  md:w-[70%] md:h-screen "
            ></div>
          </div>
        ) : locationError ? (
          <p>
            Having trouble fetching location. Please enable location access in
            your browser and reload the page to retry.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              gap: "3rem",
            }}
          >
            <Skeleton variant="rectangular" width={400} height={400} />
            <Skeleton variant="rectangular" width={900} height={760} />
          </div>
        )}
      </div>
    </>
  );
};

export default HospitalsAround;
