const db = require("../configs/db");

class Follow {
  // Create a follow relationship
  static async create(followerId, followedId) {
    if (followerId === followedId) {
      throw new Error("Cannot follow yourself");
    }

    const result = await db.query(
      `INSERT INTO follows (followerId, followedId)
       VALUES ($1, $2)
       ON CONFLICT (followerId, followedId) DO NOTHING
       RETURNING *`,
      [followerId, followedId]
    );
    return result.rows[0];
  }

  // Check if user follows another user
  static async isFollowing(followerId, followedId) {
    const result = await db.query(
      `SELECT * FROM follows 
       WHERE followerId = $1 AND followedId = $2`,
      [followerId, followedId]
    );
    return result.rows.length > 0;
  }

  // Get followers of a user
  static async getFollowers(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT u.* FROM users u
       INNER JOIN follows f ON u.id = f.followerId
       WHERE f.followedId = $1
       ORDER BY f.followedAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get users that a user is following
  static async getFollowing(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT u.* FROM users u
       INNER JOIN follows f ON u.id = f.followedId
       WHERE f.followerId = $1
       ORDER BY f.followedAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get follower count
  static async getFollowerCount(userId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM follows 
       WHERE followedId = $1`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // Get following count
  static async getFollowingCount(userId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM follows 
       WHERE followerId = $1`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // Unfollow a user
  static async delete(followerId, followedId) {
    const result = await db.query(
      `DELETE FROM follows 
       WHERE followerId = $1 AND followedId = $2
       RETURNING *`,
      [followerId, followedId]
    );
    return result.rows[0];
  }

  // Update follower/following counts in users table
  static async updateUserCounts(userId) {
    const followerCount = await this.getFollowerCount(userId);
    const followingCount = await this.getFollowingCount(userId);

    await db.query(
      `UPDATE users 
       SET followerCount = $1, followingCount = $2
       WHERE id = $3`,
      [followerCount, followingCount, userId]
    );
  }

  // Get mutual followers
  static async getMutualFollowers(userId1, userId2, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT u.* FROM users u
       WHERE u.id IN (
         SELECT followedId FROM follows WHERE followerId = $1
         INTERSECT
         SELECT followedId FROM follows WHERE followerId = $2
       )
       LIMIT $3 OFFSET $4`,
      [userId1, userId2, limit, offset]
    );
    return result.rows;
  }
}

module.exports = Follow;
