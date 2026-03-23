const MentalWellnessEntry = require("../models/mentalWellnessEntry");

const { calculateWellnessScore } = require("../services/mentalWellnessService");

const createEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { id: userId } = req.user;

    const existing = await MentalWellnessEntry.findOne({
      date: req.body.date || today,
      userId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Entry already exists for this date",
      });
    }

    const wellnessScore = calculateWellnessScore(req.body);

    const entry = new MentalWellnessEntry({
      ...req.body,
      date: req.body.date || today,
      wellnessScore,
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

    const entries = await MentalWellnessEntry.find({ userId }).sort({
      date: -1,
    });

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

    const entry = await MentalWellnessEntry.findOne({
      _id: req.params.id,
      userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    Object.assign(entry, req.body);

    entry.wellnessScore = calculateWellnessScore(entry);

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

    const entry = await MentalWellnessEntry.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    res.json({
      message: "Mental wellness entry deleted successfully",
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
