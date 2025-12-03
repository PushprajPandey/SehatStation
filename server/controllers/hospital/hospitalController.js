const { hospitalSchema } = require("../../validators/hospitalSchemas.js");
const Hospital = require("../../models/hospital.js");
const { z } = require("zod");

// Creates a new hospital
const createHospital = async (req, res) => {
  try {
    const parsedData = hospitalSchema.parse(req.body);
    const hospital = new Hospital(parsedData);
    await hospital.save();
    res.status(201).send(hospital);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    res.status(400).send(error);
  }
};

// Search hospital using a search query
const searchHospitalByQuery = async (req, res) => {
  const query = req.query || {};
  try {
    console.log('searchHospitalByQuery - req.query:', JSON.stringify(query));

    let hospitals;
    // Determine search string: prefer `q`, `search`, or first query param value
    let searchString = '';
    if (typeof query.q === 'string' && query.q.trim()) searchString = query.q.trim();
    else if (typeof query.search === 'string' && query.search.trim()) searchString = query.search.trim();
    else {
      const keys = Object.keys(query).filter(k => k !== 'page' && k !== 'limit');
      if (keys.length > 0) {
        const val = query[keys[0]];
        if (typeof val === 'string') searchString = val.trim();
      }
    }

    if (searchString) {
      const regex = new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
      hospitals = await Hospital.find({
        $or: [
          { name: { $regex: regex } },
          { 'address.street': { $regex: regex } },
          { 'address.city': { $regex: regex } },
          { 'address.state': { $regex: regex } },
        ],
      });
    } else {
      hospitals = await Hospital.find();
    }

    res.status(200).json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error && error.stack ? error.stack : error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

// Get a hospital by ID
const getHospitalByID = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).send();
    res.send(hospital);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update a hospital by ID
const updateHospitalByID = async (req, res) => {
  try {
    const parsedData = hospitalSchema.partial().parse(req.body);
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      parsedData,
      { new: true, runValidators: true }
    );
    if (!hospital) return res.status(404).send();
    res.send(hospital);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    res.status(400).send(error);
  }
};

// Delete a hospital by ID
const deleteHospitalByID = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).send();
    res.send(hospital);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Add an appointment to a hospital
const updateHospitalAppointments = async (req, res) => {
  try {
    const { 
      appointmentId, 
      userId, 
      date, 
      reason, 
      status,
      doctorId,
      doctorName,
      patientName,
      patientContact,
      timeSlot
    } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    // Add the appointment to the hospital's appointments array
    hospital.appointments.push({
      appointmentId,
      userId,
      doctorId,
      doctorName,
      patientName,
      patientContact,
      date: date || new Date(),
      timeSlot,
      reason: reason || "OPD Appointment",
      status: status || "pending"
    });
    
    await hospital.save();
    
    res.status(200).json({ 
      message: "Appointment added to hospital successfully",
      appointment: hospital.appointments[hospital.appointments.length - 1] 
    });
  } catch (error) {
    console.error("Error updating hospital appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createHospital,
  searchHospitalByQuery,
  getHospitalByID,
  updateHospitalByID,
  deleteHospitalByID,
  updateHospitalAppointments,
};
