const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createRitual,
  getRitual,
  updateActivity,
} = require("../controllers/ritualController");

/**
 * @swagger
 * tags:
 *   name: Ritual
 *   description: Daily ritual APIs
 */

/**
 * @swagger
 * /api/ritual:
 *   post:
 *     summary: Create ritual
 *     tags: [Ritual]
 */
router.post("/", auth, createRitual);

/**
 * @swagger
 * /api/ritual/{date}:
 *   get:
 *     summary: Get ritual by date
 *     tags: [Ritual]
 */
router.get("/:date", auth, getRitual);

/**
 * @swagger
 * /api/ritual/{id}/activity/{activityId}:
 *   put:
 *     summary: Update ritual activity
 *     tags: [Ritual]
 */
router.put("/:id/activity/:activityId", auth, updateActivity);

/**
 * @swagger
 * /api/ritual/{id}/activity:
 *   post:
 *     summary: Add new activity to existing ritual
 *     tags: [Ritual]
 */

router.post("/:id/activity", auth, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const ritual = await require("../services/ritualService").addActivity(
      req.params.id,
      req.body,
      userId,
    );

    res.json(ritual);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
