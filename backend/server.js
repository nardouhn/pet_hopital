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
const { authRouter } = require("./Routes/authRouter");
const { usersRouter } = require("./Routes/usersRouter");
const { adminUsersRouter } = require("./Routes/adminUsersRouter");
const { successResponse } = require("./helpers/successAndErrorResponse");
const specs = require("./config/swaggerConfig");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cookieParser());
app.use(express.json());

// Configure CORS to allow the frontend origin and include credentials (cookies)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};
app.use(cors(corsOptions));
// Ensure pre-flight (OPTIONS) responses use the same CORS options
app.options('*', cors(corsOptions));

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

// New: standard auth / users / admin routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/admin/users', adminUsersRouter);

// Pets
const { petRouter } = require('./Routes/petRouter');
const { adminPetsRouter } = require('./Routes/adminPetsRouter');
app.use('/pets', petRouter);
app.use('/admin/pets', adminPetsRouter);

// Appointments - also expose plural admin path
const { adminAppointmentsRouter } = require('./Routes/adminAppointmentsRouter');
app.use('/admin/appointments', adminAppointmentsRouter);

// Medical records
const { medicalRecordsRouter } = require('./Routes/medicalRecordsRouter');
app.use('/medical-records', medicalRecordsRouter);

// Services & Medicines
const { servicesRouter } = require('./Routes/servicesRouter');
app.use('/', servicesRouter);

// Staff & schedules
const { staffRouter } = require('./Routes/staffRouter');
app.use('/staff', staffRouter);

// Statistics (admin)
const { statisticsRouter } = require('./Routes/statisticsRouter');
app.use('/admin/statistics', statisticsRouter);

// Feedback
const { feedbackRouter } = require('./Routes/feedbackRouter');
app.use('/feedback', feedbackRouter);

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

