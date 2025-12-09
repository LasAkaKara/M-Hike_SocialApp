const Hike = require("../models/Hike");

// Create hike
exports.createHike = async (req, res, next) => {
  try {
    const {
      userId,
      name,
      location,
      length,
      difficulty,
      description,
      privacy,
      lat,
      lng,
    } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: "userId and name are required" });
    }

    const hike = await Hike.create({
      userId,
      name,
      location,
      length,
      difficulty,
      description,
      privacy: privacy || "private",
      lat,
      lng,
    });

    res.status(201).json(hike);
  } catch (err) {
    next(err);
  }
};

// Get current authenticated user's hikes (for sync)
exports.getMyHikes = async (req, res, next) => {
  try {
    const userId = req.userId; // From verifyToken middleware
    const { limit = 50, offset = 0 } = req.query;
    const hikes = await Hike.findByUserId(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(hikes);
  } catch (err) {
    next(err);
  }
};

// Get nearby hikes
exports.getNearbyHikes = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const hikes = await Hike.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );
    res.json(hikes);
  } catch (err) {
    next(err);
  }
};

// Get hikes from followed users
exports.getFollowingFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const hikes = await Hike.getFollowingFeed(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(hikes);
  } catch (err) {
    next(err);
  }
};

// Delete hike
exports.deleteHike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hike = await Hike.delete(id);

    if (!hike) {
      return res.status(404).json({ error: "Hike not found" });
    }

    res.json({ message: "Hike deleted successfully", hike });
  } catch (err) {
    next(err);
  }
};
