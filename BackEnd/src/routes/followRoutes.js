const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");

// Follow operations
router.post("/", followController.followUser);
router.delete("/", followController.unfollowUser);
router.get("/check", followController.isFollowing);

// Get followers and following
router.get("/:userId/followers", followController.getFollowers);
router.get("/:userId/following", followController.getFollowing);
router.get("/:userId/followers/count", followController.getFollowerCount);
router.get("/:userId/following/count", followController.getFollowingCount);

// Mutual followers
router.get("/:userId1/mutual/:userId2", followController.getMutualFollowers);

module.exports = router;
