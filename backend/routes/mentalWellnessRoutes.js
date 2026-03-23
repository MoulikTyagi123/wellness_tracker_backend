const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/mentalWellnessController");

/**
 * @swagger
 * tags:
 *   name: Mental Wellness
 *   description: Mental wellness tracking APIs
 */

/**
 * @swagger
 * /api/mental:
 *   post:
 *     summary: Create mental wellness entry
 *     tags: [Mental Wellness]
 */
router.post("/", auth, createEntry);

/**
 * @swagger
 * /api/mental:
 *   get:
 *     summary: Get mental wellness entries
 *     tags: [Mental Wellness]
 */
router.get("/", auth, getEntries);

/**
 * @swagger
 * /api/mental/{id}:
 *   put:
 *     summary: Update mental wellness entry
 *     tags: [Mental Wellness]
 */
router.put("/:id", auth, updateEntry);

/**
 * @swagger
 * /api/mental/{id}:
 *   delete:
 *     summary: Delete mental wellness entry
 *     tags: [Mental Wellness]
 */
router.delete("/:id", auth, deleteEntry);

module.exports = router;
