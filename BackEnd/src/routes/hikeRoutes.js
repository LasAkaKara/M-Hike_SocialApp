const express = require("express");
const router = express.Router();
const hikeController = require("../controllers/hikeController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Hike CRUD - Keep only essential endpoints
router.post("/", hikeController.createHike); // Create/sync hike
router.get("/my", verifyToken, hikeController.getMyHikes); // Get authenticated user's hikes
router.get("/nearby", hikeController.getNearbyHikes); // Get nearby hikes
router.get("/user/:userId/following", hikeController.getFollowingFeed); // Feed from followed users
router.delete("/:id", hikeController.deleteHike); // Delete hike

module.exports = router;
