const Appointment = require('../../models/appointment');
const Hospital = require('../../models/hospital');
const User = require('../../models/user');
const { sendEmail } = require('../../utils/mailer');
const { isValidObjectId } = require('mongoose');

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const {
      name,
      email,
      age,
      gender,
      contact,
      address,
      city,
      state,
      pincode,
      hospital,
      doctor,
      department,
      reason,
      date,
      timeSlot,
      userId,
      hospitalName,
      doctorName
    } = req.body;

    // Validate required fields
    if (!name || !email || !age || !gender || !contact || !address || !city || !state || !pincode || !hospital || !doctor || !department || !reason || !date || !timeSlot) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if hospital exists
    const hospitalExists = await Hospital.findById(hospital);
    if (!hospitalExists) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Check if doctor exists in hospital
    const doctorExists = hospitalExists.doctors.find(
      (doc) => doc._id.toString() === doctor
    );
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found in selected hospital' });
    }

    // Check if the time slot is available for the doctor on the selected date
    const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const isDoctorAvailable = doctorExists.opdSchedule[selectedDay] === timeSlot;
    
    if (!isDoctorAvailable) {
      return res.status(400).json({ message: 'Selected time slot is not available for this doctor on the selected date' });
    }

    // Check for existing appointment with same doctor, date and time
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      timeSlot,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create new appointment
    const newAppointment = new Appointment({
      patient: {
        name,
        email,
        age,
        gender,
        contact,
        address: {
          street: address,
          city,
          state,
          postalCode: pincode
        }
      },
      hospital,
      doctor,
      department,
      reason,
      date,
      timeSlot,
      reportUrls: req.files?.map(file => file.path) || [],
    });

    // Save appointment to database
    await newAppointment.save();

    // If userId is provided, add appointment to user's profile
    if (userId && isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          // Add appointment to user's appointments array
          user.appointments.push({
            appointmentId: newAppointment._id,
            hospitalId: hospital,
            hospitalName: hospitalName || hospitalExists.name,
            doctorId: doctor,
            doctorName: doctorName || doctorExists.name,
            department,
            date,
            timeSlot,
            reason,
            status: 'pending'
          });
          
          await user.save();
          console.log(`Appointment added to user ${userId}'s profile`);
        }
      } catch (userError) {
        console.error('Error updating user with appointment:', userError);
        // Continue with appointment creation even if user update fails
      }
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: 'Appointment Confirmation',
        html: `
          <h1>Appointment Confirmed</h1>
          <p>Dear ${name},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          <ul>
            <li><strong>Hospital:</strong> ${hospitalExists.name}</li>
            <li><strong>Doctor:</strong> ${doctorExists.name}</li>
            <li><strong>Department:</strong> ${department}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${timeSlot}</li>
          </ul>
          <p>Please arrive 15 minutes before your scheduled appointment time.</p>
          <p>Thank you for choosing our service!</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with appointment creation even if email fails
    }

    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        _id: newAppointment._id,
        hospital: hospitalExists.name,
        doctor: doctorExists.name,
        department,
        date,
        timeSlot,
        status: newAppointment.status
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

// Get available appointment slots for a doctor on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date || !isValidObjectId(doctorId)) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }

    // Find the hospital with this doctor
    const hospital = await Hospital.findOne({ 'doctors._id': doctorId });
    
    if (!hospital) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find the doctor in the hospital
    const doctor = hospital.doctors.find(doc => doc._id.toString() === doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found in hospital' });
    }

    // Get day of the week from date
    const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Get doctor's schedule for that day
    const scheduleForDay = doctor.opdSchedule[selectedDay];
    
    if (!scheduleForDay || scheduleForDay === 'Not Available') {
      return res.status(200).json({ 
        available: false,
        message: 'Doctor is not available on this day',
        slots: [] 
      });
    }
    
    // Find existing appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $nin: ['cancelled', 'completed'] }
    }).select('timeSlot');
    
    // Create array of booked time slots
    const bookedSlots = bookedAppointments.map(app => app.timeSlot);
    
    // Return available slots
    const availableSlots = [scheduleForDay].filter(slot => !bookedSlots.includes(slot));
    
    return res.status(200).json({
      available: availableSlots.length > 0,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        department: doctor.department
      },
      hospital: {
        id: hospital._id,
        name: hospital.name
      },
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    return res.status(500).json({ message: 'Failed to get available slots', error: error.message });
  }
};

// Export controllers
module.exports = {
  createAppointment,
  getAvailableSlots
}; 