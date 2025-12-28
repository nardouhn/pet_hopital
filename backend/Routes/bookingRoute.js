const express = require("express");
const { SlotBookingModel } = require("../Models/BookingModel");

const timeSlot = express.Router();

/* =========================
   CREATE TIMESLOT
========================= */
timeSlot.post("/booktime/:uniqueId", async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const { date, slots } = req.body; // date: YYYY-MM-DD

        if (!date || !slots) {
            return res.status(400).json({ msg: "Missing date or slots" });
        }

        const today = new Date();
        const target = new Date(date);

        const diff =
            (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        if (diff < 0 || diff > 7) {
            return res.status(400).json({ msg: "Invalid Date" });
        }

        const data = await SlotBookingModel.create({
            uniqueId,
            date,
            slots,
        });

        res.status(201).json({ msg: "Time slot created", data });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/* =========================
   GET TIMESLOT BY DOCTOR
========================= */
timeSlot.get("/gettime/:uniqueId", async (req, res) => {
    try {
        const data = await SlotBookingModel.find({
            uniqueId: req.params.uniqueId,
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/* =========================
   GET ALL TIMESLOTS
========================= */
timeSlot.get("/gettime", async (req, res) => {
    try {
        const data = await SlotBookingModel.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/* =========================
   UPDATE FULL SLOT SET
========================= */
timeSlot.patch("/addtime/:uniqueId", async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const { date, slots } = req.body;

        if (!date || !slots) {
            return res.status(400).json({ msg: "Missing date or slots" });
        }

        await SlotBookingModel.updateOne(
            { uniqueId, date },
            { slots },
            { upsert: true }
        );

        res.json({ msg: "Slots updated successfully" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/* =========================
   DISABLE ONE SLOT
========================= */
timeSlot.patch("/hidetime", async (req, res) => {
    try {
        const { uniqueId, date, time } = req.body;

        const record = await SlotBookingModel.findOne({ uniqueId, date });
        if (!record) {
            return res.status(404).json({ msg: "Slot not found" });
        }

        if (record.slots[time] === undefined) {
            return res.status(400).json({ msg: "Invalid time key" });
        }

        record.slots[time] = false;
        await record.save();

        res.json({ msg: "Slot disabled successfully" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

module.exports = { timeSlot };
