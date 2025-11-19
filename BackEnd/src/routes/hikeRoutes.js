const express = require("express");
const router = express.Router();
const hikeController = require("../controllers/hikeController");

// Hike CRUD
router.post("/", hikeController.createHike);
router.get("/", hikeController.getPublicHikes);
router.get("/search", hikeController.searchHikes);
router.get("/filter", hikeController.filterHikes);
router.get("/nearby", hikeController.getNearbyHikes);
router.get("/user/:userId", hikeController.getHikesByUser);
router.get("/user/:userId/following", hikeController.getFollowingFeed);
router.get("/:id", hikeController.getHikeById);
router.put("/:id", hikeController.updateHike);
router.delete("/:id", hikeController.deleteHike);

module.exports = router;
