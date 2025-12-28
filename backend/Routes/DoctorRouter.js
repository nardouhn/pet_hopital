// const express = require("express");
// const {DoctorModel}=require('../Models/DoctorModel')


// const doctorRouter=express.Router()

// doctorRouter.get("/getparticulardoc/:id",async(req,res)=>{
//     try {
//         let id = req.params.id
//         let data = await DoctorModel.findById({_id:id});
//         res.send(data);
//     } catch (error) {
//         console.log(error);
//     }
// })
// doctorRouter.get("/getAllDoc",async(req,res)=>{
//     try {
//         let data = await DoctorModel.find()
//         res.json({msg:"success",data:data});
//     } catch (error) {
//         console.log(error);
//     }
// })

// doctorRouter.get("/getDocID/:name",async(req,res)=>{
//     try { 
//             let name=req.params.name;
//             let user=await DoctorModel.findOne({"name":name})
//             res.send({"ID":user._id})

//     } catch (error) {
//         console.log({"Error":error.message});
//         res.send({"Error":error.message});
//     }   
// })

// doctorRouter.post("/register",async(req,res)=>{
//     try { 
//             let user=new DoctorModel(req.body)
//             await user.save();
//             res.send({"mess":"Doctor Registered Successfull"})

//     } catch (error) {
//         console.log({"Error":error.message});
//         res.send({"Error":error.message});
//     }   
// })


// doctorRouter.delete("/delete/:id",async(req,res)=>{
//     try {
//         let id=req.params.id;
//         let user=await DoctorModel.findByIdAndDelete({_id:id});
//         res.send({"mess":"Doctor Deleted"})
//     } catch (error) {
//         res.send({"Error":error.message})
//     }

// })


// module.exports={doctorRouter}

const express = require("express");
const db = require("../config/db"); // mysql connection

const doctorRouter = express.Router();

/* =========================
   GET ALL DOCTORS
========================= */
doctorRouter.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM doctor");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   GET DOCTOR BY ID
========================= */
doctorRouter.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM doctor WHERE doctor_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   CREATE DOCTOR (ADMIN)
========================= */
doctorRouter.post("/", async (req, res) => {
    try {
        const { doctor_name, birth, email, phone } = req.body;

        await db.query(
            `INSERT INTO doctor (doctor_name, birth, email, phone)
             VALUES (?, ?, ?, ?)`,
            [doctor_name, birth, email, phone]
        );

        res.status(201).json({ message: "Doctor created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   DELETE DOCTOR (ADMIN)
========================= */
doctorRouter.delete("/:id", async (req, res) => {
    try {
        await db.query(
            "DELETE FROM doctor WHERE doctor_id = ?",
            [req.params.id]
        );
        res.status(200).json({ message: "Doctor deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { doctorRouter };
