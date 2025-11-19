const Observation = require("../models/Observation");

// Get observation by ID
exports.getObservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const observation = await Observation.findById(id);

    if (!observation) {
      return res.status(404).json({ error: "Observation not found" });
    }

    res.json(observation);
  } catch (err) {
    next(err);
  }
};

// Get all public observations
exports.getPublicObservations = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const observations = await Observation.findPublic(
      parseInt(limit),
      parseInt(offset)
    );
    res.json(observations);
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

// Get observations by user
exports.getObservationsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const observations = await Observation.findByUserId(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(observations);
  } catch (err) {
    next(err);
  }
};

// Get nearby observations
exports.getNearbyObservations = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const observations = await Observation.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );
    res.json(observations);
  } catch (err) {
    next(err);
  }
};

// Search observations by title
exports.searchObservations = async (req, res, next) => {
  try {
    const { title, limit = 50, offset = 0 } = req.query;

    if (!title) {
      return res.status(400).json({ error: "Search title is required" });
    }

    const observations = await Observation.searchByTitle(
      title,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(observations);
  } catch (err) {
    next(err);
  }
};

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

// Update observation
exports.updateObservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, lat, lng, status, confirmations, disputes } =
      req.body;

    const observation = await Observation.update(id, {
      title,
      imageUrl,
      lat,
      lng,
      status,
      confirmations,
      disputes,
    });

    if (!observation) {
      return res.status(404).json({ error: "Observation not found" });
    }

    res.json(observation);
  } catch (err) {
    next(err);
  }
};

// Delete observation
exports.deleteObservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const observation = await Observation.delete(id);

    if (!observation) {
      return res.status(404).json({ error: "Observation not found" });
    }

    res.json({ message: "Observation deleted successfully", observation });
  } catch (err) {
    next(err);
  }
};

// Confirm observation
exports.confirmObservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const observation = await Observation.incrementConfirmations(id);

    if (!observation) {
      return res.status(404).json({ error: "Observation not found" });
    }

    res.json(observation);
  } catch (err) {
    next(err);
  }
};

// Dispute observation
exports.disputeObservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const observation = await Observation.incrementDisputes(id);

    if (!observation) {
      return res.status(404).json({ error: "Observation not found" });
    }

    res.json(observation);
  } catch (err) {
    next(err);
  }
};

// Get observations from followed users
exports.getFollowingObservations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const observations = await Observation.getFollowingObservations(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(observations);
  } catch (err) {
    next(err);
  }
};

// Get trending observations
exports.getTrendingObservations = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const observations = await Observation.getTrending(
      parseInt(limit),
      parseInt(offset)
    );
    res.json(observations);
  } catch (err) {
    next(err);
  }
};
