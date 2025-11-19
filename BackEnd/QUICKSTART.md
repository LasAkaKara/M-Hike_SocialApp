# M-Hike Backend Quick Start Guide

## Prerequisites

- Node.js 14+
- PostgreSQL 12+
- PostGIS extension

## 1. Setup PostgreSQL Database

### On Windows (using pgAdmin or command line):

```sql
-- Create database
CREATE DATABASE mhike_db;

-- Connect to the database
\c mhike_db

-- Enable PostGIS
CREATE EXTENSION postgis;
```

### Or using command line:

```bash
createdb mhike_db
psql -d mhike_db -c "CREATE EXTENSION postgis;"
```

## 2. Install Dependencies

```bash
cd BackEnd
npm install
```

## 3. Configure Environment

Create a `.env` file in the BackEnd directory:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mhike_db
PORT=5000
NODE_ENV=development
```

## 4. Start the Server

### Development (with auto-reload):

```bash
npm run dev
```

### Production:

```bash
npm start
```

You should see:

```
Initializing database...
Database initialized successfully
Server running on http://localhost:5000
Health check: http://localhost:5000/health
```

## 5. Test the API

### Health Check

```bash
curl http://localhost:5000/health
```

### Create a User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "bio": "Test user",
    "region": "Test Region"
  }'
```

### Create a Hike

```bash
curl -X POST http://localhost:5000/api/hikes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Test Hike",
    "location": "Test Location",
    "length": 10.5,
    "difficulty": "Easy",
    "privacy": "public",
    "lat": 40.7128,
    "lng": -74.0060
  }'
```

### Get All Hikes

```bash
curl http://localhost:5000/api/hikes
```

### Get Nearby Hikes

```bash
curl "http://localhost:5000/api/hikes/nearby?lat=40.7128&lng=-74.0060&radius=5"
```

## 6. API Endpoints Overview

### Users

- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/leaderboard/distance` - Distance leaderboard
- `GET /api/users/leaderboard/hikes` - Hike count leaderboard

### Hikes

- `POST /api/hikes` - Create hike
- `GET /api/hikes` - List public hikes
- `GET /api/hikes/:id` - Get hike by ID
- `PUT /api/hikes/:id` - Update hike
- `DELETE /api/hikes/:id` - Delete hike
- `GET /api/hikes/search?name=...` - Search hikes
- `GET /api/hikes/filter?...` - Filter hikes
- `GET /api/hikes/nearby?lat=...&lng=...&radius=...` - Nearby hikes

### Observations

- `POST /api/observations` - Create observation
- `GET /api/observations` - List public observations
- `GET /api/observations/:id` - Get observation by ID
- `PUT /api/observations/:id` - Update observation
- `DELETE /api/observations/:id` - Delete observation
- `POST /api/observations/:id/confirm` - Confirm observation
- `POST /api/observations/:id/dispute` - Dispute observation
- `GET /api/observations/nearby?lat=...&lng=...` - Nearby observations
- `GET /api/observations/trending` - Trending observations

### Follows

- `POST /api/follows` - Follow user
- `DELETE /api/follows` - Unfollow user
- `GET /api/follows/:userId/followers` - Get followers
- `GET /api/follows/:userId/following` - Get following

### Comments

- `POST /api/comments` - Create comment
- `GET /api/comments/observation/:observationId` - Get comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Feeds

- `GET /api/feeds/:userId` - Get user feed
- `GET /api/feeds/:userId/mixed` - Get mixed feed
- `POST /api/feeds` - Add item to feed
- `DELETE /api/feeds/:id` - Delete feed item

## 7. Database Schema

The database is automatically initialized on first run with:

- `users` table
- `follows` table
- `hikes` table with PostGIS geometry
- `observations` table with PostGIS geometry
- `observation_comments` table
- `feeds` table

All tables include proper relationships, constraints, and indexes.

## 8. Troubleshooting

### Database Connection Error

- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database `mhike_db` exists

### PostGIS Extension Error

- Install PostGIS: `CREATE EXTENSION postgis;`
- Verify with: `SELECT PostGIS_version();`

### Port Already in Use

- Change PORT in `.env`
- Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### Module Not Found

- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

## 9. Next Steps

1. **Add Authentication**: Implement JWT middleware
2. **Add Validation**: Add request validation middleware
3. **Add Tests**: Create unit and integration tests
4. **Deploy**: Deploy to production server
5. **Add Caching**: Implement Redis caching for performance

## 10. Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Implementation Details**: See `IMPLEMENTATION.md`
- **Database Schema**: See `README.md`

## 11. Development Tips

### View Database

```bash
psql -d mhike_db
\dt  # List tables
\d users  # Describe table
SELECT * FROM users;  # Query data
```

### Monitor Logs

The server logs all requests with timestamps:

```
2024-01-15T10:30:00.000Z - POST /api/users
2024-01-15T10:30:01.000Z - GET /api/hikes
```

### Test with Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:5000/api`
3. Test each endpoint

### Use curl for quick tests

```bash
# Create user
USER_ID=$(curl -s -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}' | jq '.id')

# Create hike with user ID
curl -X POST http://localhost:5000/api/hikes \
  -H "Content-Type: application/json" \
  -d "{\"userId\":$USER_ID,\"name\":\"Test\",\"length\":10,\"lat\":40,\"lng\":-74}"
```
