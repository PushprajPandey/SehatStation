const express = require("express");
const { authenticateToken } = require("../../middlewares/authMiddleware.js");
const {
  createHospital,
  searchHospitalByQuery,
  getHospitalByID,
  updateHospitalByID,
  deleteHospitalByID,
  updateHospitalAppointments,
} = require("../../controllers/hospital/hospitalController.js");
const router = express.Router();

router.post("/", createHospital);
router.get("/", searchHospitalByQuery);
router.get("/:id", getHospitalByID);

// These are protected routes and needs authentication from now on
router.patch("/:id", authenticateToken, updateHospitalByID);
router.delete("/:id", authenticateToken, deleteHospitalByID);

// Add a new route for updating hospital appointments
router.post("/:id/appointments", updateHospitalAppointments);

module.exports = router;
