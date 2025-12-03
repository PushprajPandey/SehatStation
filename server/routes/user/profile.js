const express = require("express");
const {
  getProfile,
  editProfileByID,
  addDoctor,
  getAllDoctors,
} = require("../../controllers/user/profileController.js");

const {
  createUserProfile,
  getAllUsers,
  getUserByID,
  updateUserByID,
  deleteUserByID,
} = require("../../controllers/user/userController.js");
const { authenticateToken } = require("../../middlewares/authMiddleware.js");

const router = express.Router();

// Unprotected routes
router.post("/", createUserProfile);
router.post("/:id", getUserByID);

// Protected Routes that require authentication
router.post("/", authenticateToken, getAllUsers);
router.post("/:id", authenticateToken, deleteUserByID);
router.post("/:id", authenticateToken, updateUserByID);
router.get("/profile", authenticateToken, getProfile);
router.post("/profile/edit/:id", authenticateToken, editProfileByID);
router.put("/profile/edit/:id", authenticateToken, editProfileByID);

// Add Doctor route - simplify to make sure it's registered correctly
router.post("/profile/adddoctor", authenticateToken, addDoctor);

// Add a route to get all doctors from all hospitals (public)
router.get("/doctors", getAllDoctors);

// Add a route to get all nurses from all hospitals (public)
router.get("/nurses", async (req, res) => {
  // Lazy require to avoid circular deps
  const { getAllDoctors } = require("../../controllers/user/profileController.js");
  try {
    const doctors = await getAllDoctors();
    // Filter for nurses by department or role if present
    const nurses = doctors.filter(d => {
      const dept = (d.department || '').toLowerCase();
      const role = (d.role || '').toLowerCase();
      return dept.includes('nurse') || role === 'nurse';
    });
    res.json(nurses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message || err });
  }
});

// Export the router
module.exports = router;
