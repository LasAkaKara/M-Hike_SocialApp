const db = require("../configs/db");

class ObservationComment {
  // Create a new comment
  static async create(commentData) {
    const { observationId, userId, content } = commentData;
    const result = await db.query(
      `INSERT INTO observation_comments (observationId, userId, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [observationId, userId, content]
    );
    return result.rows[0];
  }

  // Get comment by ID
  static async findById(id) {
    const result = await db.query(
      `SELECT c.*, u.username, u.avatarUrl
       FROM observation_comments c
       LEFT JOIN users u ON c.userId = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Get comments for an observation
  static async findByObservationId(observationId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT c.*, u.username, u.avatarUrl
       FROM observation_comments c
       LEFT JOIN users u ON c.userId = u.id
       WHERE c.observationId = $1
       ORDER BY c.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [observationId, limit, offset]
    );
    return result.rows;
  }

  // Get comments by user
  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT c.*, u.username, u.avatarUrl, o.title as observationTitle
       FROM observation_comments c
       LEFT JOIN users u ON c.userId = u.id
       LEFT JOIN observations o ON c.observationId = o.id
       WHERE c.userId = $1
       ORDER BY c.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Update comment
  static async update(id, content) {
    const result = await db.query(
      `UPDATE observation_comments 
       SET content = $1
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );
    return result.rows[0];
  }

  // Delete comment
  static async delete(id) {
    const result = await db.query(
      "DELETE FROM observation_comments WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get comment count for an observation
  static async getCommentCount(observationId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM observation_comments 
       WHERE observationId = $1`,
      [observationId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // Get recent comments
  static async getRecent(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT c.*, u.username, u.avatarUrl, o.title as observationTitle
       FROM observation_comments c
       LEFT JOIN users u ON c.userId = u.id
       LEFT JOIN observations o ON c.observationId = o.id
       ORDER BY c.createdAt DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
}

module.exports = ObservationComment;
