const db = require("../configs/db");

class Feed {
  // Add item to feed
  static async addItem(userId, itemType, itemId) {
    const result = await db.query(
      `INSERT INTO feeds (userId, itemType, itemId)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, itemType, itemId]
    );
    return result.rows[0];
  }

  // Get feed for a user
  static async getUserFeed(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT f.* FROM feeds f
       WHERE f.userId = $1
       ORDER BY f.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get hike feed items with details
  static async getHikeFeedItems(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT f.id, f.userId, f.itemType, f.itemId, f.createdAt,
              h.id as hikeId, h.name, h.location, h.length, h.difficulty,
              h.description, u.username, u.avatarUrl
       FROM feeds f
       LEFT JOIN hikes h ON f.itemId = h.id
       LEFT JOIN users u ON h.userId = u.id
       WHERE f.userId = $1 AND f.itemType = 'hike'
       ORDER BY f.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get observation feed items with details
  static async getObservationFeedItems(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT f.id, f.userId, f.itemType, f.itemId, f.createdAt,
              o.id as observationId, o.title, o.imageUrl, o.status,
              o.confirmations, o.disputes, u.username, u.avatarUrl,
              h.name as hikeName
       FROM feeds f
       LEFT JOIN observations o ON f.itemId = o.id
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE f.userId = $1 AND f.itemType = 'observation'
       ORDER BY f.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get mixed feed (both hikes and observations)
  static async getMixedFeed(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT 
        f.id, f.userId, f.itemType, f.itemId, f.createdAt,
        h.id as hikeId, h.name as hikeName, h.location, h.length, h.difficulty,
        h.description, h.privacy,
        o.id as observationId, o.title as observationTitle, o.imageUrl, 
        o.status, o.confirmations, o.disputes,
        u.username, u.avatarUrl
       FROM feeds f
       LEFT JOIN hikes h ON f.itemType = 'hike' AND f.itemId = h.id
       LEFT JOIN observations o ON f.itemType = 'observation' AND f.itemId = o.id
       LEFT JOIN users u ON CASE 
         WHEN f.itemType = 'hike' THEN h.userId = u.id
         WHEN f.itemType = 'observation' THEN o.userId = u.id
       END
       WHERE f.userId = $1
       ORDER BY f.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Delete feed item
  static async deleteItem(id) {
    const result = await db.query(
      "DELETE FROM feeds WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Clear user's feed
  static async clearUserFeed(userId) {
    const result = await db.query(
      "DELETE FROM feeds WHERE userId = $1 RETURNING *",
      [userId]
    );
    return result.rows;
  }

  // Populate feed for user from followed users' hikes
  static async populateFollowingHikesFeed(userId) {
    const result = await db.query(
      `INSERT INTO feeds (userId, itemType, itemId)
       SELECT $1, 'hike', h.id
       FROM hikes h
       WHERE h.userId IN (
         SELECT followedId FROM follows WHERE followerId = $1
       ) AND h.privacy = 'public'
       AND h.id NOT IN (
         SELECT itemId FROM feeds WHERE userId = $1 AND itemType = 'hike'
       )
       RETURNING *`,
      [userId]
    );
    return result.rows;
  }

  // Populate feed for user from followed users' observations
  static async populateFollowingObservationsFeed(userId) {
    const result = await db.query(
      `INSERT INTO feeds (userId, itemType, itemId)
       SELECT $1, 'observation', o.id
       FROM observations o
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE o.userId IN (
         SELECT followedId FROM follows WHERE followerId = $1
       ) AND h.privacy = 'public'
       AND o.id NOT IN (
         SELECT itemId FROM feeds WHERE userId = $1 AND itemType = 'observation'
       )
       RETURNING *`,
      [userId]
    );
    return result.rows;
  }

  // Get feed count
  static async getFeedCount(userId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM feeds WHERE userId = $1`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // Check if item is in feed
  static async isItemInFeed(userId, itemType, itemId) {
    const result = await db.query(
      `SELECT * FROM feeds 
       WHERE userId = $1 AND itemType = $2 AND itemId = $3`,
      [userId, itemType, itemId]
    );
    return result.rows.length > 0;
  }
}

module.exports = Feed;
