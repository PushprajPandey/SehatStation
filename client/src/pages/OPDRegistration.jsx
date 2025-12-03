import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OPD.css';
import '../styles/Loader.css';
import jsPDF from 'jspdf';
// import pincodes from 'indian-pincodes';
import { pininfo } from 'indian_address';
import { AiOutlineDownload } from 'react-icons/ai';
import { TailSpin } from 'react-loader-spinner';
import { useRecoilValue } from 'recoil';
import { mode } from '../store/atom';
import { databaseUrls } from '../data/databaseUrls';
import { UserContext } from '../store/userContext';
import { message } from 'antd';

function OPDRegistrationForm() {
  const dark = useRecoilValue(mode);
  const today = new Date().toISOString().split('T')[0];
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(UserContext);
  
  // Get doctor and hospital IDs from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const doctorId = queryParams.get('doctor');
  const hospitalId = queryParams.get('hospital');
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: '',
    gender: user?.gender || '',
    contact: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.postalCode || '',
    doctor: doctorId || '',
    hospital: hospitalId || '',
    department: '',
    reason: '',
    date: '',
    timeSlot: '',
    report: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch hospitals and doctors when component mounts
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      message.warning('Please login to book an appointment');
      navigate('/login', { state: { from: location } });
      return;
    }
    
    fetchHospitals();
    
    // If hospital ID is provided, fetch that hospital's details
    if (hospitalId) {
      fetchHospitalDetails(hospitalId);
    }
  }, [isAuthenticated]);
  
  // Fetch all hospitals
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(databaseUrls.hospitals.all);
      if (response.data) {
        setHospitals(response.data);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      message.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch a specific hospital's details including doctors
  const fetchHospitalDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${databaseUrls.hospitals.fromId.replace('_id', id)}`);
      if (response.data) {
        setSelectedHospital(response.data);
        setHospitalDoctors(response.data.doctors || []);
        
        // Update form data with hospital information
        setFormData(prev => ({
          ...prev,
          hospital: id,
          department: response.data.departments ? response.data.departments[0] : ''
        }));
        
        // If a doctor ID was provided, select that doctor
        if (doctorId && response.data.doctors) {
          const doctor = response.data.doctors.find(d => d._id === doctorId);
          if (doctor) {
            console.log('Doctor found from URL params:', doctor);
            setSelectedDoctor(doctor);
            
            // Set today as default date if not already set
            const defaultDate = today;
            
            setFormData(prev => ({
              ...prev,
              doctor: doctorId,
              department: doctor.department,
              date: prev.date || defaultDate
            }));
            
            // Generate available time slots based on the doctor's schedule
            // We need to use a setTimeout to ensure the date is set in formData before generating slots
            setTimeout(() => {
              console.log('Generating slots for doctor from URL with date:', defaultDate);
              generateAvailableSlots(doctor);
            }, 0);
          } else {
            message.warning('The specified doctor was not found at this hospital. Please select another doctor.');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      message.error('Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate available appointment slots based on doctor's schedule
  const generateAvailableSlots = (doctor) => {
    if (!doctor || !doctor.opdSchedule) {
      console.log('No schedule available for doctor');
      setAvailableSlots([]);
      return;
    }
    
    // Log the entire doctor object to see the schedule structure
    console.log('Doctor data for slots:', doctor);
    console.log('Schedule data type:', typeof doctor.opdSchedule);
    
    const slots = [];
    const selectedDate = new Date(formData.date || today);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    console.log('Doctor schedule:', doctor.opdSchedule);
    console.log('Selected day:', dayOfWeek);
    
    // Handle schedule as an object with days as keys
    if (typeof doctor.opdSchedule === 'object') {
      // Try full day name first (monday, tuesday, etc.)
      if (doctor.opdSchedule[dayOfWeek] && doctor.opdSchedule[dayOfWeek] !== 'Not Available') {
        slots.push(doctor.opdSchedule[dayOfWeek]);
        console.log('Available slot added:', doctor.opdSchedule[dayOfWeek]);
      } 
      // Try abbreviated day name (mon, tue, wed, etc.)
      else {
        const shortDay = dayOfWeek.substring(0, 3);
        console.log('Trying abbreviated day:', shortDay);
        
        if (doctor.opdSchedule[shortDay] && doctor.opdSchedule[shortDay] !== 'Not Available') {
          slots.push(doctor.opdSchedule[shortDay]);
          console.log('Available slot added using short day:', doctor.opdSchedule[shortDay]);
        }
        // Try capitalized format
        else {
          const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
          console.log('Trying capitalized day:', capitalizedDay);
          
          if (doctor.opdSchedule[capitalizedDay] && doctor.opdSchedule[capitalizedDay] !== 'Not Available') {
            slots.push(doctor.opdSchedule[capitalizedDay]);
            console.log('Available slot added using capitalized day:', doctor.opdSchedule[capitalizedDay]);
          }
          // If nothing works, try to look for any format of the day
          else {
            console.log('No slots found with standard formats, checking all keys');
            const dayVariations = [
              dayOfWeek, 
              shortDay, 
              capitalizedDay,
              shortDay.toUpperCase(),
              dayOfWeek.toUpperCase()
            ];
            
            for (const key in doctor.opdSchedule) {
              console.log('Checking key:', key);
              if (dayVariations.some(variation => key.includes(variation))) {
                slots.push(doctor.opdSchedule[key]);
                console.log('Found matching slot for key:', key, doctor.opdSchedule[key]);
              }
            }
          }
        }
      }
    } 
    // Handle schedule as a string or other format
    else if (doctor.opdSchedule) {
      console.log('Schedule is not an object, using as is:', doctor.opdSchedule);
      slots.push(String(doctor.opdSchedule));
    }
    
    setAvailableSlots(slots);
    
    if (slots.length === 0) {
      message.info(`Dr. ${doctor.name} is not available on ${dayOfWeek}. Please select another date.`);
    } else {
      console.log('Final available slots:', slots);
    }
  };
  
  // When hospital selection changes, fetch its doctors
  const handleHospitalChange = (e) => {
    const hospitalId = e.target.value;
    setFormData({ ...formData, hospital: hospitalId, doctor: '' });
    
    if (hospitalId) {
      fetchHospitalDetails(hospitalId);
    } else {
      setSelectedHospital(null);
      setHospitalDoctors([]);
    }
  };
  
  // When doctor selection changes, update available slots
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData({ ...formData, doctor: doctorId });
    
    if (doctorId && hospitalDoctors.length > 0) {
      const doctor = hospitalDoctors.find(d => d._id === doctorId);
      if (doctor) {
        console.log('Selected doctor:', JSON.stringify(doctor, null, 2));
        console.log('Doctor schedule:', doctor.opdSchedule);
        
        setSelectedDoctor(doctor);
        setFormData(prev => ({
          ...prev,
          department: doctor.department
        }));
        
        if (formData.date) {
          generateAvailableSlots(doctor);
        }
      }
    } else {
      setSelectedDoctor(null);
      setAvailableSlots([]);
    }
  };
  
  // When date changes, recalculate available slots
  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData({ ...formData, date, timeSlot: '' });
    
    if (selectedDoctor && date) {
      console.log('Date changed to:', date);
      generateAvailableSlots(selectedDoctor);
    } else {
      console.log('No doctor selected or no date selected');
      setAvailableSlots([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, report: [...formData.report, ...files] });
  };

  // Remove uploaded file
  const removeFile = (index) => {
    const updatedFiles = [...formData.report];
    updatedFiles.splice(index, 1);
    setFormData({ ...formData, report: updatedFiles });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate personal information
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(formData.age) || formData.age <= 0) newErrors.age = 'Age must be a positive number';
    
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    if (!formData.contact) newErrors.contact = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.contact)) newErrors.contact = 'Contact number must be 10 digits';
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    
    // Validate appointment details
    if (!formData.hospital) newErrors.hospital = 'Hospital is required';
    if (!formData.doctor) newErrors.doctor = 'Doctor is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.reason) newErrors.reason = 'Reason for visit is required';
    if (!formData.date) newErrors.date = 'Appointment date is required';
    if (!formData.timeSlot) newErrors.timeSlot = 'Time slot is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create form data for sending files
        const submitData = new FormData();
        
        // Add form fields to FormData
        Object.keys(formData).forEach(key => {
          if (key !== 'report') {
            submitData.append(key, formData[key]);
          }
        });
        
        // Add files to FormData
        formData.report.forEach(file => {
          submitData.append('report', file);
        });

        // Add the hospital ID explicitly to ensure it's associated correctly
        submitData.append('hospitalId', formData.hospital);
        
        // Add hospital name for easier display
        if (selectedHospital) {
          submitData.append('hospitalName', selectedHospital.name);
        }
        
        // Add doctor name for easier display
        if (selectedDoctor) {
          submitData.append('doctorName', selectedDoctor.name);
        }
        
        // Add user ID if user is logged in
        if (user && user._id) {
          submitData.append('userId', user._id);
        }
        
        // Submit appointment data to server
        const response = await axios.post(databaseUrls.appointments.register, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (response.data) {
          setRegistrationDetails(response.data);
          setAppointmentDetails(response.data.appointment);
          setShowModal(true);
          message.success('Appointment registered successfully!');
          
          // Also update the hospital's appointments list
          try {
            const hospitalAppointmentData = {
              appointmentId: response.data.appointment._id,
              userId: user?._id,
              date: formData.date,
              reason: formData.reason,
              status: 'pending',
              doctorId: formData.doctor,
              doctorName: selectedDoctor?.name,
              patientName: formData.name,
              patientContact: formData.contact,
              timeSlot: formData.timeSlot
            };
            
            await axios.post(`${databaseUrls.hospitals.updateAppointments.replace('_id', formData.hospital)}`, 
              hospitalAppointmentData
            );
            console.log('Hospital appointments list updated successfully');
          } catch (error) {
            console.error('Error updating hospital appointments:', error);
            // This is not a critical error for the user, so just log it
          }
        }
      } catch (error) {
        console.error('Error registering appointment:', error);
        message.error('Failed to register appointment. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Generate PDF of appointment details
  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text('Appointment Confirmation', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Patient Details:', 20, 40);
    doc.text(`Name: ${formData.name}`, 20, 50);
    doc.text(`Age: ${formData.age}`, 20, 60);
    doc.text(`Gender: ${formData.gender}`, 20, 70);
    doc.text(`Contact: ${formData.contact}`, 20, 80);
    doc.text(`Email: ${formData.email}`, 20, 90);
    
    doc.text('Appointment Details:', 20, 110);
    doc.text(`Hospital: ${selectedHospital?.name || formData.hospital}`, 20, 120);
    doc.text(`Doctor: ${selectedDoctor?.name || 'Not Specified'}`, 20, 130);
    doc.text(`Department: ${formData.department}`, 20, 140);
    doc.text(`Date: ${formData.date}`, 20, 150);
    doc.text(`Time: ${formData.timeSlot}`, 20, 160);
    doc.text(`Reason for Visit: ${formData.reason}`, 20, 170);
    
    // Add a footer
    doc.setFontSize(10);
    doc.text('Please arrive 15 minutes before your scheduled appointment. Bring this confirmation with you.', 105, 250, { align: 'center' });
    doc.text('Contact: hospital@example.com | Phone: 123-456-7890', 105, 260, { align: 'center' });
    
    // Save the PDF
    doc.save(`Appointment_${formData.name}.pdf`);
  };

  return (
    <>
      <div className={`${dark === 'dark' ? 'dark' : ''}`}>
        <section className={`form-container ${dark === 'dark' ? 'dark' : ''} `}>
          <h2 className={dark === 'dark' ? 'text-yellow-400' : 'text-gray-900'}>
            OPD Registration
          </h2>
          
          {loading ? (
            <div className="loading-container">
              <TailSpin height="60" width="60" color="#4a90e2" ariaLabel="loading" />
              <p>Loading hospital and doctor information...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="opd-registration-form justify-center !flex flex-col w-full mt-5">
              <div className="form-grid">
                {/* Personal Information */}
                <div className="form-column">
                  <h3 className={dark === 'dark' ? 'text-yellow-400' : 'text-gray-900'}>Personal Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="age">Age:</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.age && <span className="error">{errors.age}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender:</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <span className="error">{errors.gender}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact">Contact Number:</label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      placeholder="Enter your contact number"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.contact && <span className="error">{errors.contact}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address:</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.address && <span className="error">{errors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City:</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.city && <span className="error">{errors.city}</span>}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="form-column">
                  <h3 className={dark === 'dark' ? 'text-yellow-400' : 'text-gray-900'}>Appointment Details</h3>
                  
                  <div className="form-group">
                    <label htmlFor="state">State:</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="Enter your state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.state && <span className="error">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">Pincode:</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      placeholder="Enter your pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.pincode && <span className="error">{errors.pincode}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="hospital">Select Hospital:</label>
                    <select
                      id="hospital"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleHospitalChange}
                      required
                      disabled={!!hospitalId}
                      className={dark === 'dark' ? 'input-dark' : ''}
                    >
                      <option value="">Select hospital</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital._id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                    {errors.hospital && <span className="error">{errors.hospital}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="doctor">Select Doctor:</label>
                    <select
                      id="doctor"
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleDoctorChange}
                      required
                      disabled={!!doctorId}
                      className={dark === 'dark' ? 'input-dark' : ''}
                    >
                      <option value="">Select doctor</option>
                      {hospitalDoctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.department}
                        </option>
                      ))}
                    </select>
                    {errors.doctor && <span className="error">{errors.doctor}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="department">Department:</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!!selectedDoctor}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.department && <span className="error">{errors.department}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Appointment Date:</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleDateChange}
                      min={today}
                      required
                      className={dark === 'dark' ? 'input-dark' : ''}
                    />
                    {errors.date && <span className="error">{errors.date}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeSlot">Time Slot:</label>
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.date || availableSlots.length === 0}
                      className={dark === 'dark' ? 'input-dark' : ''}
                    >
                      <option value="">Select time slot</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                      {availableSlots.length === 0 && formData.date && (
                        <option value="" disabled>
                          No slots available on selected date
                        </option>
                      )}
                    </select>
                    {errors.timeSlot && <span className="error">{errors.timeSlot}</span>}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-textarea">
                  <label htmlFor="reason">Reason for Visit:</label>
                  <textarea
                    id="reason"
                    name="reason"
                    placeholder="Enter the reason for your visit"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    className={dark === 'dark' ? 'input-dark' : ''}
                  ></textarea>
                  {errors.reason && <span className="error">{errors.reason}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="report">Upload Reports (Optional):</label>
                  <input
                    type="file"
                    id="report"
                    name="report"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={dark === 'dark' ? 'input-dark' : ''}
                  />
                  <small>You can upload PDF, JPG, JPEG, or PNG files (max 5MB each)</small>
                </div>
              </div>

              {formData.report.length > 0 && (
                <div className="uploaded-files">
                  <h3>Uploaded Files:</h3>
                  <ul>
                    {formData.report.map((file, index) => (
                      <li key={index}>
                        {file.name}
                        <button
                          type="button"
                          className="remove-file"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className={`submit-btn ${dark === 'dark' ? 'btn-dark' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <TailSpin height="20" width="20" color="#FFFFFF" ariaLabel="loading" radius="1" visible={true} />
                  ) : (
                    'Register Appointment'
                  )}
                </button>
                <Link to="/" className={`back-btn ${dark === 'dark' ? 'link-dark' : ''}`}>
                  Back to Home
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>

      {showModal && (
        <div className={`modal ${dark === 'dark' ? 'modal-dark' : ''}`}>
          <div className="modal-content">
            <div className="OpdHeader">
              <img src="/favicon.png" className="image" alt="Logo" />
              <p className="OPDText">Med-Space</p>
            </div>
            <hr></hr>

            <h3
              style={{ marginTop: '20px' }}
              className={dark === 'dark' ? 'text-yellow-400' : ''}
            >
              Registration Successful!
            </h3>

            <p>Here are your appointment details:</p>
            <ul>
              <li>Name: {registrationDetails?.name || 'John Doe'}</li>
              <li>Age: {registrationDetails?.age || 28}</li>
              <li>
                Date of Appointment:{' '}
                {appointmentDetails?.date || '2024-10-10'}
              </li>
              <li>
                Time:{' '}
                {appointmentDetails?.timeSlot || '10:00 AM'}
              </li>
              <li>
                Doctor:{' '}
                {appointmentDetails?.doctor || selectedDoctor?.name || 'Not specified'}
              </li>
              <li>
                Department:{' '}
                {appointmentDetails?.department || selectedDoctor?.department || 'Not specified'}
              </li>
              <li>
                Reason:{' '}
                {appointmentDetails?.reason || formData.reason || 'Routine check-up'}
              </li>
              <li>
                Hospital:{' '}
                {appointmentDetails?.hospital || selectedHospital?.name || 'City Hospital'}
              </li>
              <li>
                Address:{' '}
                {selectedHospital?.address?.street || 'Null'}, {selectedHospital?.address?.city || 'Null'}, {selectedHospital?.address?.state || 'Null'}
              </li>
              <li>
                Phone:{' '}
                {selectedHospital?.phone || 'Not available'}
              </li>
            </ul>

            <p className="confirmation-message">
              Your appointment has been added to the hospital's dashboard and your personal profile. 
              You can view your appointments in your profile dashboard.
            </p>

            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className={dark === 'dark' ? 'btn-dark' : ''}
              >
                Close
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className={`${dark === 'dark' ? 'btn-dark' : ''} view-profile-btn`}
              >
                View Profile
              </button>
            </div>

            {/* PDF download icon in the lower right corner */}
            <div className="download-icon" onClick={generatePDF}>
              <AiOutlineDownload
                className={dark === 'dark' ? 'text-yellow-400' : 'text-black'}
                size={32}
                color="#007bff"
              />
            </div>

            {/* Footer */}
            <footer
              style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '12px',
              }}
            >
              <hr />
              <p>&copy; 2024 Med-Space. All rights reserved. &trade;</p>
            </footer>
          </div>
        </div>
      )}
      {/* Full-screen Loader Overlay */}
      {isSubmitting && (
        <div className="loader-overlay">
          <div className="loader-container">
            <TailSpin
              height="80"
              width="80"
              color="#007bff"
              ariaLabel="loading"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default OPDRegistrationForm;
