const ritualService = require("../services/ritualService");

const createRitual = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const ritual = await ritualService.createRitual({
      ...req.body,
      userId,
    });

    res.status(201).json(ritual);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRitual = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const ritual = await ritualService.getRitualByDate(userId, req.params.date);
    res.json(ritual);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteActivity = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const ritual = await ritualService.deleteActivity(
      req.params.id,
      req.params.activityId,
      userId
    );

    res.json(ritual);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};










const updateActivity = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const ritual = await ritualService.updateActivity(
      req.params.id,
      req.params.activityId,
      req.body.actualValue,
      userId,
    );

    res.json(ritual);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createRitual,
  getRitual,
  updateActivity,
  deleteActivity
};
