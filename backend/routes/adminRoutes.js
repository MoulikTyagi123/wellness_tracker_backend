const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// ✅ FIXED IMPORT
const adminController = require("../controllers/adminController");

// TEST
router.get("/test", auth, admin, (req, res) => {
  res.json({ message: "admin access granted" });
});

// DASHBOARD
router.get("/dashboard", auth, admin, adminController.getAllDashboard);

// USERS
router.get("/users", auth, admin, adminController.getAllUsers);

// STATS
router.get("/stats", auth, admin, adminController.getStats);

// ANALYTICS
router.get("/analytics", auth, admin, adminController.getAnalytics);

// SINGLE USER
router.get("/users/:id", auth, admin, adminController.getSingleUser);
router.get("/users/:id/analytics", adminController.getUserAnalytics);
module.exports = router;
