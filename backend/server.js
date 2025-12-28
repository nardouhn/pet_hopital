const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { sequelize } = require("./config/db"); // Sequelize instance
const { userRouter } = require("./Routes/userrouter");
const { doctorRouter } = require("./Routes/DoctorRouter");
const { AppointmentRouter } = require("./Routes/AppointmentRouter");
const { timeSlot } = require("./Routes/bookingRoute");
const { successResponse } = require("./helpers/successAndErrorResponse");
const specs = require("./config/swaggerConfig");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors());

// Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// Health check
app.get("/", (req, res) => {
  res.status(200).json(
    successResponse(200, "Server is running successfully", null)
  );
});

// Routes
app.use("/user", userRouter);
app.use("/doctor", doctorRouter);
app.use("/", timeSlot);
app.use("/appointment", AppointmentRouter);

// START SERVER AFTER DB CONNECT
const startServer = async () => {
  try {
    await sequelize.authenticate(); // Kiểm tra kết nối PostgreSQL
    console.log("✅ Connected to PostgreSQL");

    // Nếu muốn, đồng bộ models (chỉ nên dùng trong dev)
    // await sequelize.sync({ alter: true }); // tạo bảng nếu chưa có, tự cập nhật cấu trúc

    app.listen(port, "0.0.0.0", () => {
      console.log("🚀 Server running on port " + port);
    });
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

