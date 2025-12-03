const User = require("../../models/user.js");
const Hospital = require("../../models/hospital.js");
const { randomUUID } = require("crypto");
const { ZodError } = require("zod");

const getProfile = async (req, res) => {
  try {
    console.log("Get profile request for user:", req.user.id);
    
    let profile = await User.findById(req.user.id);
    if (!profile) {
      profile = await Hospital.findById(req.user.id);
      if (!profile) return res.status(404).json({ msg: "Profile not found" });
      
      // Sort hospital appointments by date in descending order (newest first)
      if (profile.appointments && profile.appointments.length > 0) {
        profile.appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      console.log("Found hospital profile:", profile._id);
      return res.json({ 
        ...profile.toObject(), 
        role: "hospital",
        isHospital: true 
      });
    }
    
    // Sort user appointments by date in descending order (newest first)
    if (profile.appointments && profile.appointments.length > 0) {
      profile.appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    console.log("Found user profile:", profile._id);
    res.json({ 
      ...profile.toObject(), 
      role: "user",
      isHospital: false 
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ msg: "Server error", err });
  }
};

const editProfileByID = async (req, res) => {
  try {
    const { id } = req.params; // Get 'id' from token
    let updateData = req.body; // Data to update, parsed from request body

    // Check if the user exists
    let user = await User.findById(id);
    if (user) {
      // If user exists, validate the data using userSchema
      updateData = User.schema.partial().parse(updateData);

      const updatedUser = await User.findByIdAndUpdate(
        id, // User ID from token
        { $set: updateData }, // Update only the provided fields
        { new: true, runValidators: true } // Return the updated document
      );

      return res.json(updatedUser); // Return the updated user data
    }

    // Check if the hospital exists (if user wasn't found)
    let hospital = await Hospital.findById(id);
    if (hospital) {
      // If hospital exists, validate the data using hospitalSchema
      updateData = Hospital.schema.partial().parse(updateData);

      const updatedHospital = await Hospital.findByIdAndUpdate(
        id, // Hospital ID from token
        { $set: updateData }, // Update only the provided fields
        { new: true, runValidators: true } // Return the updated document
      );

      return res.json(updatedHospital); // Return the updated hospital data
    }

    // If neither a user nor a hospital was found, return an error
    return res
      .status(404)
      .json({ msg: "No user or hospital found with the provided ID" });
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error", error });
  }
};

const addDoctor = async (req, res) => {
  try {
    // Get id from either the token or the request body
    const id = req.user?.id || req.body.id;
    
    if (!id) {
      console.error('AddDoctor error: No hospital ID provided');
      return res.status(400).json({ msg: "Hospital ID is required" });
    }
    
    console.log("Processing add doctor request for hospital ID:", id);
    
    let updateData = req.body; // Data to update, parsed from request body
    let hospital = await Hospital.findById(id);
    
    if (!hospital) {
      // Try to find by email as fallback
      if (updateData.email) {
        hospital = await Hospital.findOne({ email: updateData.email });
        console.log("Tried finding hospital by email:", updateData.email, !!hospital);
      }
    }
    
    if (hospital) {
      // If hospital exists, validate the data using hospitalSchema
      var { doctor } = updateData;

      if (!doctor) {
        return res.status(400).json({ msg: "Doctor data is required" });
      }
      
      console.log("Doctor data received:", JSON.stringify(doctor, null, 2));
      
      // Create a cleaned up doctor object
      const cleanedDoctor = {
        _id: randomUUID().toString(),
        name: doctor.name,
        department: doctor.department,
        phone: doctor.phone || "",
        opdSchedule: {
          monday: doctor.opdSchedule?.monday || null,
          tuesday: doctor.opdSchedule?.tuesday || null,
          wednesday: doctor.opdSchedule?.wednesday || null,
          thursday: doctor.opdSchedule?.thursday || null,
          friday: doctor.opdSchedule?.friday || null,
          saturday: doctor.opdSchedule?.saturday || null,
          sunday: doctor.opdSchedule?.sunday || null
        }
      };

      // Simple validation
      if (!cleanedDoctor.name || !cleanedDoctor.department) {
        return res.status(400).json({ msg: "Doctor name and department are required" });
      }

      if (hospital.doctors && hospital.doctors.find((d) => d.name === cleanedDoctor.name)) {
        return res.status(400).json({ msg: "Doctor already exists" });
      }

      // Initialize doctors array if it doesn't exist
      if (!hospital.doctors) {
        hospital.doctors = [];
      }

      const updatedHospital = await Hospital.findByIdAndUpdate(
        id, // Hospital ID from token
        { $push: { doctors: cleanedDoctor } }, // Add the new doctor
        { new: true, runValidators: true } // Return the updated document
      );

      return res.json(updatedHospital); // Return the updated hospital data
    }

    // If no hospital was found, return an error
    return res
      .status(404)
      .json({ msg: "No hospital found with the provided ID" });
  } catch (error) {
    console.error("Add doctor error:", error);
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    // Find all hospitals and select only the doctors field
    const hospitals = await Hospital.find({}, 'doctors name');
    
    // Create a list of all doctors with their hospital information
    const allDoctors = [];
    
    hospitals.forEach(hospital => {
      if (hospital.doctors && hospital.doctors.length > 0) {
        // Add hospital information to each doctor
        const doctorsWithHospital = hospital.doctors.map(doctor => ({
          ...doctor.toObject(),
          hospitalName: hospital.name,
          hospitalId: hospital._id
        }));
        
        allDoctors.push(...doctorsWithHospital);
      }
    });
    
    // If called as an express handler (req,res) send response, otherwise return array
    if (req && res) {
      return res.json(allDoctors);
    }

    return allDoctors;
  } catch (error) {
    console.error("Get all doctors error:", error);
    if (req && res) {
      return res.status(500).json({ msg: "Server error", error: error.message });
    }
    throw error;
  }
};

module.exports = { getProfile, editProfileByID, addDoctor, getAllDoctors };
