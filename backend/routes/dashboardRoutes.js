const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: User dashboard APIs
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get user dashboard summary
 *     tags: [Dashboard]
 */
router.get("/", auth, dashboardController.getDashboard);

/**
 * @swagger
 * /api/my-analytics:
 *   get:
 *     summary: Get user dashboard Analytics
 *     tags: [Dashboard]
 */
router.get("/my-analytics", auth, dashboardController.getMyAnalytics);
module.exports = router;
