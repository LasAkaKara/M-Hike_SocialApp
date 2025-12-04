const db = require("../configs/db");

class User {
  // Create a new user
  static async create(userData) {
    const { username, avatarUrl, bio, region } = userData;
    const result = await db.query(
      `INSERT INTO users (username, avatarUrl, bio, region)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, avatarUrl || null, bio || null, region || null]
    );
    return result.rows[0];
  }

  // Get user by ID
  static async findById(id) {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  // Get user by username
  static async findByUsername(username) {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0];
  }

  // Get all users
  static async findAll(limit = 50, offset = 0) {
    const result = await db.query(
      "SELECT * FROM users ORDER BY createdAt DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  }

  // Update user
  static async update(id, userData) {
    const { username, avatarUrl, bio, region } = userData;
    const result = await db.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           avatarUrl = COALESCE($2, avatarUrl),
           bio = COALESCE($3, bio),
           region = COALESCE($4, region)
       WHERE id = $5
       RETURNING *`,
      [username, avatarUrl, bio, region, id]
    );
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get user stats (follower/following counts)
  static async getStats(id) {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM follows WHERE followedId = $1) as followerCount,
        (SELECT COUNT(*) FROM follows WHERE followerId = $1) as followingCount
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Get leaderboard by total distance
  static async getLeaderboardByDistance(limit = 10, region = null) {
    let query = `
      SELECT u.id, u.username, u.avatarUrl, u.region,
             COALESCE(SUM(h.length), 0) as totalDistance,
             COUNT(h.id) as hikeCount
      FROM users u
      LEFT JOIN hikes h ON u.id = h.userId AND h.privacy = 'Public'
    `;
    const params = [];

    if (region) {
      query += " WHERE u.region = $1";
      params.push(region);
    }

    query += `
      GROUP BY u.id, u.username, u.avatarUrl, u.region
      ORDER BY totalDistance DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  // Get leaderboard by hike count
  static async getLeaderboardByHikeCount(limit = 10, region = null) {
    let query = `
      SELECT u.id, u.username, u.avatarUrl, u.region,
             COUNT(h.id) as hikeCount,
             COALESCE(SUM(h.length), 0) as totalDistance
      FROM users u
      LEFT JOIN hikes h ON u.id = h.userId AND h.privacy = 'Public'
    `;
    const params = [];

    if (region) {
      query += " WHERE u.region = $1";
      params.push(region);
    }

    query += `
      GROUP BY u.id, u.username, u.avatarUrl, u.region
      ORDER BY hikeCount DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = User;
