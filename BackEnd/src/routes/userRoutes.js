const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User CRUD
router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/username/:username", userController.getUserByUsername);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// User stats and leaderboards
router.get("/:id/stats", userController.getUserStats);
router.get("/leaderboard/distance", userController.getLeaderboardByDistance);
router.get("/leaderboard/hikes", userController.getLeaderboardByHikeCount);

module.exports = router;
