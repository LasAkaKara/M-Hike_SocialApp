const Feed = require("../models/Feed");

// Get user feed
exports.getUserFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const feed = await Feed.getUserFeed(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(feed);
  } catch (err) {
    next(err);
  }
};

// Get hike feed items
exports.getHikeFeedItems = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const items = await Feed.getHikeFeedItems(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Get observation feed items
exports.getObservationFeedItems = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const items = await Feed.getObservationFeedItems(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Get mixed feed
exports.getMixedFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const items = await Feed.getMixedFeed(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Add item to feed
exports.addItemToFeed = async (req, res, next) => {
  try {
    const { userId, itemType, itemId } = req.body;

    if (!userId || !itemType || !itemId) {
      return res
        .status(400)
        .json({ error: "userId, itemType, and itemId are required" });
    }

    if (!["hike", "observation"].includes(itemType)) {
      return res
        .status(400)
        .json({ error: 'itemType must be "hike" or "observation"' });
    }

    const item = await Feed.addItem(userId, itemType, itemId);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Delete feed item
exports.deleteFeedItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Feed.deleteItem(id);

    if (!item) {
      return res.status(404).json({ error: "Feed item not found" });
    }

    res.json({ message: "Feed item deleted successfully", item });
  } catch (err) {
    next(err);
  }
};

// Clear user feed
exports.clearUserFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const items = await Feed.clearUserFeed(userId);
    res.json({
      message: "Feed cleared successfully",
      deletedCount: items.length,
    });
  } catch (err) {
    next(err);
  }
};

// Populate following hikes feed
exports.populateFollowingHikesFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const items = await Feed.populateFollowingHikesFeed(userId);
    res.json({
      message: "Following hikes feed populated",
      addedCount: items.length,
    });
  } catch (err) {
    next(err);
  }
};

// Populate following observations feed
exports.populateFollowingObservationsFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const items = await Feed.populateFollowingObservationsFeed(userId);
    res.json({
      message: "Following observations feed populated",
      addedCount: items.length,
    });
  } catch (err) {
    next(err);
  }
};

// Get feed count
exports.getFeedCount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await Feed.getFeedCount(userId);
    res.json({ userId, feedCount: count });
  } catch (err) {
    next(err);
  }
};

// Check if item is in feed
exports.isItemInFeed = async (req, res, next) => {
  try {
    const { userId, itemType, itemId } = req.query;

    if (!userId || !itemType || !itemId) {
      return res
        .status(400)
        .json({ error: "userId, itemType, and itemId are required" });
    }

    const isInFeed = await Feed.isItemInFeed(userId, itemType, itemId);
    res.json({ userId, itemType, itemId, isInFeed });
  } catch (err) {
    next(err);
  }
};
