const express = require('express');
const router = express.Router();
const { createAppointment, getAvailableSlots } = require('../../controllers/user/appointmentController');
const { verifyToken } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Create a new appointment
router.post('/register', verifyToken, upload.array('report', 5), createAppointment);

// Get available slots for a doctor on a specific date
router.get('/available-slots', verifyToken, getAvailableSlots);

module.exports = router; 