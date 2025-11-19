# M-Hike Backend Implementation Summary

## Overview

This document outlines the PostgreSQL models and Express.js backend implementation for the M-Hike social hiking application, based on the requirements in `Plan.md`.

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL with PostGIS extension
- **Connection**: node-postgres (pg) library
- **Geo-Queries**: PostGIS for spatial queries
- **Server**: Express.js

### Database Initialization

The `db.js` configuration file automatically:

1. Creates PostgreSQL connection pool
2. Enables PostGIS extension
3. Creates all required tables with proper relationships
4. Creates GIST indexes on geometry columns for performance

## Implemented Models

### 1. User Model (`src/models/User.js`)

**Purpose**: Manage user profiles and social stats

**Key Methods**:

- `create()` - Register new user
- `findById()` / `findByUsername()` - Retrieve user
- `update()` - Modify user profile
- `delete()` - Remove user
- `getStats()` - Get follower/following counts
- `getLeaderboardByDistance()` - Rank users by total hiking distance
- `getLeaderboardByHikeCount()` - Rank users by number of hikes

**Fields**:

- id, username, avatarUrl, bio, region
- followerCount, followingCount (denormalized for performance)
- createdAt

---

### 2. Hike Model (`src/models/Hike.js`)

**Purpose**: Manage hiking records with geo-location support

**Key Methods**:

- `create()` - Create new hike
- `findById()` - Get hike with user info
- `findByUserId()` - Get user's hikes
- `findPublic()` - Get public hikes
- `findNearby()` - PostGIS radius query (within X km)
- `searchByName()` - Full-text search
- `filter()` - Advanced filtering (length, difficulty, date, location)
- `update()` / `delete()` - Modify/remove hike
- `getFollowingFeed()` - Get hikes from followed users

**PostGIS Features**:

- Stores geometry as `POINT(lng lat)` in WGS84 (EPSG:4326)
- Uses `ST_DWithin()` for efficient radius queries
- Uses `ST_Distance()` for distance calculations
- GIST index on geometry column for performance

**Fields**:

- id, userId, name, location, length, difficulty, description
- privacy (public/private), lat, lng
- geom (PostGIS geometry), createdAt, updatedAt

---

### 3. Observation Model (`src/models/Observation.js`)

**Purpose**: Manage timestamped observations attached to hikes with community verification

**Key Methods**:

- `create()` - Add observation to hike
- `findById()` - Get observation with user/hike info
- `findByHikeId()` - Get all observations for a hike
- `findByUserId()` - Get user's observations
- `findPublic()` - Get public observations
- `findNearby()` - PostGIS radius query for discovery feed
- `searchByTitle()` - Search observations
- `update()` / `delete()` - Modify/remove observation
- `incrementConfirmations()` / `incrementDisputes()` - Community verification
- `getFollowingObservations()` - From followed users
- `getTrending()` - Sort by confirmations

**Community Verification**:

- Tracks `confirmations` and `disputes` counts
- Status field for trail conditions (e.g., "Open", "Closed")

**Fields**:

- id, hikeId, userId, title, imageUrl
- lat, lng, geom (PostGIS geometry)
- status, confirmations, disputes
- createdAt, updatedAt

---

### 4. Follow Model (`src/models/Follow.js`)

**Purpose**: Manage social follow relationships

**Key Methods**:

- `create()` - Follow user (prevents self-follow)
- `isFollowing()` - Check if following
- `getFollowers()` / `getFollowing()` - List followers/following
- `getFollowerCount()` / `getFollowingCount()` - Get counts
- `delete()` - Unfollow user
- `updateUserCounts()` - Sync counts to users table
- `getMutualFollowers()` - Find common followers

**Features**:

- Prevents self-follow with CHECK constraint
- ON CONFLICT handling for idempotent follows
- Composite primary key (followerId, followedId)

**Fields**:

- followerId, followedId (both FK to users)
- followedAt (timestamp)

---

### 5. ObservationComment Model (`src/models/ObservationComment.js`)

**Purpose**: Enable community discussion on observations

**Key Methods**:

- `create()` - Add comment
- `findById()` - Get comment with user info
- `findByObservationId()` - Get all comments for observation
- `findByUserId()` - Get user's comments
- `update()` / `delete()` - Modify/remove comment
- `getCommentCount()` - Count comments on observation
- `getRecent()` - Get recent comments

**Fields**:

- id, observationId, userId, content
- createdAt

---

### 6. Feed Model (`src/models/Feed.js`)

**Purpose**: Manage user feeds (hikes and observations from followed users)

**Key Methods**:

- `addItem()` - Add hike/observation to feed
- `getUserFeed()` - Get raw feed items
- `getHikeFeedItems()` - Get hike feed with details
- `getObservationFeedItems()` - Get observation feed with details
- `getMixedFeed()` - Get combined hike + observation feed
- `deleteItem()` / `clearUserFeed()` - Remove items
- `populateFollowingHikesFeed()` - Auto-populate from followed users
- `populateFollowingObservationsFeed()` - Auto-populate observations
- `isItemInFeed()` - Check if item exists

**Features**:

- Supports both "hike" and "observation" item types
- Efficient JOIN queries to fetch full item details
- Prevents duplicate items

**Fields**:

- id, userId, itemType, itemId
- createdAt

---

## Database Schema

### Tables Created

```sql
-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  avatarUrl TEXT,
  bio TEXT,
  region VARCHAR(255),
  followerCount INT DEFAULT 0,
  followingCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follow relationships
CREATE TABLE follows (
  followerId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followedId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (followerId, followedId),
  CHECK (followerId != followedId)
);

-- Hikes with PostGIS geometry
CREATE TABLE hikes (
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
CREATE INDEX idx_hikes_geom ON hikes USING GIST(geom);

-- Observations with PostGIS geometry
CREATE TABLE observations (
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
CREATE INDEX idx_observations_geom ON observations USING GIST(geom);

-- Observation comments
CREATE TABLE observation_comments (
  id BIGSERIAL PRIMARY KEY,
  observationId BIGINT NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User feeds
CREATE TABLE feeds (
  id BIGSERIAL PRIMARY KEY,
  userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  itemType VARCHAR(50) NOT NULL,
  itemId BIGINT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## PostGIS Integration

### Geometry Storage

- All coordinates stored as `POINT(longitude latitude)` in WGS84 (EPSG:4326)
- Longitude first, latitude second (standard for PostGIS)

### Spatial Queries

**Nearby Hikes/Observations** (within 5km):

```sql
SELECT h.*, ST_Distance(h.geom, ST_GeomFromText('POINT(lng lat)', 4326)) / 1000 as distanceKm
FROM hikes h
WHERE ST_DWithin(h.geom, ST_GeomFromText('POINT(lng lat)', 4326), 5000)
ORDER BY distanceKm ASC;
```

### Performance

- GIST indexes on geometry columns for O(log n) queries
- Efficient for radius queries and distance calculations

---

## File Structure

```
BackEnd/
├── src/
│   ├── configs/
│   │   └── db.js                 # PostgreSQL connection & schema init
│   ├── models/
│   │   ├── User.js               # User management
│   │   ├── Hike.js               # Hike management
│   │   ├── Observation.js        # Observation management
│   │   ├── Follow.js             # Follow relationships
│   │   ├── ObservationComment.js # Comments
│   │   └── Feed.js               # Feed management
│   ├── controllers/              # (To be implemented)
│   ├── routes/                   # (To be implemented)
│   ├── services/                 # (To be implemented)
│   ├── middlewares/              # (To be implemented)
│   ├── utils/                    # (To be implemented)
│   └── app.js                    # Express app config
├── server.js                     # Entry point
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── README.md                     # Setup instructions
└── IMPLEMENTATION.md             # This file
```

---

## Next Steps

1. **Implement Controllers**: Create business logic for each model
2. **Implement Routes**: Create REST endpoints
3. **Add Services**: Extract complex logic into service layer
4. **Add Middleware**: Authentication, validation, error handling
5. **Add Tests**: Unit and integration tests
6. **Deploy**: Set up production database and deploy

---

## Key Design Decisions

1. **Denormalized Counts**: `followerCount` and `followingCount` stored in users table for fast access
2. **PostGIS Geometry**: Used for efficient geo-spatial queries
3. **Composite Keys**: Follow table uses (followerId, followedId) as primary key
4. **Cascading Deletes**: All foreign keys have ON DELETE CASCADE for data integrity
5. **Timestamps**: All tables include createdAt and updatedAt for audit trails
6. **Privacy Field**: Hikes have privacy setting to control visibility

---

## Security Considerations

- Implement authentication middleware for protected endpoints
- Validate user ownership before allowing updates/deletes
- Use prepared statements (already done with pg library)
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use HTTPS in production

---

## Performance Optimization

- GIST indexes on geometry columns for spatial queries
- Denormalized follower/following counts to avoid expensive aggregations
- Pagination on all list endpoints (limit/offset)
- Efficient JOIN queries in Feed model
- Consider materialized views for leaderboards if needed
