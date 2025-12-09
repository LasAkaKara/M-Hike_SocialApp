const Follow = require("../models/Follow");

// Follow a user
exports.followUser = async (req, res, next) => {
  try {
    const { followerId, followedId } = req.body;

    if (!followerId || !followedId) {
      return res
        .status(400)
        .json({ error: "followerId and followedId are required" });
    }

    if (followerId === followedId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const follow = await Follow.create(followerId, followedId);
    await Follow.updateUserCounts(followedId);
    await Follow.updateUserCounts(followerId);

    res.status(201).json(follow || { message: "Already following this user" });
  } catch (err) {
    next(err);
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res, next) => {
  try {
    const { followerId, followedId } = req.body;

    if (!followerId || !followedId) {
      return res
        .status(400)
        .json({ error: "followerId and followedId are required" });
    }

    const follow = await Follow.delete(followerId, followedId);

    if (!follow) {
      return res.status(404).json({ error: "Follow relationship not found" });
    }

    await Follow.updateUserCounts(followedId);
    await Follow.updateUserCounts(followerId);

    res.json({ message: "Unfollowed successfully", follow });
  } catch (err) {
    next(err);
  }
};

// Check if following
exports.isFollowing = async (req, res, next) => {
  try {
    const { followerId, followedId } = req.query;

    if (!followerId || !followedId) {
      return res
        .status(400)
        .json({ error: "followerId and followedId are required" });
    }

    const isFollowing = await Follow.isFollowing(followerId, followedId);
    res.json({ isFollowing });
  } catch (err) {
    next(err);
  }
};
