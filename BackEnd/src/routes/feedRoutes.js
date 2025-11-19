const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");

// Feed operations
router.post("/", feedController.addItemToFeed);
router.get("/check", feedController.isItemInFeed);

// Get feeds
router.get("/:userId", feedController.getUserFeed);
router.get("/:userId/hikes", feedController.getHikeFeedItems);
router.get("/:userId/observations", feedController.getObservationFeedItems);
router.get("/:userId/mixed", feedController.getMixedFeed);
router.get("/:userId/count", feedController.getFeedCount);

// Manage feed
router.delete("/:id", feedController.deleteFeedItem);
router.delete("/:userId/clear", feedController.clearUserFeed);

// Populate feed from followed users
router.post(
  "/:userId/populate/hikes",
  feedController.populateFollowingHikesFeed
);
router.post(
  "/:userId/populate/observations",
  feedController.populateFollowingObservationsFeed
);

module.exports = router;
