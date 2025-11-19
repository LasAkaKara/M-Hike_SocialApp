const express = require("express");
const router = express.Router();
const DiscoveryFeedService = require("../services/discoveryFeedService");
const authMiddleware = require("../middlewares/authMiddleware");

// Get discovery feed based on location
router.get("/nearby", async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, limit = 50, offset = 0 } = req.query;
    const userId = req.userId || null;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const feed = await DiscoveryFeedService.getDiscoveryFeed(
      userId,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit),
      parseInt(offset)
    );

    res.json(feed);
  } catch (err) {
    next(err);
  }
});

// Get trending nearby observations
router.get("/trending-nearby", async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const observations = await DiscoveryFeedService.getTrendingNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );

    res.json(observations);
  } catch (err) {
    next(err);
  }
});

// Get popular hikes nearby
router.get("/popular-hikes", async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const hikes = await DiscoveryFeedService.getPopularHikesNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );

    res.json(hikes);
  } catch (err) {
    next(err);
  }
});

// Get personalized feed (requires auth)
router.get(
  "/personalized",
  authMiddleware.verifyToken,
  async (req, res, next) => {
    try {
      const userId = req.userId;
      const { limit = 50, offset = 0 } = req.query;

      const feed = await DiscoveryFeedService.getPersonalizedFeed(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json(feed);
    } catch (err) {
      next(err);
    }
  }
);

// Auto-populate feed (requires auth)
router.post(
  "/populate-feed",
  authMiddleware.verifyToken,
  async (req, res, next) => {
    try {
      const userId = req.userId;
      const result = await DiscoveryFeedService.autoPopulateFeed(userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// Get recommendations (requires auth)
router.get(
  "/recommendations",
  authMiddleware.verifyToken,
  async (req, res, next) => {
    try {
      const userId = req.userId;
      const { limit = 50 } = req.query;

      const recommendations = await DiscoveryFeedService.getRecommendations(
        userId,
        parseInt(limit)
      );

      res.json(recommendations);
    } catch (err) {
      next(err);
    }
  }
);

// Get trending hikes globally
router.get("/trending-hikes", async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const hikes = await DiscoveryFeedService.getTrendingHikes(
      parseInt(limit),
      parseInt(offset)
    );

    res.json(hikes);
  } catch (err) {
    next(err);
  }
});

// Get trending observations globally
router.get("/trending-observations", async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const observations = await DiscoveryFeedService.getTrendingObservations(
      parseInt(limit),
      parseInt(offset)
    );

    res.json(observations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
