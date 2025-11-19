# M-Hike Backend API Documentation

Complete REST API documentation for the M-Hike social hiking application.

## Base URL

```
http://localhost:5000/api
```

## Response Format

All responses are JSON. Successful responses include the requested data. Error responses follow this format:

```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Users API

### Create User

**POST** `/users`

**Request Body:**

```json
{
  "username": "john_hiker",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Love hiking!",
  "region": "California"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "username": "john_hiker",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Love hiking!",
  "region": "California",
  "followerCount": 0,
  "followingCount": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get All Users

**GET** `/users?limit=50&offset=0`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "bio": "...",
    "region": "California",
    "followerCount": 5,
    "followingCount": 3,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get User by ID

**GET** `/users/:id`

**Response:** `200 OK`

```json
{
  "id": 1,
  "username": "john_hiker",
  "avatarUrl": "...",
  "bio": "...",
  "region": "California",
  "followerCount": 5,
  "followingCount": 3,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get User by Username

**GET** `/users/username/:username`

**Response:** `200 OK` (Same as Get User by ID)

### Update User

**PUT** `/users/:id`

**Request Body:** (All fields optional)

```json
{
  "username": "john_hiker_updated",
  "bio": "Professional hiker",
  "region": "Colorado"
}
```

**Response:** `200 OK` (Updated user object)

### Delete User

**DELETE** `/users/:id`

**Response:** `200 OK`

```json
{
  "message": "User deleted successfully",
  "user": { ... }
}
```

### Get User Stats

**GET** `/users/:id/stats`

**Response:** `200 OK`

```json
{
  "followerCount": 5,
  "followingCount": 3
}
```

### Get Leaderboard by Distance

**GET** `/users/leaderboard/distance?limit=10&region=California`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "john_hiker",
    "avatarUrl": "...",
    "region": "California",
    "totalDistance": 150.5,
    "hikeCount": 12
  }
]
```

### Get Leaderboard by Hike Count

**GET** `/users/leaderboard/hikes?limit=10&region=California`

**Response:** `200 OK` (Same format as distance leaderboard)

---

## Hikes API

### Create Hike

**POST** `/hikes`

**Request Body:**

```json
{
  "userId": 1,
  "name": "Mount Everest Base Camp",
  "location": "Nepal",
  "length": 65.5,
  "difficulty": "Hard",
  "description": "Amazing trek to Everest base camp",
  "privacy": "public",
  "lat": 28.0,
  "lng": 86.5
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "userId": 1,
  "name": "Mount Everest Base Camp",
  "location": "Nepal",
  "length": 65.5,
  "difficulty": "Hard",
  "description": "Amazing trek to Everest base camp",
  "privacy": "public",
  "lat": 28.0,
  "lng": 86.5,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Get All Public Hikes

**GET** `/hikes?limit=50&offset=0`

**Response:** `200 OK` (Array of hike objects with user info)

### Get Hike by ID

**GET** `/hikes/:id`

**Response:** `200 OK` (Hike object with user info)

### Get Hikes by User

**GET** `/hikes/user/:userId?limit=50&offset=0`

**Response:** `200 OK` (Array of hikes)

### Search Hikes

**GET** `/hikes/search?name=Everest&limit=50&offset=0`

**Response:** `200 OK` (Array of matching hikes)

### Filter Hikes

**GET** `/hikes/filter?minLength=10&maxLength=100&minDifficulty=Easy&maxDifficulty=Hard&location=Nepal&limit=50&offset=0`

**Query Parameters:**

- `minLength`: Minimum hike length in km
- `maxLength`: Maximum hike length in km
- `minDifficulty`: Minimum difficulty level
- `maxDifficulty`: Maximum difficulty level
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)
- `location`: Location search string
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:** `200 OK` (Array of filtered hikes)

### Get Nearby Hikes

**GET** `/hikes/nearby?lat=28.0&lng=86.5&radius=5&limit=50`

**Query Parameters:**

- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in km (default: 5)
- `limit`: Results limit (default: 50)

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Mount Everest Base Camp",
    "location": "Nepal",
    "length": 65.5,
    "difficulty": "Hard",
    "lat": 28.0,
    "lng": 86.5,
    "distanceKm": 2.3,
    "username": "john_hiker",
    "avatarUrl": "..."
  }
]
```

### Get Following Hikes Feed

**GET** `/hikes/user/:userId/following?limit=50&offset=0`

**Response:** `200 OK` (Hikes from followed users)

### Update Hike

**PUT** `/hikes/:id`

**Request Body:** (All fields optional)

```json
{
  "name": "Updated name",
  "difficulty": "Medium",
  "privacy": "private"
}
```

**Response:** `200 OK` (Updated hike)

### Delete Hike

**DELETE** `/hikes/:id`

**Response:** `200 OK`

```json
{
  "message": "Hike deleted successfully",
  "hike": { ... }
}
```

---

## Observations API

### Create Observation

**POST** `/observations`

**Request Body:**

```json
{
  "hikeId": 1,
  "userId": 1,
  "title": "Trail is blocked",
  "imageUrl": "https://example.com/image.jpg",
  "lat": 28.0,
  "lng": 86.5,
  "status": "Open"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "hikeId": 1,
  "userId": 1,
  "title": "Trail is blocked",
  "imageUrl": "https://example.com/image.jpg",
  "lat": 28.0,
  "lng": 86.5,
  "status": "Open",
  "confirmations": 0,
  "disputes": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get All Public Observations

**GET** `/observations?limit=50&offset=0`

**Response:** `200 OK` (Array of observations with user and hike info)

### Get Observation by ID

**GET** `/observations/:id`

**Response:** `200 OK` (Observation with user and hike info)

### Get Observations by Hike

**GET** `/observations/hike/:hikeId?limit=50&offset=0`

**Response:** `200 OK` (Array of observations for hike)

### Get Observations by User

**GET** `/observations/user/:userId?limit=50&offset=0`

**Response:** `200 OK` (Array of user's observations)

### Search Observations

**GET** `/observations/search?title=blocked&limit=50&offset=0`

**Response:** `200 OK` (Matching observations)

### Get Nearby Observations

**GET** `/observations/nearby?lat=28.0&lng=86.5&radius=5&limit=50`

**Response:** `200 OK` (Observations with distance)

### Get Trending Observations

**GET** `/observations/trending?limit=50&offset=0`

**Response:** `200 OK` (Sorted by confirmations)

### Get Following Observations

**GET** `/observations/user/:userId/following?limit=50&offset=0`

**Response:** `200 OK` (From followed users)

### Confirm Observation

**POST** `/observations/:id/confirm`

**Response:** `200 OK` (Updated observation with incremented confirmations)

### Dispute Observation

**POST** `/observations/:id/dispute`

**Response:** `200 OK` (Updated observation with incremented disputes)

### Update Observation

**PUT** `/observations/:id`

**Request Body:** (All fields optional)

```json
{
  "title": "Updated title",
  "status": "Resolved",
  "confirmations": 5
}
```

**Response:** `200 OK` (Updated observation)

### Delete Observation

**DELETE** `/observations/:id`

**Response:** `200 OK`

```json
{
  "message": "Observation deleted successfully",
  "observation": { ... }
}
```

---

## Follows API

### Follow User

**POST** `/follows`

**Request Body:**

```json
{
  "followerId": 1,
  "followedId": 2
}
```

**Response:** `201 Created`

```json
{
  "followerId": 1,
  "followedId": 2,
  "followedAt": "2024-01-15T10:30:00Z"
}
```

### Unfollow User

**DELETE** `/follows`

**Request Body:**

```json
{
  "followerId": 1,
  "followedId": 2
}
```

**Response:** `200 OK`

```json
{
  "message": "Unfollowed successfully",
  "follow": { ... }
}
```

### Check if Following

**GET** `/follows/check?followerId=1&followedId=2`

**Response:** `200 OK`

```json
{
  "isFollowing": true
}
```

### Get Followers

**GET** `/follows/:userId/followers?limit=50&offset=0`

**Response:** `200 OK` (Array of follower users)

### Get Following

**GET** `/follows/:userId/following?limit=50&offset=0`

**Response:** `200 OK` (Array of followed users)

### Get Follower Count

**GET** `/follows/:userId/followers/count`

**Response:** `200 OK`

```json
{
  "userId": 1,
  "followerCount": 5
}
```

### Get Following Count

**GET** `/follows/:userId/following/count`

**Response:** `200 OK`

```json
{
  "userId": 1,
  "followingCount": 3
}
```

### Get Mutual Followers

**GET** `/follows/:userId1/mutual/:userId2?limit=50&offset=0`

**Response:** `200 OK` (Array of mutual followers)

---

## Comments API

### Create Comment

**POST** `/comments`

**Request Body:**

```json
{
  "observationId": 1,
  "userId": 1,
  "content": "I can confirm this issue"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "observationId": 1,
  "userId": 1,
  "content": "I can confirm this issue",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get Comments by Observation

**GET** `/comments/observation/:observationId?limit=50&offset=0`

**Response:** `200 OK` (Array of comments with user info)

### Get Comments by User

**GET** `/comments/user/:userId?limit=50&offset=0`

**Response:** `200 OK` (Array of user's comments)

### Get Recent Comments

**GET** `/comments/recent?limit=50&offset=0`

**Response:** `200 OK` (Recent comments)

### Get Comment by ID

**GET** `/comments/:id`

**Response:** `200 OK` (Comment with user info)

### Get Comment Count

**GET** `/comments/observation/:observationId/count`

**Response:** `200 OK`

```json
{
  "observationId": 1,
  "commentCount": 5
}
```

### Update Comment

**PUT** `/comments/:id`

**Request Body:**

```json
{
  "content": "Updated comment"
}
```

**Response:** `200 OK` (Updated comment)

### Delete Comment

**DELETE** `/comments/:id`

**Response:** `200 OK`

```json
{
  "message": "Comment deleted successfully",
  "comment": { ... }
}
```

---

## Feeds API

### Get User Feed

**GET** `/feeds/:userId?limit=50&offset=0`

**Response:** `200 OK` (Array of feed items)

### Get Hike Feed Items

**GET** `/feeds/:userId/hikes?limit=50&offset=0`

**Response:** `200 OK` (Hike feed items with details)

### Get Observation Feed Items

**GET** `/feeds/:userId/observations?limit=50&offset=0`

**Response:** `200 OK` (Observation feed items with details)

### Get Mixed Feed

**GET** `/feeds/:userId/mixed?limit=50&offset=0`

**Response:** `200 OK` (Combined hike and observation feed)

### Get Feed Count

**GET** `/feeds/:userId/count`

**Response:** `200 OK`

```json
{
  "userId": 1,
  "feedCount": 25
}
```

### Add Item to Feed

**POST** `/feeds`

**Request Body:**

```json
{
  "userId": 1,
  "itemType": "hike",
  "itemId": 5
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "userId": 1,
  "itemType": "hike",
  "itemId": 5,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Check if Item in Feed

**GET** `/feeds/check?userId=1&itemType=hike&itemId=5`

**Response:** `200 OK`

```json
{
  "userId": 1,
  "itemType": "hike",
  "itemId": 5,
  "isInFeed": true
}
```

### Delete Feed Item

**DELETE** `/feeds/:id`

**Response:** `200 OK`

```json
{
  "message": "Feed item deleted successfully",
  "item": { ... }
}
```

### Clear User Feed

**DELETE** `/feeds/:userId/clear`

**Response:** `200 OK`

```json
{
  "message": "Feed cleared successfully",
  "deletedCount": 25
}
```

### Populate Following Hikes Feed

**POST** `/feeds/:userId/populate/hikes`

**Response:** `200 OK`

```json
{
  "message": "Following hikes feed populated",
  "addedCount": 5
}
```

### Populate Following Observations Feed

**POST** `/feeds/:userId/populate/observations`

**Response:** `200 OK`

```json
{
  "message": "Following observations feed populated",
  "addedCount": 3
}
```

---

## Error Codes

| Status | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| 200    | OK - Request successful                                       |
| 201    | Created - Resource created successfully                       |
| 400    | Bad Request - Invalid parameters                              |
| 404    | Not Found - Resource not found                                |
| 409    | Conflict - Resource already exists (e.g., duplicate username) |
| 500    | Internal Server Error - Server error                          |

---

## Example Usage

### Create a user and hike

```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_hiker",
    "bio": "Love hiking!",
    "region": "California"
  }'

# Create hike
curl -X POST http://localhost:5000/api/hikes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Mount Everest Base Camp",
    "location": "Nepal",
    "length": 65.5,
    "difficulty": "Hard",
    "privacy": "public",
    "lat": 28.0,
    "lng": 86.5
  }'
```

### Search and filter

```bash
# Search hikes by name
curl "http://localhost:5000/api/hikes/search?name=Everest"

# Get nearby hikes
curl "http://localhost:5000/api/hikes/nearby?lat=28.0&lng=86.5&radius=10"

# Filter hikes
curl "http://localhost:5000/api/hikes/filter?minLength=50&maxLength=100&difficulty=Hard"
```

### Social features

```bash
# Follow user
curl -X POST http://localhost:5000/api/follows \
  -H "Content-Type: application/json" \
  -d '{"followerId": 1, "followedId": 2}'

# Get followers
curl "http://localhost:5000/api/follows/1/followers"

# Get leaderboard
curl "http://localhost:5000/api/users/leaderboard/distance?limit=10"
```
