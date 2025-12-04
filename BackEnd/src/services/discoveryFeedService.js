const db = require("../configs/db");
const Feed = require("../models/Feed");
const Observation = require("../models/Observation");
const Hike = require("../models/Hike");

class DiscoveryFeedService {
  // Get discovery feed based on user location and interests
  static async getDiscoveryFeed(
    userId,
    lat,
    lng,
    radiusKm = 5,
    limit = 50,
    offset = 0
  ) {
    try {
      const result = await db.query(
        `SELECT 
          'observation' as itemType,
          o.id as itemId,
          o.id as observationId,
          o.title,
          o.imageUrl,
          o.status,
          o.confirmations,
          o.disputes,
          o.lat,
          o.lng,
          ST_Distance(o.geom, ST_GeomFromText($1, 4326)) / 1000 as distanceKm,
          u.id as userId,
          u.username,
          u.avatarUrl,
          h.name as hikeName,
          o.createdAt
        FROM observations o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN hikes h ON o.hikeId = h.id
        WHERE h.privacy = 'Public'
          AND ST_DWithin(o.geom, ST_GeomFromText($1, 4326), $2 * 1000)
        ORDER BY o.confirmations DESC, distanceKm ASC, o.createdAt DESC
        LIMIT $3 OFFSET $4`,
        [`POINT(${lng} ${lat})`, radiusKm, limit, offset]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get trending observations in user's area
  static async getTrendingNearby(lat, lng, radiusKm = 5, limit = 50) {
    try {
      const result = await db.query(
        `SELECT 
          o.id,
          o.title,
          o.imageUrl,
          o.status,
          o.confirmations,
          o.disputes,
          o.lat,
          o.lng,
          ST_Distance(o.geom, ST_GeomFromText($1, 4326)) / 1000 as distanceKm,
          u.username,
          u.avatarUrl,
          h.name as hikeName,
          o.createdAt
        FROM observations o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN hikes h ON o.hikeId = h.id
        WHERE h.privacy = 'Public'
          AND ST_DWithin(o.geom, ST_GeomFromText($1, 4326), $2 * 1000)
        ORDER BY o.confirmations DESC, o.disputes ASC, distanceKm ASC
        LIMIT $3`,
        [`POINT(${lng} ${lat})`, radiusKm, limit]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get popular hikes nearby
  static async getPopularHikesNearby(lat, lng, radiusKm = 10, limit = 50) {
    try {
      const result = await db.query(
        `SELECT 
          h.id,
          h.name,
          h.location,
          h.length,
          h.difficulty,
          h.description,
          h.lat,
          h.lng,
          ST_Distance(h.geom, ST_GeomFromText($1, 4326)) / 1000 as distanceKm,
          u.username,
          u.avatarUrl,
          COUNT(o.id) as observationCount,
          COALESCE(SUM(o.confirmations), 0) as totalConfirmations,
          h.createdAt
        FROM hikes h
        LEFT JOIN users u ON h.userId = u.id
        LEFT JOIN observations o ON h.id = o.hikeId
        WHERE h.privacy = 'Public'
          AND ST_DWithin(h.geom, ST_GeomFromText($1, 4326), $2 * 1000)
        GROUP BY h.id, u.id, u.username, u.avatarUrl
        ORDER BY totalConfirmations DESC, observationCount DESC, distanceKm ASC
        LIMIT $3`,
        [`POINT(${lng} ${lat})`, radiusKm, limit]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get personalized feed based on followed users
  static async getPersonalizedFeed(userId, limit = 50, offset = 0) {
    try {
      // Get hikes and observations from followed users
      const result = await db.query(
        `SELECT 
          f.id as feedId,
          f.itemType,
          f.itemId,
          f.createdAt as feedCreatedAt,
          h.id as hikeId,
          h.name as hikeName,
          h.location,
          h.length,
          h.difficulty,
          h.description,
          h.lat as hikeLat,
          h.lng as hikeLng,
          o.id as observationId,
          o.title as observationTitle,
          o.imageUrl,
          o.status,
          o.confirmations,
          o.disputes,
          o.lat as obsLat,
          o.lng as obsLng,
          u.id as authorId,
          u.username,
          u.avatarUrl,
          o.createdAt as obsCreatedAt,
          h.createdAt as hikeCreatedAt
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
    } catch (err) {
      throw err;
    }
  }

  // Auto-populate feed from followed users
  static async autoPopulateFeed(userId) {
    try {
      // Add recent hikes from followed users
      await db.query(
        `INSERT INTO feeds (userId, itemType, itemId)
         SELECT $1, 'hike', h.id
         FROM hikes h
         WHERE h.userId IN (
           SELECT followedId FROM follows WHERE followerId = $1
         ) AND h.privacy = 'Public'
         AND h.createdAt > NOW() - INTERVAL '7 days'
         AND h.id NOT IN (
           SELECT itemId FROM feeds WHERE userId = $1 AND itemType = 'hike'
         )
         ON CONFLICT DO NOTHING`,
        [userId]
      );

      // Add recent observations from followed users
      await db.query(
        `INSERT INTO feeds (userId, itemType, itemId)
         SELECT $1, 'observation', o.id
         FROM observations o
         LEFT JOIN hikes h ON o.hikeId = h.id
         WHERE o.userId IN (
           SELECT followedId FROM follows WHERE followerId = $1
         ) AND h.privacy = 'Public'
         AND o.createdAt > NOW() - INTERVAL '7 days'
         AND o.id NOT IN (
           SELECT itemId FROM feeds WHERE userId = $1 AND itemType = 'observation'
         )
         ON CONFLICT DO NOTHING`,
        [userId]
      );

      return { message: "Feed auto-populated successfully" };
    } catch (err) {
      throw err;
    }
  }

  // Get feed recommendations based on user activity
  static async getRecommendations(userId, limit = 50) {
    try {
      // Get hikes similar to ones user has viewed/liked
      const result = await db.query(
        `SELECT DISTINCT
          h.id,
          h.name,
          h.location,
          h.length,
          h.difficulty,
          h.description,
          h.lat,
          h.lng,
          u.username,
          u.avatarUrl,
          COUNT(o.id) as observationCount,
          h.createdAt
        FROM hikes h
        LEFT JOIN users u ON h.userId = u.id
        LEFT JOIN observations o ON h.id = o.hikeId
        WHERE h.privacy = 'Public'
          AND h.difficulty IN (
            SELECT DISTINCT difficulty FROM hikes 
            WHERE userId IN (
              SELECT followedId FROM follows WHERE followerId = $1
            )
          )
          AND h.userId NOT IN (
            SELECT followedId FROM follows WHERE followerId = $1
          )
          AND h.id NOT IN (
            SELECT itemId FROM feeds WHERE userId = $1 AND itemType = 'hike'
          )
        GROUP BY h.id, u.id, u.username, u.avatarUrl
        ORDER BY observationCount DESC, h.createdAt DESC
        LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get trending hikes globally
  static async getTrendingHikes(limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT 
          h.id,
          h.name,
          h.location,
          h.length,
          h.difficulty,
          h.description,
          h.lat,
          h.lng,
          u.username,
          u.avatarUrl,
          COUNT(o.id) as observationCount,
          COALESCE(SUM(o.confirmations), 0) as totalConfirmations,
          h.createdAt
        FROM hikes h
        LEFT JOIN users u ON h.userId = u.id
        LEFT JOIN observations o ON h.id = o.hikeId
        WHERE h.privacy = 'Public'
        GROUP BY h.id, u.id, u.username, u.avatarUrl
        ORDER BY totalConfirmations DESC, observationCount DESC, h.createdAt DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get trending observations globally
  static async getTrendingObservations(limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT 
          o.id,
          o.title,
          o.imageUrl,
          o.status,
          o.confirmations,
          o.disputes,
          o.lat,
          o.lng,
          u.username,
          u.avatarUrl,
          h.name as hikeName,
          COUNT(c.id) as commentCount,
          o.createdAt
        FROM observations o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN hikes h ON o.hikeId = h.id
        LEFT JOIN observation_comments c ON o.id = c.observationId
        WHERE h.privacy = 'Public'
        GROUP BY o.id, u.id, u.username, u.avatarUrl, h.id, h.name
        ORDER BY o.confirmations DESC, o.disputes ASC, commentCount DESC, o.createdAt DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = DiscoveryFeedService;
