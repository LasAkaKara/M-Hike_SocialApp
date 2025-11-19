# M-Hike Backend - Advanced Features Documentation

Complete documentation for authentication, leaderboards, discovery feeds, and advanced search.

---

## 1. Authentication System

### Overview

JWT-based authentication with password hashing using SHA-256.

### Sign Up

**POST** `/api/auth/signup`

**Request Body:**

```json
{
  "username": "john_hiker",
  "password": "SecurePassword123",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Love hiking!",
  "region": "California"
}
```

**Response:** `201 Created`

```json
{
  "user": {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Love hiking!",
    "region": "California",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User created successfully"
}
```

### Sign In

**POST** `/api/auth/signin`

**Request Body:**

```json
{
  "username": "john_hiker",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`

```json
{
  "user": {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "bio": "...",
    "region": "California",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Sign in successful"
}
```

### Get Current User

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK` (User object)

### Change Password

**POST** `/api/auth/change-password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

### Request Password Reset

**POST** `/api/auth/request-password-reset`

**Request Body:**

```json
{
  "username": "john_hiker"
}
```

**Response:** `200 OK`

```json
{
  "resetToken": "a1b2c3d4e5f6...",
  "message": "Password reset token generated. Use this token to reset your password."
}
```

### Reset Password

**POST** `/api/auth/reset-password`

**Request Body:**

```json
{
  "username": "john_hiker",
  "resetToken": "a1b2c3d4e5f6...",
  "newPassword": "NewPassword456"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password reset successfully"
}
```

### Refresh Token

**POST** `/api/auth/refresh-token`

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Leaderboards

### Get Distance Leaderboard

**GET** `/api/leaderboard/distance?limit=10&region=California&offset=0`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "region": "California",
    "totalDistance": 250.5,
    "hikeCount": 25,
    "rank": 1
  }
]
```

### Get Hike Count Leaderboard

**GET** `/api/leaderboard/hikes?limit=10&region=California&offset=0`

**Response:** `200 OK` (Same format, sorted by hikeCount)

### Get Difficulty Leaderboard

**GET** `/api/leaderboard/difficulty?limit=10&region=California&offset=0`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "region": "California",
    "hardHikes": 15,
    "mediumHikes": 8,
    "easyHikes": 2,
    "totalHikes": 25,
    "rank": 1
  }
]
```

### Get Observation Leaderboard

**GET** `/api/leaderboard/observations?limit=10&region=California&offset=0`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "region": "California",
    "observationCount": 50,
    "totalConfirmations": 120,
    "totalDisputes": 5,
    "rank": 1
  }
]
```

### Get Followers Leaderboard

**GET** `/api/leaderboard/followers?limit=10&region=California&offset=0`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "region": "California",
    "followerCount": 500,
    "followingCount": 150,
    "rank": 1
  }
]
```

### Get User Rank

**GET** `/api/leaderboard/user/:userId?type=distance&region=California`

**Query Parameters:**

- `type`: distance, hikes, difficulty, observations, followers (default: distance)
- `region`: Optional region filter

**Response:** `200 OK` (User's rank entry)

---

## 3. Discovery Feed

### Get Discovery Feed (Geo-based)

**GET** `/api/discovery/nearby?lat=40.7128&lng=-74.0060&radius=5&limit=50&offset=0`

**Response:** `200 OK`

```json
[
  {
    "itemType": "observation",
    "itemId": 1,
    "observationId": 1,
    "title": "Trail is blocked",
    "imageUrl": "...",
    "status": "Open",
    "confirmations": 5,
    "disputes": 1,
    "lat": 40.7128,
    "lng": -74.006,
    "distanceKm": 2.3,
    "userId": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "hikeName": "Central Park Trail",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Trending Nearby

**GET** `/api/discovery/trending-nearby?lat=40.7128&lng=-74.0060&radius=5&limit=50`

**Response:** `200 OK` (Observations sorted by confirmations)

### Get Popular Hikes Nearby

**GET** `/api/discovery/popular-hikes?lat=40.7128&lng=-74.0060&radius=10&limit=50`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Central Park Trail",
    "location": "New York",
    "length": 5.5,
    "difficulty": "Easy",
    "description": "...",
    "lat": 40.7128,
    "lng": -74.006,
    "distanceKm": 2.3,
    "username": "john_hiker",
    "avatarUrl": "...",
    "observationCount": 10,
    "totalConfirmations": 25,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Personalized Feed (Auth Required)

**GET** `/api/discovery/personalized?limit=50&offset=0`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK` (Feed from followed users)

### Auto-Populate Feed (Auth Required)

**POST** `/api/discovery/populate-feed`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "message": "Feed auto-populated successfully"
}
```

### Get Recommendations (Auth Required)

**GET** `/api/discovery/recommendations?limit=50`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK` (Recommended hikes based on user activity)

### Get Trending Hikes Globally

**GET** `/api/discovery/trending-hikes?limit=50&offset=0`

**Response:** `200 OK` (Global trending hikes)

### Get Trending Observations Globally

**GET** `/api/discovery/trending-observations?limit=50&offset=0`

**Response:** `200 OK` (Global trending observations)

---

## 4. Advanced Search

### Advanced Hike Search

**GET** `/api/search/hikes?name=Everest&location=Nepal&minLength=50&maxLength=100&difficulty=Hard&region=Nepal&minRating=5&sortBy=totalConfirmations&sortOrder=DESC&limit=50&offset=0`

**Query Parameters:**

- `name`: Search by hike name
- `location`: Search by location
- `minLength`: Minimum hike length (km)
- `maxLength`: Maximum hike length (km)
- `difficulty`: Easy, Medium, Hard
- `region`: User region
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)
- `minRating`: Minimum confirmations
- `sortBy`: createdAt, length, difficulty, totalConfirmations, observationCount
- `sortOrder`: ASC or DESC
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:** `200 OK` (Array of hikes with stats)

### Advanced Observation Search

**GET** `/api/search/observations?title=blocked&status=Open&minConfirmations=5&maxDisputes=2&hikeId=1&userId=1&sortBy=confirmations&sortOrder=DESC&limit=50&offset=0`

**Query Parameters:**

- `title`: Search by title
- `status`: Open, Resolved, etc.
- `minConfirmations`: Minimum confirmations
- `maxDisputes`: Maximum disputes
- `hikeId`: Filter by hike
- `userId`: Filter by user
- `startDate`: Start date
- `endDate`: End date
- `sortBy`: createdAt, confirmations, disputes, commentCount
- `sortOrder`: ASC or DESC

**Response:** `200 OK` (Array of observations with stats)

### Search Users

**GET** `/api/search/users?username=john&region=California&minFollowers=10&maxFollowers=1000&sortBy=followerCount&sortOrder=DESC&limit=50&offset=0`

**Query Parameters:**

- `username`: Search by username
- `region`: Filter by region
- `minFollowers`: Minimum followers
- `maxFollowers`: Maximum followers
- `sortBy`: followerCount, followingCount, hikeCount, totalDistance, username
- `sortOrder`: ASC or DESC

**Response:** `200 OK` (Array of users with stats)

### Global Search

**GET** `/api/search/global?q=everest&limit=50`

**Response:** `200 OK`

```json
[
  {
    "type": "hike",
    "id": 1,
    "title": "Mount Everest Base Camp",
    "location": "Nepal",
    "description": "...",
    "username": "john_hiker",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "type": "observation",
    "id": 1,
    "title": "Trail is blocked",
    "location": "Mount Everest",
    "username": "jane_hiker",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "type": "user",
    "id": 1,
    "title": "john_hiker",
    "location": "California",
    "description": "Love hiking!",
    "username": "john_hiker",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Search Suggestions

**GET** `/api/search/suggestions?q=eve&type=all`

**Query Parameters:**

- `q`: Search query (required)
- `type`: all, hike, location, user (default: all)

**Response:** `200 OK`

```json
[
  {
    "suggestion": "Mount Everest Base Camp",
    "type": "hike"
  },
  {
    "suggestion": "Nepal",
    "type": "location"
  },
  {
    "suggestion": "everest_explorer",
    "type": "user"
  }
]
```

---

## 5. Authentication Usage

### Using JWT Token

All protected endpoints require the `Authorization` header:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/auth/me
```

### Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwNTMxNDIwMH0.abc123...
```

### Token Expiration

- Default: 7 days
- Can be refreshed using `/api/auth/refresh-token`

---

## 6. Leaderboard Features

### Multiple Leaderboard Types

1. **Distance**: Total km hiked
2. **Hikes**: Number of hikes completed
3. **Difficulty**: Hard hikes completed
4. **Observations**: Confirmations on observations
5. **Followers**: Number of followers

### Regional Filtering

All leaderboards support optional `region` parameter for regional rankings.

### Pagination

All leaderboards support `limit` and `offset` for pagination.

---

## 7. Discovery Feed Features

### Geo-based Discovery

- Find observations and hikes within a radius
- Sort by confirmations and distance
- Real-time trending content

### Personalized Feed

- Shows content from followed users
- Auto-populates based on follow relationships
- Personalized recommendations

### Trending Content

- Global trending hikes
- Global trending observations
- Sorted by confirmations and engagement

---

## 8. Advanced Search Features

### Multi-field Filtering

- Search across multiple fields simultaneously
- Combine filters for precise results
- Support for date ranges

### Sorting Options

- Sort by relevance, date, distance, confirmations
- Ascending or descending order
- Custom sort fields per resource type

### Search Suggestions

- Auto-complete suggestions
- Type-specific suggestions (hike, location, user)
- Prefix-based matching

### Global Search

- Search across all content types
- Returns mixed results
- Unified search interface

---

## 9. Security Features

### Password Security

- SHA-256 hashing
- Minimum 6 characters required
- Password reset with token expiration

### JWT Security

- Token-based authentication
- Expiration after 7 days
- Refresh token support

### Authorization

- Ownership verification for resource updates
- Role-based access control ready
- Rate limiting support

---

## 10. Example Workflows

### Complete Authentication Flow

```bash
# 1. Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_hiker",
    "password": "SecurePassword123",
    "region": "California"
  }'

# 2. Get token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me

# 4. Change password
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePassword123",
    "newPassword": "NewPassword456"
  }'
```

### Discovery Feed Workflow

```bash
# 1. Get nearby observations
curl "http://localhost:5000/api/discovery/nearby?lat=40.7128&lng=-74.0060&radius=5"

# 2. Get trending hikes
curl "http://localhost:5000/api/discovery/trending-hikes?limit=10"

# 3. Get personalized feed (with auth)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/discovery/personalized

# 4. Get recommendations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/discovery/recommendations
```

### Advanced Search Workflow

```bash
# 1. Search hikes with filters
curl "http://localhost:5000/api/search/hikes?name=Everest&minLength=50&difficulty=Hard"

# 2. Get search suggestions
curl "http://localhost:5000/api/search/suggestions?q=eve&type=hike"

# 3. Global search
curl "http://localhost:5000/api/search/global?q=everest"

# 4. Search users
curl "http://localhost:5000/api/search/users?region=California&minFollowers=10"
```

### Leaderboard Workflow

```bash
# 1. Get distance leaderboard
curl "http://localhost:5000/api/leaderboard/distance?limit=10"

# 2. Get regional leaderboard
curl "http://localhost:5000/api/leaderboard/hikes?region=California"

# 3. Get user rank
curl "http://localhost:5000/api/leaderboard/user/1?type=distance"

# 4. Get difficulty leaderboard
curl "http://localhost:5000/api/leaderboard/difficulty?limit=10"
```
