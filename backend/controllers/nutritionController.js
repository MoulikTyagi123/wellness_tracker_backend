const NutritionEntry = require("../models/NutritionEntry");
const { calculateNutritionScore } = require("../services/nutritionService");

const createEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { id: userId } = req.user;

    const existing = await NutritionEntry.findOne({
      date: req.body.date || today,
      userId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Entry already exists for this date",
      });
    }

    const score = calculateNutritionScore(req.body);

    const entry = new NutritionEntry({
      ...req.body,
      date: req.body.date || today,
      score,
      userId,
    });

    const saved = await entry.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getEntries = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const entries = await NutritionEntry.find({ userId }).sort({ date: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateEntry = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const entry = await NutritionEntry.findOne({
      _id: req.params.id,
      userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    Object.assign(entry, req.body);

    entry.score = calculateNutritionScore(entry);

    const updated = await entry.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const entry = await NutritionEntry.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    res.json({
      message: "Nutrition entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
};
