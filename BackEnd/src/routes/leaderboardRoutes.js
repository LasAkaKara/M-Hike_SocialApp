const express = require("express");
const router = express.Router();
const LeaderboardService = require("../services/leaderboardService");

// Get distance leaderboard
router.get("/distance", async (req, res, next) => {
  try {
    const { limit = 10, region, offset = 0 } = req.query;
    const leaderboard = await LeaderboardService.getDistanceLeaderboard(
      parseInt(limit),
      region || null,
      parseInt(offset)
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// Get hike count leaderboard
router.get("/hikes", async (req, res, next) => {
  try {
    const { limit = 10, region, offset = 0 } = req.query;
    const leaderboard = await LeaderboardService.getHikeCountLeaderboard(
      parseInt(limit),
      region || null,
      parseInt(offset)
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// Get difficulty leaderboard
router.get("/difficulty", async (req, res, next) => {
  try {
    const { limit = 10, region, offset = 0 } = req.query;
    const leaderboard = await LeaderboardService.getDifficultyLeaderboard(
      parseInt(limit),
      region || null,
      parseInt(offset)
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// Get observation leaderboard
router.get("/observations", async (req, res, next) => {
  try {
    const { limit = 10, region, offset = 0 } = req.query;
    const leaderboard = await LeaderboardService.getObservationLeaderboard(
      parseInt(limit),
      region || null,
      parseInt(offset)
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// Get followers leaderboard
router.get("/followers", async (req, res, next) => {
  try {
    const { limit = 10, region, offset = 0 } = req.query;
    const leaderboard = await LeaderboardService.getFollowerLeaderboard(
      parseInt(limit),
      region || null,
      parseInt(offset)
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// Get user rank
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type = "distance", region } = req.query;
    const rank = await LeaderboardService.getUserRank(
      userId,
      type,
      region || null
    );

    if (!rank) {
      return res.status(404).json({ error: "User not found in leaderboard" });
    }

    res.json(rank);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
