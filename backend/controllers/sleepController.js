const SleepEntry = require("../models/SleepEntry");
const { calculateSleepConsistencyScore } = require("../services/sleepService");

const getEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await SleepEntry.find({ userId }).sort({ date: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entry = await SleepEntry.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    res.json({
      message: "Sleep entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entry = await SleepEntry.findOne({ _id: req.params.id, userId });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    Object.assign(entry, req.body);

    entry.sleepConsistencyScore = calculateSleepConsistencyScore(entry);

    const updated = await entry.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userId = req.user.id;
    const existing = await SleepEntry.findOne({
      date: req.body.date || today,
      userId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Entry already exists for this date",
      });
    }

    const sleepConsistencyScore = calculateSleepConsistencyScore(req.body);

    const entry = new SleepEntry({
      ...req.body,
      date: req.body.date || today,
      sleepConsistencyScore,
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

module.exports = {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
};
