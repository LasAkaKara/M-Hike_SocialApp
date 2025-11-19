const User = require("../models/User");
const db = require("../configs/db");

class LeaderboardService {
  // Get leaderboard by total distance
  static async getDistanceLeaderboard(limit = 10, region = null, offset = 0) {
    try {
      let query = `
        SELECT u.id, u.username, u.avatarUrl, u.region,
               COALESCE(SUM(h.length), 0) as totalDistance,
               COUNT(h.id) as hikeCount,
               ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(h.length), 0) DESC) as rank
        FROM users u
        LEFT JOIN hikes h ON u.id = h.userId AND h.privacy = 'public'
      `;
      const params = [];

      if (region) {
        query += " WHERE u.region = $1";
        params.push(region);
      }

      query += `
        GROUP BY u.id, u.username, u.avatarUrl, u.region
        ORDER BY totalDistance DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get leaderboard by hike count
  static async getHikeCountLeaderboard(limit = 10, region = null, offset = 0) {
    try {
      let query = `
        SELECT u.id, u.username, u.avatarUrl, u.region,
               COUNT(h.id) as hikeCount,
               COALESCE(SUM(h.length), 0) as totalDistance,
               ROW_NUMBER() OVER (ORDER BY COUNT(h.id) DESC) as rank
        FROM users u
        LEFT JOIN hikes h ON u.id = h.userId AND h.privacy = 'public'
      `;
      const params = [];

      if (region) {
        query += " WHERE u.region = $1";
        params.push(region);
      }

      query += `
        GROUP BY u.id, u.username, u.avatarUrl, u.region
        ORDER BY hikeCount DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get leaderboard by difficulty completed
  static async getDifficultyLeaderboard(limit = 10, region = null, offset = 0) {
    try {
      let query = `
        SELECT u.id, u.username, u.avatarUrl, u.region,
               COUNT(CASE WHEN h.difficulty = 'Hard' THEN 1 END) as hardHikes,
               COUNT(CASE WHEN h.difficulty = 'Medium' THEN 1 END) as mediumHikes,
               COUNT(CASE WHEN h.difficulty = 'Easy' THEN 1 END) as easyHikes,
               COUNT(h.id) as totalHikes,
               ROW_NUMBER() OVER (ORDER BY COUNT(CASE WHEN h.difficulty = 'Hard' THEN 1 END) DESC) as rank
        FROM users u
        LEFT JOIN hikes h ON u.id = h.userId AND h.privacy = 'public'
      `;
      const params = [];

      if (region) {
        query += " WHERE u.region = $1";
        params.push(region);
      }

      query += `
        GROUP BY u.id, u.username, u.avatarUrl, u.region
        ORDER BY hardHikes DESC, mediumHikes DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get leaderboard by observations confirmed
  static async getObservationLeaderboard(
    limit = 10,
    region = null,
    offset = 0
  ) {
    try {
      let query = `
        SELECT u.id, u.username, u.avatarUrl, u.region,
               COUNT(o.id) as observationCount,
               COALESCE(SUM(o.confirmations), 0) as totalConfirmations,
               COALESCE(SUM(o.disputes), 0) as totalDisputes,
               ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(o.confirmations), 0) DESC) as rank
        FROM users u
        LEFT JOIN observations o ON u.id = o.userId
        LEFT JOIN hikes h ON o.hikeId = h.id AND h.privacy = 'public'
      `;
      const params = [];

      if (region) {
        query += " WHERE u.region = $1";
        params.push(region);
      }

      query += `
        GROUP BY u.id, u.username, u.avatarUrl, u.region
        ORDER BY totalConfirmations DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get leaderboard by followers
  static async getFollowerLeaderboard(limit = 10, region = null, offset = 0) {
    try {
      let query = `
        SELECT u.id, u.username, u.avatarUrl, u.region,
               u.followerCount,
               u.followingCount,
               ROW_NUMBER() OVER (ORDER BY u.followerCount DESC) as rank
        FROM users u
      `;
      const params = [];

      if (region) {
        query += " WHERE u.region = $1";
        params.push(region);
      }

      query += `
        ORDER BY u.followerCount DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get user rank in leaderboard
  static async getUserRank(
    userId,
    leaderboardType = "distance",
    region = null
  ) {
    try {
      let leaderboard;

      switch (leaderboardType) {
        case "distance":
          leaderboard = await this.getDistanceLeaderboard(1000, region);
          break;
        case "hikes":
          leaderboard = await this.getHikeCountLeaderboard(1000, region);
          break;
        case "difficulty":
          leaderboard = await this.getDifficultyLeaderboard(1000, region);
          break;
        case "observations":
          leaderboard = await this.getObservationLeaderboard(1000, region);
          break;
        case "followers":
          leaderboard = await this.getFollowerLeaderboard(1000, region);
          break;
        default:
          leaderboard = await this.getDistanceLeaderboard(1000, region);
      }

      const userRank = leaderboard.find((entry) => entry.id === userId);
      return userRank || null;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = LeaderboardService;
