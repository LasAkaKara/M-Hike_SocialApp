const db = require("../configs/db");

class SearchService {
  // Advanced hike search with multiple filters
  static async advancedHikeSearch(filters) {
    try {
      const {
        name,
        location,
        minLength,
        maxLength,
        difficulty,
        region,
        startDate,
        endDate,
        minRating,
        sortBy = "createdAt",
        sortOrder = "DESC",
        limit = 50,
        offset = 0,
      } = filters;

      let query = `
        SELECT h.*, u.username, u.avatarUrl,
               COUNT(o.id) as observationCount,
               COALESCE(SUM(o.confirmations), 0) as totalConfirmations
        FROM hikes h
        LEFT JOIN users u ON h.userId = u.id
        LEFT JOIN observations o ON h.id = o.hikeId
        WHERE h.privacy = 'public'
      `;
      const params = [];
      let paramCount = 0;

      if (name) {
        paramCount++;
        query += ` AND h.name ILIKE $${paramCount}`;
        params.push(`%${name}%`);
      }

      if (location) {
        paramCount++;
        query += ` AND h.location ILIKE $${paramCount}`;
        params.push(`%${location}%`);
      }

      if (minLength !== undefined) {
        paramCount++;
        query += ` AND h.length >= $${paramCount}`;
        params.push(minLength);
      }

      if (maxLength !== undefined) {
        paramCount++;
        query += ` AND h.length <= $${paramCount}`;
        params.push(maxLength);
      }

      if (difficulty) {
        paramCount++;
        query += ` AND h.difficulty = $${paramCount}`;
        params.push(difficulty);
      }

      if (region) {
        paramCount++;
        query += ` AND u.region = $${paramCount}`;
        params.push(region);
      }

      if (startDate) {
        paramCount++;
        query += ` AND h.createdAt >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND h.createdAt <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` GROUP BY h.id, u.id, u.username, u.avatarUrl`;

      if (minRating !== undefined) {
        paramCount++;
        query += ` HAVING COALESCE(SUM(o.confirmations), 0) >= $${paramCount}`;
        params.push(minRating);
      }

      // Sorting
      const validSortFields = [
        "createdAt",
        "length",
        "difficulty",
        "totalConfirmations",
        "observationCount",
      ];
      const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      query += ` ORDER BY ${sortField} ${order}`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Advanced observation search
  static async advancedObservationSearch(filters) {
    try {
      const {
        title,
        status,
        minConfirmations,
        maxDisputes,
        hikeId,
        userId,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "DESC",
        limit = 50,
        offset = 0,
      } = filters;

      let query = `
        SELECT o.*, u.username, u.avatarUrl, h.name as hikeName,
               COUNT(c.id) as commentCount
        FROM observations o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN hikes h ON o.hikeId = h.id
        LEFT JOIN observation_comments c ON o.id = c.observationId
        WHERE h.privacy = 'public'
      `;
      const params = [];
      let paramCount = 0;

      if (title) {
        paramCount++;
        query += ` AND o.title ILIKE $${paramCount}`;
        params.push(`%${title}%`);
      }

      if (status) {
        paramCount++;
        query += ` AND o.status = $${paramCount}`;
        params.push(status);
      }

      if (minConfirmations !== undefined) {
        paramCount++;
        query += ` AND o.confirmations >= $${paramCount}`;
        params.push(minConfirmations);
      }

      if (maxDisputes !== undefined) {
        paramCount++;
        query += ` AND o.disputes <= $${paramCount}`;
        params.push(maxDisputes);
      }

      if (hikeId) {
        paramCount++;
        query += ` AND o.hikeId = $${paramCount}`;
        params.push(hikeId);
      }

      if (userId) {
        paramCount++;
        query += ` AND o.userId = $${paramCount}`;
        params.push(userId);
      }

      if (startDate) {
        paramCount++;
        query += ` AND o.createdAt >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND o.createdAt <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` GROUP BY o.id, u.id, u.username, u.avatarUrl, h.id, h.name`;

      // Sorting
      const validSortFields = [
        "createdAt",
        "confirmations",
        "disputes",
        "commentCount",
      ];
      const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      query += ` ORDER BY ${sortField} ${order}`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Search users
  static async searchUsers(filters) {
    try {
      const {
        username,
        region,
        minFollowers,
        maxFollowers,
        sortBy = "followerCount",
        sortOrder = "DESC",
        limit = 50,
        offset = 0,
      } = filters;

      let query = `
        SELECT u.id, u.username, u.avatarUrl, u.bio, u.region,
               u.followerCount, u.followingCount,
               COUNT(h.id) as hikeCount,
               COALESCE(SUM(h.length), 0) as totalDistance
        FROM users u
        LEFT JOIN hikes h ON u.id = h.userId AND h.privacy = 'public'
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (username) {
        paramCount++;
        query += ` AND u.username ILIKE $${paramCount}`;
        params.push(`%${username}%`);
      }

      if (region) {
        paramCount++;
        query += ` AND u.region = $${paramCount}`;
        params.push(region);
      }

      if (minFollowers !== undefined) {
        paramCount++;
        query += ` AND u.followerCount >= $${paramCount}`;
        params.push(minFollowers);
      }

      if (maxFollowers !== undefined) {
        paramCount++;
        query += ` AND u.followerCount <= $${paramCount}`;
        params.push(maxFollowers);
      }

      query += ` GROUP BY u.id, u.username, u.avatarUrl, u.bio, u.region, u.followerCount, u.followingCount`;

      // Sorting
      const validSortFields = [
        "followerCount",
        "followingCount",
        "hikeCount",
        "totalDistance",
        "username",
      ];
      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "followerCount";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      query += ` ORDER BY ${sortField} ${order}`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Full-text search across all content
  static async globalSearch(query, limit = 50) {
    try {
      const searchTerm = `%${query}%`;

      const result = await db.query(
        `
        SELECT 'hike' as type, h.id, h.name as title, h.location, h.description, u.username, h.createdAt
        FROM hikes h
        LEFT JOIN users u ON h.userId = u.id
        WHERE h.privacy = 'public' AND (h.name ILIKE $1 OR h.location ILIKE $1 OR h.description ILIKE $1)
        
        UNION ALL
        
        SELECT 'observation' as type, o.id, o.title, h.name as location, NULL as description, u.username, o.createdAt
        FROM observations o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN hikes h ON o.hikeId = h.id
        WHERE h.privacy = 'public' AND (o.title ILIKE $1)
        
        UNION ALL
        
        SELECT 'user' as type, u.id, u.username as title, u.region as location, u.bio as description, u.username, u.createdAt
        FROM users u
        WHERE u.username ILIKE $1
        
        ORDER BY createdAt DESC
        LIMIT $2
        `,
        [searchTerm, limit]
      );

      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(query, type = "all") {
    try {
      const searchTerm = `${query}%`;
      const limit = 10;

      if (type === "hike" || type === "all") {
        const hikeResult = await db.query(
          `SELECT DISTINCT h.name as suggestion, 'hike' as type
           FROM hikes h
           WHERE h.privacy = 'public' AND h.name ILIKE $1
           LIMIT $2`,
          [searchTerm, limit]
        );

        if (type === "hike") {
          return hikeResult.rows;
        }
      }

      if (type === "location" || type === "all") {
        const locationResult = await db.query(
          `SELECT DISTINCT h.location as suggestion, 'location' as type
           FROM hikes h
           WHERE h.privacy = 'public' AND h.location ILIKE $1
           LIMIT $2`,
          [searchTerm, limit]
        );

        if (type === "location") {
          return locationResult.rows;
        }
      }

      if (type === "user" || type === "all") {
        const userResult = await db.query(
          `SELECT DISTINCT u.username as suggestion, 'user' as type
           FROM users u
           WHERE u.username ILIKE $1
           LIMIT $2`,
          [searchTerm, limit]
        );

        if (type === "user") {
          return userResult.rows;
        }
      }

      // Return all suggestions
      const allResult = await db.query(
        `
        SELECT h.name as suggestion, 'hike' as type FROM hikes h WHERE h.privacy = 'public' AND h.name ILIKE $1 LIMIT $2
        UNION ALL
        SELECT h.location as suggestion, 'location' as type FROM hikes h WHERE h.privacy = 'public' AND h.location ILIKE $1 LIMIT $2
        UNION ALL
        SELECT u.username as suggestion, 'user' as type FROM users u WHERE u.username ILIKE $1 LIMIT $2
        `,
        [searchTerm, limit]
      );

      return allResult.rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = SearchService;
