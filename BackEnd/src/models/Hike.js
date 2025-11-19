const db = require("../configs/db");

class Hike {
  // Create a new hike
  static async create(hikeData) {
    const {
      userId,
      name,
      location,
      length,
      difficulty,
      description,
      privacy,
      lat,
      lng,
    } = hikeData;

    let query = `
      INSERT INTO hikes (userId, name, location, length, difficulty, description, privacy, lat, lng`;
    let values = [
      userId,
      name,
      location,
      length,
      difficulty,
      description,
      privacy,
      lat,
      lng,
    ];
    let paramCount = 9;

    // Add geom if coordinates are provided
    if (lat && lng) {
      query += `, geom`;
      values.push(`POINT(${lng} ${lat})`);
    }

    query += `) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9`;
    if (lat && lng) {
      query += `, ST_GeomFromText($${paramCount + 1}, 4326)`;
    }
    query += `) RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Get hike by ID
  static async findById(id) {
    const result = await db.query(
      `SELECT h.*, u.username, u.avatarUrl
       FROM hikes h
       LEFT JOIN users u ON h.userId = u.id
       WHERE h.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Get all hikes by user
  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT h.*, u.username, u.avatarUrl
       FROM hikes h
       LEFT JOIN users u ON h.userId = u.id
       WHERE h.userId = $1
       ORDER BY h.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Get public hikes
  static async findPublic(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT h.*, u.username, u.avatarUrl
       FROM hikes h
       LEFT JOIN users u ON h.userId = u.id
       WHERE h.privacy = 'public'
       ORDER BY h.createdAt DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Get hikes within radius (using PostGIS)
  static async findNearby(lat, lng, radiusKm = 5, limit = 50) {
    const result = await db.query(
      `SELECT h.*, u.username, u.avatarUrl,
              ST_Distance(h.geom, ST_GeomFromText($1, 4326)) / 1000 as distanceKm
       FROM hikes h
       LEFT JOIN users u ON h.userId = u.id
       WHERE h.privacy = 'public'
         AND ST_DWithin(h.geom, ST_GeomFromText($1, 4326), $2 * 1000)
       ORDER BY distanceKm ASC
       LIMIT $3`,
      [`POINT(${lng} ${lat})`, radiusKm, limit]
    );
    return result.rows;
  }

  // Search hikes by name
  static async searchByName(name, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT h.*, u.username, u.avatarUrl
       FROM hikes h
       LEFT JOIN users u ON h.userId = u.id
       WHERE h.name ILIKE $1 AND h.privacy = 'public'
       ORDER BY h.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [`%${name}%`, limit, offset]
    );
    return result.rows;
  }

  // Filter hikes by criteria
  static async filter(criteria) {
    const {
      minLength,
      maxLength,
      minDifficulty,
      maxDifficulty,
      startDate,
      endDate,
      location,
      limit = 50,
      offset = 0,
    } = criteria;

    let query = `
      SELECT h.*, u.username, u.avatarUrl
      FROM hikes h
      LEFT JOIN users u ON h.userId = u.id
      WHERE h.privacy = 'public'
    `;
    const params = [];
    let paramCount = 0;

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

    if (minDifficulty !== undefined) {
      paramCount++;
      query += ` AND h.difficulty >= $${paramCount}`;
      params.push(minDifficulty);
    }

    if (maxDifficulty !== undefined) {
      paramCount++;
      query += ` AND h.difficulty <= $${paramCount}`;
      params.push(maxDifficulty);
    }

    if (startDate !== undefined) {
      paramCount++;
      query += ` AND h.createdAt >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate !== undefined) {
      paramCount++;
      query += ` AND h.createdAt <= $${paramCount}`;
      params.push(endDate);
    }

    if (location !== undefined) {
      paramCount++;
      query += ` AND h.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    query += ` ORDER BY h.createdAt DESC LIMIT $${paramCount + 1} OFFSET $${
      paramCount + 2
    }`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  // Update hike
  static async update(id, hikeData) {
    const {
      name,
      location,
      length,
      difficulty,
      description,
      privacy,
      lat,
      lng,
    } = hikeData;

    let query = `
      UPDATE hikes 
      SET name = COALESCE($1, name),
          location = COALESCE($2, location),
          length = COALESCE($3, length),
          difficulty = COALESCE($4, difficulty),
          description = COALESCE($5, description),
          privacy = COALESCE($6, privacy),
          lat = COALESCE($7, lat),
          lng = COALESCE($8, lng)
    `;
    const params = [
      name,
      location,
      length,
      difficulty,
      description,
      privacy,
      lat,
      lng,
    ];

    if (lat && lng) {
      query += `, geom = ST_GeomFromText($9, 4326)`;
      params.push(`POINT(${lng} ${lat})`);
    }

    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);

    const result = await db.query(query, params);
    return result.rows[0];
  }

  // Delete hike
  static async delete(id) {
    const result = await db.query(
      "DELETE FROM hikes WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get hikes from followed users (for feed)
  static async getFollowingFeed(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT h.*, u.username, u.avatarUrl
       FROM hikes h
       LEFT JOIN users u ON h.userId = u.id
       WHERE h.userId IN (
         SELECT followedId FROM follows WHERE followerId = $1
       ) AND h.privacy = 'public'
       ORDER BY h.createdAt DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }
}

module.exports = Hike;
