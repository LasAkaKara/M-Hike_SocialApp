const Observation = require("../models/Observation");

// Create observation
exports.createObservation = async (req, res, next) => {
  try {
    const { hikeId, userId, title, imageUrl, lat, lng, status } = req.body;

    if (!hikeId || !userId || !title) {
      return res
        .status(400)
        .json({ error: "hikeId, userId, and title are required" });
    }

    const observation = await Observation.create({
      hikeId,
      userId,
      title,
      imageUrl,
      lat,
      lng,
      status: status || "Open",
    });

    res.status(201).json(observation);
  } catch (err) {
    next(err);
  }
};

// Get observations by hike
exports.getObservationsByHike = async (req, res, next) => {
  try {
    const { hikeId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const observations = await Observation.findByHikeId(
      hikeId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(observations);
  } catch (err) {
    next(err);
  }
};
