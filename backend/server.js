const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const ritualRoutes = require("./routes/ritualRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const sleepRoutes = require("./routes/sleepRoutes");
const mentalWellnessRoutes = require("./routes/mentalWellnessRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const passport = require("./config/passport");

const app = express();

// 🔒 SECURITY MIDDLEWARE
app.use(helmet());
app.use(cors());

// 🚦 RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

app.use(limiter);

// BODY PARSER
app.use(express.json());

// PASSPORT
app.use(passport.initialize());

// DATABASE
mongoose
  .connect("mongodb://localhost:27017/wellness-tracker")
  .then(() => console.log("MongoDB Connected"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ROUTES
app.use("/api/ritual", ritualRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/mental", mentalWellnessRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
