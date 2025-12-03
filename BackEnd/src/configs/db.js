const { Pool } = require("pg");
require("dotenv").config();

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
};
const pool = new Pool(connectionConfig);


pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // Enable PostGIS extension
    await pool.query("CREATE EXTENSION IF NOT EXISTS postgis;");

    // Create USERS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255),
        avatarUrl TEXT,
        bio TEXT,
        region VARCHAR(255),
        followerCount INT DEFAULT 0,
        followingCount INT DEFAULT 0,
        resetTokenHash VARCHAR(255),
        resetTokenExpiry TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create FOLLOWS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follows (
        followerId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followedId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (followerId, followedId),
        CHECK (followerId != followedId)
      );
    `);

    // Create HIKES table with PostGIS geometry
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hikes (
        id BIGSERIAL PRIMARY KEY,
        userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        length FLOAT,
        difficulty VARCHAR(50),
        description TEXT,
        privacy VARCHAR(50) DEFAULT 'private',
        lat FLOAT,
        lng FLOAT,
        geom GEOMETRY(Point, 4326),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on geom for PostGIS queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_hikes_geom ON hikes USING GIST(geom);
    `);

    // Create OBSERVATIONS table with PostGIS geometry
    await pool.query(`
      CREATE TABLE IF NOT EXISTS observations (
        id BIGSERIAL PRIMARY KEY,
        hikeId BIGINT NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
        userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        imageUrl TEXT,
        lat FLOAT,
        lng FLOAT,
        geom GEOMETRY(Point, 4326),
        status VARCHAR(50) DEFAULT 'Open',
        confirmations INT DEFAULT 0,
        disputes INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on geom for PostGIS queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_observations_geom ON observations USING GIST(geom);
    `);

    // Create OBSERVATION_COMMENTS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS observation_comments (
        id BIGSERIAL PRIMARY KEY,
        observationId BIGINT NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
        userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create FEEDS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feeds (
        id BIGSERIAL PRIMARY KEY,
        userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        itemType VARCHAR(50) NOT NULL,
        itemId BIGINT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database schema initialized successfully");
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
};

module.exports = {
  pool,
  initializeDatabase,
  query: (text, params) => pool.query(text, params),
};
