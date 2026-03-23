const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/sleepController");

/**
 * @swagger
 * tags:
 *   name: Sleep
 *   description: Sleep tracking APIs
 */

/**
 * @swagger
 * /api/sleep:
 *   post:
 *     summary: Create sleep entry
 *     tags: [Sleep]
 */
router.post("/", auth, createEntry);

/**
 * @swagger
 * /api/sleep:
 *   get:
 *     summary: Get sleep entries
 *     tags: [Sleep]
 */
router.get("/", auth, getEntries);

/**
 * @swagger
 * /api/sleep/{id}:
 *   put:
 *     summary: Update sleep entry
 *     tags: [Sleep]
 */
router.put("/:id", auth, updateEntry);

/**
 * @swagger
 * /api/sleep/{id}:
 *   delete:
 *     summary: Delete sleep entry
 *     tags: [Sleep]
 */
router.delete("/:id", auth, deleteEntry);

module.exports = router;
