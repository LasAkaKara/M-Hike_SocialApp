const db = require("../configs/db");

class Observation {
  // Create a new observation
  static async create(observationData) {
    const {
      hikeId,
      userId,
      title,
      imageUrl,
      lat,
      lng,
      status = "Open",
    } = observationData;

    let query = `
      INSERT INTO observations (hikeId, userId, title, imageUrl, lat, lng, status`;
    let values = [hikeId, userId, title, imageUrl, lat, lng, status];
    let paramCount = 7;

    // Add geom if coordinates are provided
    if (lat && lng) {
      query += `, geom`;
      values.push(`POINT(${lng} ${lat})`);
    }

    query += `) VALUES ($1, $2, $3, $4, $5, $6, $7`;
    if (lat && lng) {
      query += `, ST_GeomFromText($${paramCount + 1}, 4326)`;
    }
    query += `) RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Get observation by ID
  static async findById(id) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE o.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Get observations by hike
  static async findByHikeId(hikeId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       WHERE o.hikeId = $1
       ORDER BY o.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [hikeId, limit, offset]
    );
    return result.rows;
  }

  // Get observations by user
  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE o.userId = $1
       ORDER BY o.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get public observations
  static async findPublic(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE h.privacy = 'Public'
       ORDER BY o.createdAt DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Get observations within radius (using PostGIS) - for discovery feed
  static async findNearby(lat, lng, radiusKm = 5, limit = 50) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName,
              ST_Distance(o.geom, ST_GeomFromText($1, 4326)) / 1000 as distanceKm
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE h.privacy = 'Public'
         AND ST_DWithin(o.geom, ST_GeomFromText($1, 4326), $2 * 1000)
       ORDER BY o.createdAt DESC, distanceKm ASC
       LIMIT $3`,
      [`POINT(${lng} ${lat})`, radiusKm, limit]
    );
    return result.rows;
  }

  // Search observations by title
  static async searchByTitle(title, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE o.title ILIKE $1 AND h.privacy = 'Public'
       ORDER BY o.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [`%${title}%`, limit, offset]
    );
    return result.rows;
  }

  // Update observation
  static async update(id, observationData) {
    const { title, imageUrl, lat, lng, status, confirmations, disputes } =
      observationData;

    let query = `
      UPDATE observations 
      SET title = COALESCE($1, title),
          imageUrl = COALESCE($2, imageUrl),
          lat = COALESCE($3, lat),
          lng = COALESCE($4, lng),
          status = COALESCE($5, status),
          confirmations = COALESCE($6, confirmations),
          disputes = COALESCE($7, disputes)
    `;
    const params = [title, imageUrl, lat, lng, status, confirmations, disputes];

    if (lat && lng) {
      query += `, geom = ST_GeomFromText($8, 4326)`;
      params.push(`POINT(${lng} ${lat})`);
    }

    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);

    const result = await db.query(query, params);
    return result.rows[0];
  }

  // Delete observation
  static async delete(id) {
    const result = await db.query(
      "DELETE FROM observations WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Increment confirmations
  static async incrementConfirmations(id) {
    const result = await db.query(
      `UPDATE observations 
       SET confirmations = confirmations + 1
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Increment disputes
  static async incrementDisputes(id) {
    const result = await db.query(
      `UPDATE observations 
       SET disputes = disputes + 1
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Get observations from followed users (for discovery feed)
  static async getFollowingObservations(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE o.userId IN (
         SELECT followedId FROM follows WHERE followerId = $1
       ) AND h.privacy = 'Public'
       ORDER BY o.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get trending observations (by confirmations)
  static async getTrending(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT o.*, u.username, u.avatarUrl, h.name as hikeName
       FROM observations o
       LEFT JOIN users u ON o.userId = u.id
       LEFT JOIN hikes h ON o.hikeId = h.id
       WHERE h.privacy = 'Public'
       ORDER BY o.confirmations DESC, o.createdAt DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
}

module.exports = Observation;
