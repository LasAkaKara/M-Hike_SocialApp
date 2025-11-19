const User = require("../models/User");
const Follow = require("../models/Follow");

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Get user by username
exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await User.findAll(parseInt(limit), parseInt(offset));
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Create user
exports.createUser = async (req, res, next) => {
  try {
    const { username, avatarUrl, bio, region } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.create({ username, avatarUrl, bio, region });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username already exists" });
    }
    next(err);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, avatarUrl, bio, region } = req.body;

    const user = await User.update(id, { username, avatarUrl, bio, region });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username already exists" });
    }
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.delete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully", user });
  } catch (err) {
    next(err);
  }
};

// Get user stats
exports.getUserStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await User.getStats(id);

    if (!stats) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Get leaderboard by distance
exports.getLeaderboardByDistance = async (req, res, next) => {
  try {
    const { limit = 10, region } = req.query;
    const leaderboard = await User.getLeaderboardByDistance(
      parseInt(limit),
      region || null
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
};

// Get leaderboard by hike count
exports.getLeaderboardByHikeCount = async (req, res, next) => {
  try {
    const { limit = 10, region } = req.query;
    const leaderboard = await User.getLeaderboardByHikeCount(
      parseInt(limit),
      region || null
    );
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
};
