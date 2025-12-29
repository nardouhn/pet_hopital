const express = require("express");
const AppointmentRouter = express.Router();
const { authenticator } = require("../middlewares/authenticator");
const { checkRole } = require("../middlewares/authorization");
const { createAppointment, getUserAppointments, getAppointmentById, updateAppointment, adminGetAllAppointments, adminUpdateStatus, adminAssignDoctor } = require("../controllers/appointmentController");
const Appointment = require("../Models/Appointment");

// Create (Người dùng) - also expose POST /appointments when mounted accordingly
AppointmentRouter.post("/create", authenticator, checkRole(["customer"]), createAppointment);
// Also support POST /appointments by accepting POST to root if mounted as /appointments (server mounts /appointment)
AppointmentRouter.post("/", authenticator, checkRole(["customer"]), createAppointment);

// Get của riêng người dùng đó
AppointmentRouter.get("/get", authenticator, checkRole(["customer"]), getUserAppointments);
// Also provide /my
AppointmentRouter.get("/my", authenticator, checkRole(["customer"]), getUserAppointments);

// Get single appointment
AppointmentRouter.get("/:id", authenticator, getAppointmentById);

// PUT - user update (cancel / reschedule)
AppointmentRouter.put("/:id", authenticator, updateAppointment);

// Admin - list all (kept for backward compat)
AppointmentRouter.get("/getall", authenticator, checkRole(["admin"]), adminGetAllAppointments);

// Admin update status
AppointmentRouter.put("/admin/:id/status", authenticator, checkRole(["admin"]), adminUpdateStatus);

// Admin assign doctor
AppointmentRouter.put("/admin/:id/assign-doctor", authenticator, checkRole(["admin"]), adminAssignDoctor);

module.exports = { AppointmentRouter };