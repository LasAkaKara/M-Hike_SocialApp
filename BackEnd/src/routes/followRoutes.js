const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");

// Follow operations - Keep only essential endpoints
router.post("/", followController.followUser); // Follow user
router.delete("/", followController.unfollowUser); // Unfollow user
router.get("/check", followController.isFollowing); // Check if following

module.exports = router;
