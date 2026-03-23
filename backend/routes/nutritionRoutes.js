const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/nutritionController");

/**
 * @swagger
 * tags:
 *   name: Nutrition
 *   description: Nutrition tracking APIs
 */

/**
 * @swagger
 * /api/nutrition:
 *   post:
 *     summary: Create nutrition entry
 *     tags: [Nutrition]
 */
router.post("/", auth, createEntry);

/**
 * @swagger
 * /api/nutrition:
 *   get:
 *     summary: Get nutrition entries
 *     tags: [Nutrition]
 */
router.get("/", auth, getEntries);

/**
 * @swagger
 * /api/nutrition/{id}:
 *   put:
 *     summary: Update nutrition entry
 *     tags: [Nutrition]
 */
router.put("/:id", auth, updateEntry);

/**
 * @swagger
 * /api/nutrition/{id}:
 *   delete:
 *     summary: Delete nutrition entry
 *     tags: [Nutrition]
 */
router.delete("/:id", auth, deleteEntry);

module.exports = router;
