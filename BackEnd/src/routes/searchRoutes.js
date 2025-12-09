const express = require("express");
const router = express.Router();
const SearchService = require("../services/searchService");

// Search users - Keep only this endpoint
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

module.exports = router;
