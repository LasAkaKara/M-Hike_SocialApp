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

// Get followers
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const followers = await Follow.getFollowers(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(followers);
  } catch (err) {
    next(err);
  }
};

// Get following
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const following = await Follow.getFollowing(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(following);
  } catch (err) {
    next(err);
  }
};

// Get follower count
exports.getFollowerCount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await Follow.getFollowerCount(userId);
    res.json({ userId, followerCount: count });
  } catch (err) {
    next(err);
  }
};

// Get following count
exports.getFollowingCount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await Follow.getFollowingCount(userId);
    res.json({ userId, followingCount: count });
  } catch (err) {
    next(err);
  }
};

// Get mutual followers
exports.getMutualFollowers = async (req, res, next) => {
  try {
    const { userId1, userId2 } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const mutualFollowers = await Follow.getMutualFollowers(
      userId1,
      userId2,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(mutualFollowers);
  } catch (err) {
    next(err);
  }
};
