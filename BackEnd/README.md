# M-Hike Backend API

Express.js REST API backend for the M-Hike social hiking application with PostgreSQL database and PostGIS for geo-queries.

## Features

- **User Management**: Create, update, and manage user profiles
- **Hike Management**: CRUD operations for hikes with geo-location support
- **Observations**: Attach timestamped observations to hikes with community verification
- **Social Features**: Follow/unfollow users, view feeds from followed users
- **Discovery**: Geo-based discovery of nearby hikes and observations
- **Leaderboards**: Rank users by distance or hike count
- **Comments**: Community discussion on observations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS extension
- **ORM/Query**: node-postgres (pg)
- **Image Storage**: Cloudinary (optional)

## Prerequisites

- Node.js 14+
- PostgreSQL 12+
- PostGIS extension for PostgreSQL

## Installation

1. **Clone and install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

3. **Configure `.env`** with your PostgreSQL credentials:

   ```
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mhike_db
   PORT=5000
   NODE_ENV=development
   ```

4. **Create PostgreSQL database**:

   ```sql
   CREATE DATABASE mhike_db;
   ```

5. **Enable PostGIS extension** (run in PostgreSQL):
   ```sql
   CREATE EXTENSION postgis;
   ```

## Running the Server

**Development** (with auto-reload):

```bash
npm run dev
```

**Production**:

```bash
npm start
```

The server will start on `http://localhost:5000` and automatically initialize the database schema.

## Database Schema

### Tables

- **users**: User profiles with stats
- **follows**: Follow relationships between users
- **hikes**: Hiking records with geo-location
- **observations**: Timestamped observations attached to hikes
- **observation_comments**: Community discussion on observations
- **feeds**: User feed items (hikes and observations)

All tables support PostGIS geometry for efficient geo-queries.

## API Endpoints (To be implemented)

### Users

- `GET /api/users/:id` - Get user profile
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/stats` - Get user stats
- `GET /api/leaderboard/distance` - Leaderboard by distance
- `GET /api/leaderboard/hikes` - Leaderboard by hike count

### Hikes

- `GET /api/hikes` - List public hikes
- `GET /api/hikes/:id` - Get hike details
- `POST /api/hikes` - Create hike
- `PUT /api/hikes/:id` - Update hike
- `DELETE /api/hikes/:id` - Delete hike
- `GET /api/hikes/nearby` - Get nearby hikes (geo-query)
- `GET /api/hikes/search` - Search hikes
- `GET /api/hikes/filter` - Filter hikes

### Observations

- `GET /api/observations` - List public observations
- `GET /api/observations/:id` - Get observation details
- `POST /api/observations` - Create observation
- `PUT /api/observations/:id` - Update observation
- `DELETE /api/observations/:id` - Delete observation
- `GET /api/observations/nearby` - Get nearby observations (geo-query)
- `POST /api/observations/:id/confirm` - Confirm observation
- `POST /api/observations/:id/dispute` - Dispute observation

### Follows

- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following

### Comments

- `GET /api/observations/:id/comments` - Get comments
- `POST /api/observations/:id/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Feeds

- `GET /api/feeds` - Get user feed
- `GET /api/feeds/hikes` - Get hike feed
- `GET /api/feeds/observations` - Get observation feed

## Models

### User

```javascript
{
  id: BigInt,
  username: String,
  avatarUrl: String,
  bio: String,
  region: String,
  followerCount: Int,
  followingCount: Int,
  createdAt: Timestamp
}
```

### Hike

```javascript
{
  id: BigInt,
  userId: BigInt,
  name: String,
  location: String,
  length: Float,
  difficulty: String,
  description: String,
  privacy: String,
  lat: Float,
  lng: Float,
  createdAt: Timestamp
}
```

### Observation

```javascript
{
  id: BigInt,
  hikeId: BigInt,
  userId: BigInt,
  title: String,
  imageUrl: String,
  lat: Float,
  lng: Float,
  status: String,
  confirmations: Int,
  disputes: Int,
  createdAt: Timestamp
}
```

## PostGIS Queries

The backend uses PostGIS for efficient geo-spatial queries:

- **Nearby hikes/observations**: Uses `ST_DWithin()` for radius queries
- **Distance calculation**: Uses `ST_Distance()` to compute distances
- **Geometry indexing**: GIST indexes on geometry columns for performance

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

## Development Notes

- Models are in `src/models/`
- Routes will be in `src/routes/`
- Controllers will be in `src/controllers/`
- Services will be in `src/services/`
- Middleware will be in `src/middlewares/`
- Utilities will be in `src/utils/`

## License

ISC
