import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../store/userContext';
import '../styles/UserProfile.css';
import { databaseUrls } from '../data/databaseUrls';
import { FaUser, FaEdit, FaCalendarAlt, FaUserMd, FaPlus, FaPhone, FaClock, FaHospital } from 'react-icons/fa';
import { MdEmail, MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // To toggle the modal visibility
  const [editData, setEditData] = useState({}); // For storing the editable data
  const [isAddingDoctor, setIsAddingDoctor] = useState(false); // To toggle the Add doctor modal visibility
  const [doctorData, setDoctorData] = useState({
    name: '',
    department: '',
    phone: '',
    opdSchedule: {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null
    }
  }); // For storing the new doctor data
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  
  // Time slots for the schedule picker
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    'Not Available'
  ];

  // Add state for all doctors
  const [allDoctors, setAllDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user data if authenticated
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          console.log("Fetching user profile data...");
          const response = await fetch(databaseUrls.auth.profile, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': localStorage.getItem('token'),
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log("User profile data:", data);
            console.log("User type:", data.role);
            console.log("User isHospital property:", data.isHospital);
            setUserData(data);
            
            // If not a hospital, fetch all doctors
            if (!data.isHospital && data.role !== 'hospital') {
              fetchAllDoctors();
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to fetch user data:', response.status, errorData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  // Function to fetch all doctors from all hospitals
  const fetchAllDoctors = async () => {
    try {
      const response = await fetch(databaseUrls.auth.getAllDoctors, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("All doctors data:", data);
        setAllDoctors(data);
        
        // Set doctors in userData for display
        setUserData(prevData => ({
          ...prevData,
          doctors: data
        }));
      } else {
        console.error('Failed to fetch all doctors');
      }
    } catch (error) {
      console.error('Error fetching all doctors:', error);
    }
  };

  // Fallback for when user data is not available yet
  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading profile information...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="user-page">
        <h2>No profile data available</h2>
        <p>Unable to retrieve your profile information at this time.</p>
      </div>
    );
  }

  // Enhanced logging to debug hospital detection
  console.log("User Data:", userData);
  console.log("User Role:", userData.role);
  console.log("User isHospital property:", userData.isHospital);
  console.log("Has departments?", Boolean(userData.departments));
  console.log("Has availableServices?", Boolean(userData.availableServices));

  // Check the explicit isHospital property first, then fall back to other methods
  const isHospital = userData.isHospital || userData.role === 'hospital' || (userData.departments && userData.availableServices);
  console.log("Is hospital?", isHospital);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({ ...userData }); // Populate the edit form with current user data
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorDataChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prev) => ({ ...prev, [name]: value }));
    // Clear any previous error when user starts typing
    setFormError('');
  };

  const handleDoctorScheduleDataChange = (day, value) => {
    setDoctorData((prevData) => {
      const updatedSchedule = { ...prevData.opdSchedule };
      
      // If "Not Available" is selected, set the value to null
      if (value === 'Not Available') {
        updatedSchedule[day] = null;
      } else {
        updatedSchedule[day] = value;
      }
      
      return { 
        ...prevData, 
        opdSchedule: updatedSchedule 
      };
    });
  };

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const handleConfirmEdit = async () => {
    try {
      setIsLoading(true);
      // Append the user ID to the URL
      const editUrl = `${databaseUrls.auth.editProfile}/${userData._id}`;
      console.log('Sending profile edit request to:', editUrl);
      
      const response = await fetch(editUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData); // Update the local state with the edited data
        setIsEditing(false); // Close the modal
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update user data:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDoctorData = () => {
    if (!doctorData.name || !doctorData.name.trim()) {
      setFormError('Doctor name is required');
      return false;
    }
    
    if (!doctorData.department || !doctorData.department.trim()) {
      setFormError('Department is required');
      return false;
    }
    
    if (!doctorData.phone || !doctorData.phone.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    
    // Check if at least one day has a schedule
    const hasSchedule = Object.values(doctorData.opdSchedule).some(val => 
      val !== null && val !== undefined && val !== 'Not Available'
    );
    
    if (!hasSchedule) {
      setFormError('Please set schedule for at least one day');
      return false;
    }
    
    return true;
  };

  const handleConfirmAddDoctor = async () => {
    if (!validateDoctorData()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a simpler version of the schedule with only days that have values
      const simpleSchedule = {};
      for (const day of days) {
        const value = doctorData.opdSchedule[day];
        if (value && value !== 'Not Available') {
          simpleSchedule[day] = value;
        } else {
          simpleSchedule[day] = null;
        }
      }
      
      // Make sure we're sending the right data format
      const postData = {
        id: userData._id,
        email: userData.email, // Include email as fallback
        doctor: {
          name: doctorData.name,
          department: doctorData.department,
          phone: doctorData.phone,
          opdSchedule: simpleSchedule
        }
      };
      
      console.log('Sending doctor data:', JSON.stringify(postData, null, 2));
      
      const response = await fetch(databaseUrls.auth.addDoctor, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify(postData),
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        console.log('Successfully added doctor, updated data:', updatedData);
        setUserData(updatedData); // Update the local state with the edited data
        setIsAddingDoctor(false); // Close the modal
        // Reset doctor data
        setDoctorData({
          name: '',
          department: '',
          phone: '',
          opdSchedule: {
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null,
            sunday: null
          }
        });
        setFormError('');
      } else {
        const errorData = await response.json().catch(e => ({ msg: 'Error parsing response' }));
        console.error('Failed to add doctor:', response.status, errorData);
        setFormError(errorData.msg || 'Failed to add new doctor');
      }
    } catch (error) {
      console.error('Error adding new doctor:', error);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Close the modal without saving changes
  };

  const handleCancelAddDoctor = () => {
    setIsAddingDoctor(false); // Close the modal without saving changes
    // Reset doctor data
    setDoctorData({
      name: '',
      department: '',
      phone: '',
      opdSchedule: {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
      }
    });
    setFormError('');
  };

  // Get first letter of name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Get status badge class based on appointment status
  const getStatusBadgeClass = (status) => {
    status = status.toLowerCase();
    if (status === 'confirmed') return 'status-badge status-confirmed';
    if (status === 'pending') return 'status-badge status-pending';
    if (status === 'cancelled') return 'status-badge status-cancelled';
    return 'status-badge';
  };

  // Format availability display
  const formatAvailability = (opdSchedule) => {
    if (!opdSchedule || Object.keys(opdSchedule).length === 0) {
      return 'No schedule available';
    }
    
    const availableDays = Object.entries(opdSchedule)
      .filter(([day, time]) => time !== null && time !== undefined && time !== '')
      .map(([day, time]) => ({
        day: capitalizeFirstLetter(day),
        time
      }));
    
    if (availableDays.length === 0) {
      return 'No schedule available';
    }
    
    return availableDays.map(({ day, time }) => (
      <div key={day} className="availability-slot">
        <span className="day">{day}: </span>
        <span className="time">{time}</span>
      </div>
    ));
  };

  // Function to navigate to OPD registration page
  const handleBookAppointment = (doctorId, hospitalId) => {
    navigate(`/opd-registration?doctor=${doctorId}&hospital=${hospitalId}`);
  };

  return (
    <>
      <div className="user-page">
        <div className="header">
          <h2>{isHospital ? 'Hospital Profile' : 'User Profile'}</h2>
          <button className="edit-btn" onClick={handleEditClick}>
            <FaEdit /> Edit Profile
          </button>
        </div>

        {/* User Profile Grid */}
        <div className="profile-grid">
          {/* Avatar Section */}
          <div className="profile-avatar">
            <div className="avatar-image">
              {getInitial(userData.name)}
            </div>
            <h3 className="profile-name">{userData.name}</h3>
            <p className="profile-role">{isHospital ? 'Healthcare Provider' : 'Patient'}</p>
            
            <div className="contact-info">
              <p><MdEmail /> {userData.email}</p>
              <p><FaPhone /> {userData.phone || 'No phone number'}</p>
              {isHospital && userData.address && (
                <p><MdLocationOn /> {`${userData.address?.city || ''}, ${userData.address?.state || ''}`}</p>
              )}
            </div>
        </div>

        {/* User Information */}
        <div className="user-info">
            <h3>Personal Information</h3>
            
            <div className="info-grid">
          {isHospital ? (
            <>
              <p>
                    <strong>Full Address</strong>
                {`${userData.address?.street || 'N/A'}, ${
                  userData.address?.city || 'N/A'
                }, ${userData.address?.state || 'N/A'}`}
              </p>
              <p>
                    <strong>Rating</strong>
                    {userData.ratings || 'N/A'}/5
              </p>
              <p>
                    <strong>Departments</strong>
                {userData.departments.join(', ') || 'N/A'}
              </p>
              <p>
                    <strong>Available Services</strong>
                {userData.availableServices.join(', ') || 'N/A'}
              </p>
            </>
          ) : (
            <>
              <p>
                    <strong>Date of Birth</strong>
                {new Date(userData.dob).toLocaleDateString() || 'N/A'}
              </p>
              <p>
                    <strong>Gender</strong>
                    {userData.gender || 'N/A'}
              </p>
              <p>
                    <strong>Medical History</strong>
                {userData.medicalHistory?.join(', ') || 'None'}
              </p>
            </>
          )}
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="appointments-section">
          <h3>
            <FaCalendarAlt /> Appointments
          </h3>
          {!userData.appointments || userData.appointments.length === 0 ? (
            <p>No appointments scheduled.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Reason</th>
                  <th>{isHospital ? 'Patient' : 'Hospital'}</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userData.appointments.map((appointment) => (
                  <tr key={appointment._id || appointment.appointmentId}>
                    <td>
                      {new Date(appointment.date).toLocaleDateString()}
                      {appointment.timeSlot && <div className="time-slot">{appointment.timeSlot}</div>}
                    </td>
                    <td>
                      {isHospital
                        ? appointment.doctorName || 'N/A'
                        : appointment.doctorName || 'N/A'}
                    </td>
                    <td>{appointment.department || 'General'}</td>
                    <td>{appointment.reason}</td>
                    <td>
                      {isHospital
                        ? appointment.patientName || 'N/A'
                        : appointment.hospitalName || 'N/A'}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Doctors Section */}
        <div className="doctors-section">
          <div className="doctors-header">
            <h3>
              <FaUserMd /> Doctors
            </h3>
            {isHospital && (
              <button
                className="add-btn"
                onClick={() => {
                  setIsAddingDoctor(true);
                }}
              >
                <FaPlus /> Add Doctor
              </button>
            )}
          </div>
          
          {!userData.doctors || userData.doctors.length === 0 ? (
            <p>{isHospital ? "No doctors added yet. Click \"Add Doctor\" to add your first doctor." : "No doctors available."}</p>
          ) : (
            <div className="doctors-grid">
                {userData.doctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card">
                  <div className="doctor-avatar">
                    {getInitial(doctor.name)}
                  </div>
                  <h4 className="doctor-name">{doctor.name}</h4>
                  <p className="doctor-department">{doctor.department}</p>
                  <p className="doctor-phone"><FaPhone /> {doctor.phone}</p>
                  
                  {/* Show hospital info if available (for regular users) */}
                  {!isHospital && doctor.hospitalName && (
                    <p className="doctor-hospital">
                      <FaHospital /> {doctor.hospitalName}
                    </p>
                  )}
                  
                  <div className="doctor-schedule">
                    <h5><FaClock /> Availability</h5>
                    <div className="schedule-slots">
                      {formatAvailability(doctor.opdSchedule)}
                    </div>
                  </div>
                  
                  {/* Book appointment button for regular users */}
                  {!isHospital && (
                    <button 
                      className="book-btn"
                      onClick={() => handleBookAppointment(doctor._id, doctor.hospitalId)}
                    >
                      <FaCalendarAlt /> Book Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            {!isHospital && (
              <>
            <div className="form-group">
                  <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={
                  editData.dob
                    ? new Date(editData.dob).toISOString().substr(0, 10)
                    : ''
                }
                onChange={handleChange}
              />
            </div>
                
            <div className="form-group">
                  <label>Gender</label>
              <select
                name="gender"
                value={editData.gender}
                onChange={handleChange}
              >
                <option value="N/A">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
              </>
            )}
            
            {isHospital && (
              <>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={editData.address?.street || ''}
                    onChange={(e) => {
                      setEditData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          street: e.target.value,
                        },
                      }));
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={editData.address?.city || ''}
                    onChange={(e) => {
                      setEditData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: e.target.value,
                        },
                      }));
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={editData.address?.state || ''}
                    onChange={(e) => {
                      setEditData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          state: e.target.value,
                        },
                      }));
                    }}
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button onClick={handleCancelEdit}>Cancel</button>
              <button onClick={handleConfirmEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAddingDoctor && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Doctor</h3>
            
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="form-group">
              <label>Doctor Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={doctorData.name || ''}
                onChange={handleDoctorDataChange}
                placeholder="Enter doctor's name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Department <span className="required">*</span></label>
              <select
                name="department"
                value={doctorData.department || ''}
                onChange={handleDoctorDataChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="ENT">ENT</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Dentistry">Dentistry</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                type="text"
                name="phone"
                value={doctorData.phone || ''}
                onChange={handleDoctorDataChange}
                placeholder="Enter doctor's phone number"
                required
              />
            </div>
            
            <div className="form-section">
              <h4 className="section-title">
                <FaClock /> OPD Schedule <span className="hint">(Select at least one day)</span>
              </h4>
              
              <div className="schedule-grid">
                {days.map((day) => (
                  <div className="form-group" key={day}>
                    <label>{capitalizeFirstLetter(day)}</label>
                    <select
                      value={doctorData.opdSchedule[day] || 'Not Available'}
                      onChange={(e) => handleDoctorScheduleDataChange(day, e.target.value)}
                    >
                      {timeSlots.map((slot) => (
                        <option key={`${day}-${slot}`} value={slot === 'Not Available' ? 'Not Available' : slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={handleCancelAddDoctor}>Cancel</button>
              <button 
                onClick={handleConfirmAddDoctor}
                className="save-btn"
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
