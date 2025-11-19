const express = require("express");
const router = express.Router();
const SearchService = require("../services/searchService");

// Advanced hike search
router.get("/hikes", async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name,
      location: req.query.location,
      minLength: req.query.minLength
        ? parseFloat(req.query.minLength)
        : undefined,
      maxLength: req.query.maxLength
        ? parseFloat(req.query.maxLength)
        : undefined,
      difficulty: req.query.difficulty,
      region: req.query.region,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minRating: req.query.minRating
        ? parseInt(req.query.minRating)
        : undefined,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "DESC",
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const results = await SearchService.advancedHikeSearch(filters);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Advanced observation search
router.get("/observations", async (req, res, next) => {
  try {
    const filters = {
      title: req.query.title,
      status: req.query.status,
      minConfirmations: req.query.minConfirmations
        ? parseInt(req.query.minConfirmations)
        : undefined,
      maxDisputes: req.query.maxDisputes
        ? parseInt(req.query.maxDisputes)
        : undefined,
      hikeId: req.query.hikeId ? parseInt(req.query.hikeId) : undefined,
      userId: req.query.userId ? parseInt(req.query.userId) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "DESC",
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const results = await SearchService.advancedObservationSearch(filters);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Search users
router.get("/users", async (req, res, next) => {
  try {
    const filters = {
      username: req.query.username,
      region: req.query.region,
      minFollowers: req.query.minFollowers
        ? parseInt(req.query.minFollowers)
        : undefined,
      maxFollowers: req.query.maxFollowers
        ? parseInt(req.query.maxFollowers)
        : undefined,
      sortBy: req.query.sortBy || "followerCount",
      sortOrder: req.query.sortOrder || "DESC",
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const results = await SearchService.searchUsers(filters);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Global search
router.get("/global", async (req, res, next) => {
  try {
    const { q, limit = 50 } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SearchService.globalSearch(q, parseInt(limit));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Get search suggestions
router.get("/suggestions", async (req, res, next) => {
  try {
    const { q, type = "all" } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const suggestions = await SearchService.getSearchSuggestions(q, type);
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
