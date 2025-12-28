const express = require("express");
const AppointmentRouter = express.Router();
const { authenticator } = require("../middlewares/authenticator");
const { checkRole } = require("../middlewares/authorization");
const { createAppointment, getUserAppointments } = require("../controllers/appointmentController");
const Appointment = require("../Models/Appointment");

// Create (Người dùng)
AppointmentRouter.post("/create", authenticator, checkRole(["customer"]), createAppointment);

// Get của riêng người dùng đó
AppointmentRouter.get("/get", authenticator, checkRole(["customer"]), getUserAppointments);

// Get All (Admin)
AppointmentRouter.get("/getall", authenticator, checkRole(["admin"]), async (req, res) => {
    try {
      const data = await Appointment.findAll({
        order: [["appointment_id", "DESC"]]
      });      
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

module.exports = { AppointmentRouter };