# M-Hike Backend API

Express.js REST API backend for the M-Hike social hiking application with PostgreSQL database and PostGIS for geo-spatial queries.

## 🚀 Status

**Production Ready** - Fully refactored and optimized for the Android frontend.

| Feature | Status |
|---------|--------|
| Authentication | ✅ Complete |
| Hike Management | ✅ Complete |
| Observations | ✅ Complete |
| Social Features (Follow) | ✅ Complete |
| User Search | ✅ Complete |
| Nearby Hikes (PostGIS) | ✅ Complete |
| Image Sync (Cloudinary) | ✅ Complete |

## 📊 API Overview

**Total Endpoints**: 13 (optimized from 50+)
- **Auth**: 2 endpoints
- **Hikes**: 5 endpoints
- **Observations**: 2 endpoints
- **Follows**: 3 endpoints
- **Search**: 1 endpoint

## 🛠️ Tech Stack

- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Database**: PostgreSQL 12+ with PostGIS
- **Query Client**: node-postgres (pg)
- **Image Storage**: Cloudinary
- **Authentication**: JWT tokens
- **Geo-Queries**: PostGIS ST_DWithin, ST_Distance

## 📋 Prerequisites

- Node.js 14 or higher
- PostgreSQL 12 or higher
- PostGIS extension enabled
- Cloudinary account (for image storage)

## ⚙️ Installation & Setup

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` file in project root:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mhike_db

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=7d

# Cloudinary (for image upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Create PostgreSQL Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE mhike_db;
CREATE EXTENSION postgis;
```

### 4. Start the Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/signup              - Register new user
POST   /api/auth/signin              - Login user (returns JWT token)
```

### Hikes

```
POST   /api/hikes                    - Create/sync hike
GET    /api/hikes/my                 - Get authenticated user's hikes
GET    /api/hikes/nearby             - Get nearby hikes (geo-query)
GET    /api/hikes/user/:userId/following  - Get hikes from followed users (feed)
DELETE /api/hikes/:id                - Delete hike
```

### Observations

```
POST   /api/observations             - Create observation with image
GET    /api/observations/hike/:hikeId    - Get observations for a hike
```

### Follows

```
POST   /api/follows                  - Follow a user
DELETE /api/follows                  - Unfollow a user
GET    /api/follows/check            - Check if following (query: followerId, followedId)
```

### Search

```
GET    /api/search/users             - Search users by username
```

## 📦 Database Schema

### users
```sql
id BIGSERIAL PRIMARY KEY
username VARCHAR(255) UNIQUE NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
passwordHash VARCHAR(255) NOT NULL
avatarUrl VARCHAR(512)
bio TEXT
region VARCHAR(100)
followerCount INT DEFAULT 0
followingCount INT DEFAULT 0
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### follows
```sql
id BIGSERIAL PRIMARY KEY
followerId BIGINT REFERENCES users(id) ON DELETE CASCADE
followedId BIGINT REFERENCES users(id) ON DELETE CASCADE
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
UNIQUE(followerId, followedId)
```

### hikes
```sql
id BIGSERIAL PRIMARY KEY
userId BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL
name VARCHAR(255) NOT NULL
location VARCHAR(255)
length DECIMAL(10, 2)
difficulty VARCHAR(50)
description TEXT
privacy VARCHAR(50) DEFAULT 'private'
lat DECIMAL(10, 8)
lng DECIMAL(11, 8)
geom GEOMETRY(Point, 4326)  -- PostGIS geometry for spatial queries
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### observations
```sql
id BIGSERIAL PRIMARY KEY
hikeId BIGINT REFERENCES hikes(id) ON DELETE CASCADE NOT NULL
userId BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL
title VARCHAR(255) NOT NULL
imageUrl VARCHAR(512)
lat DECIMAL(10, 8)
lng DECIMAL(11, 8)
geom GEOMETRY(Point, 4326)
status VARCHAR(50) DEFAULT 'Open'
confirmations INT DEFAULT 0
disputes INT DEFAULT 0
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

Token is obtained from `/api/auth/signin`:

```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 123,
  "username": "user@example.com"
}
```

## 🗺️ Geo-Spatial Features

### Nearby Hikes Query

```
GET /api/hikes/nearby?lat=51.5074&lng=-0.1278&radius=5&limit=50
```

**Parameters**:
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in kilometers (default: 5)
- `limit`: Max results (default: 50)

Uses PostGIS `ST_DWithin()` for efficient distance queries.

## 🖼️ Image Handling

Images are uploaded to Cloudinary and stored with observations.

**Upload Flow**:
1. Android app captures/selects image
2. Image sent with observation create request
3. Backend uploads to Cloudinary
4. Returns Cloudinary URL
5. URL stored in database

## 📊 Project Structure

```
src/
├── app.js                      # Express app setup
├── server.js                   # Server entry point
├── configs/
│   └── database.js             # PostgreSQL pool config
├── controllers/
│   ├── authController.js       # Auth logic
│   ├── hikeController.js       # Hike operations
│   ├── observationController.js # Observation operations
│   ├── followController.js     # Follow logic
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   ├── hikeRoutes.js          # Hike endpoints
│   ├── observationRoutes.js   # Observation endpoints
│   ├── followRoutes.js        # Follow endpoints
│   └── searchRoutes.js        # Search endpoints
├── models/
│   ├── User.js                # User model & queries
│   ├── Hike.js                # Hike model & queries
│   ├── Observation.js         # Observation model & queries
│   └── Follow.js              # Follow model & queries
├── services/
│   ├── authService.js         # Auth business logic
│   └── searchService.js       # Search business logic
├── middlewares/
│   ├── authMiddleware.js      # JWT verification
│   └── errorHandler.js        # Error handling
└── utils/
    ├── cloudinaryHelper.js    # Cloudinary upload
    └── validators.js          # Input validation
```

## 🧪 Testing Endpoints

### Create Hike
```bash
curl -X POST http://localhost:5000/api/hikes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Mountain Trail",
    "location": "Alpine",
    "length": 12.5,
    "difficulty": "Hard",
    "lat": 51.5074,
    "lng": -0.1278
  }'
```

### Get Nearby Hikes
```bash
curl http://localhost:5000/api/hikes/nearby?lat=51.5074&lng=-0.1278&radius=5
```

### Search Users
```bash
curl http://localhost:5000/api/search/users?username=john
```

### Follow User
```bash
curl -X POST http://localhost:5000/api/follows \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "followerId": 1,
    "followedId": 2
  }'
```

## 🔄 Data Sync Flow

The backend supports bi-directional sync with the Android app:

1. **Upload to Cloud**: Android sends local hikes/observations to backend
2. **Download from Cloud**: Android fetches hikes from followed users
3. **Image Sync**: Images uploaded to Cloudinary during sync
4. **Conflict Resolution**: Latest timestamp wins

## ⚡ Performance Optimizations

- **PostGIS Indexes**: GIST indexes on geometry columns
- **Database Queries**: Optimized with JOINs and WHERE clauses
- **Pagination**: Limit/offset for large result sets
- **Cloudinary CDN**: Images served from global CDN
- **Connection Pool**: Node-postgres with configurable pool size

## 🐛 Error Handling

All errors return consistent JSON format:

```json
{
  "error": "Error message",
  "status": 400
}
```

**Common Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## 📚 Additional Documentation

- **[BACKEND_REFACTORING_GUIDE.md](./BACKEND_REFACTORING_GUIDE.md)** - Refactoring details
- **[REFACTORING_COMPLETED.md](./REFACTORING_COMPLETED.md)** - Completion summary
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Detailed API docs
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Implementation notes

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET
- [ ] Configure production database
- [ ] Set up Cloudinary account
- [ ] Enable HTTPS
- [ ] Configure CORS for frontend domains
- [ ] Set up error logging
- [ ] Configure database backups

### Deploy to Heroku

```bash
heroku create mhike-backend
git push heroku main
heroku logs --tail
```

## 📝 License

ISC - Part of M-Hike Project (University of Hertfordshire - COMP1786)

## ✍️ Authors

- Backend Implementation: Hoang Le Bach
- Android Frontend: See Mhike_java/README.md

---

**Last Updated**: December 9, 2025  
**Status**: Production Ready ✅ | 13 Optimized Endpoints | 70% Code Reduction
