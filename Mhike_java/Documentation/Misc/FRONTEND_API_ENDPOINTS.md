# M-Hike Frontend API Endpoints Documentation

**Generated**: December 9, 2025  
**Purpose**: Comprehensive inventory of all API endpoints used by the Android frontend application  
**Base URL**: `https://kandis-nonappealable-flatly.ngrok-free.dev/api`

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Hike Endpoints](#hike-endpoints)
3. [Observation Endpoints](#observation-endpoints)
4. [Follow/User Endpoints](#followuser-endpoints)
5. [Endpoint Summary by HTTP Method](#endpoint-summary-by-http-method)

---

## Authentication Endpoints

### Sign Up
- **Endpoint**: `POST /auth/signup`
- **Service**: `AuthService.java`
- **Purpose**: User registration with username, password, and profile information
- **Parameters**:
  - `username` (string, required)
  - `password` (string, required)
  - `bio` (string, optional)
  - `region` (string, optional)
  - `avatarUrl` (string, optional)
- **Returns**: JWT token, user ID, username
- **Used By**: LoginActivity (signup flow)

### Sign In
- **Endpoint**: `POST /auth/signin`
- **Service**: `AuthService.java`
- **Purpose**: User login with username and password
- **Parameters**:
  - `username` (string, required)
  - `password` (string, required)
- **Returns**: JWT token, user ID, username
- **Used By**: LoginActivity (signin flow)

---

## Hike Endpoints

### Create/Sync Hike
- **Endpoint**: `POST /hikes`
- **Service**: `SyncService.java` (`syncHikeToCloud()`)
- **Method**: POST
- **Purpose**: Create a new hike or sync a hike to cloud
- **Parameters** (JSON body):
  - `userId` (long)
  - `name` (string)
  - `location` (string)
  - `length` (float)
  - `difficulty` (string)
  - `description` (string, optional)
  - `privacy` (string)
  - `lat` (float)
  - `lng` (float)
- **Returns**: Cloud hike ID
- **Used By**: SyncService.syncHikeToCloud(), SyncService.syncHikeAsync()

### Async Hike Sync
- **Endpoint**: `POST /hikes`
- **Service**: `SyncService.java` (`syncHikeAsync()`)
- **Method**: POST
- **Purpose**: Asynchronously sync a single hike with callback
- **Parameters**: Same as above
- **Used By**: HikeDetailActivity (optional alternative to syncHikeToCloud)

### Get User's Hikes (from cloud)
- **Endpoint**: `GET /hikes/my`
- **Service**: `SyncService.java` (`fetchHikesFromCloud()`)
- **Method**: GET
- **Purpose**: Fetch authenticated user's hikes from cloud
- **Query Parameters**:
  - `limit` (optional)
  - `offset` (optional)
- **Returns**: Array of Hike objects
- **Used By**: SyncService.syncCloudToOffline()
- **Notes**: Requires Authorization header with JWT token

### Get Hikes from Followed Users (Feed)
- **Endpoint**: `GET /hikes/user/{userId}/following`
- **Service**: `FeedService.java` (`getFeed()`)
- **Method**: GET
- **Purpose**: Get public hikes from users the current user follows
- **Parameters**:
  - `userId` (path parameter) - current user ID
  - `limit` (query) - max results (default: 50)
  - `offset` (query) - pagination offset (default: 0)
- **Returns**: Array of Hike objects with author information
- **Used By**: FeedFragment, SearchFeedViewModel.loadFeed()

### Get Nearby Hikes
- **Endpoint**: `GET /hikes/nearby`
- **Service**: `FeedService.java` (`getNearbyHikes()`)
- **Method**: GET
- **Purpose**: Get public hikes within a radius from current location
- **Query Parameters**:
  - `lat` (double, required) - user's latitude
  - `lng` (double, required) - user's longitude
  - `radius` (double, optional) - search radius in km (default: 5)
  - `limit` (int, optional) - max results (default: 50)
  - `offset` (int, optional) - pagination offset
- **Returns**: Array of public Hike objects sorted by distance
- **Used By**: NearbyHikesFragment, SearchFeedViewModel.loadNearbyHikes()

### Delete Hike
- **Endpoint**: `DELETE /hikes/{cloudId}`
- **Service**: `SyncService.java` (`deleteHikeFromCloud()`)
- **Method**: DELETE
- **Purpose**: Delete a hike from cloud after local deletion
- **Parameters**:
  - `cloudId` (path parameter) - cloud hike ID
- **Returns**: Success message
- **Used By**: SyncService.syncAllOfflineHikes() (deleted hikes sync)

---

## Observation Endpoints

### Create/Sync Observation
- **Endpoint**: `POST /observations`
- **Service**: `SyncService.java` (`syncObservationToCloud()`)
- **Method**: POST
- **Purpose**: Create/sync an observation with optional image and location data
- **Parameters** (JSON body):
  - `title` (string)
  - `userId` (long)
  - `hikeId` (long)
  - `time` (string)
  - `comments` (string, optional)
  - `status` (string)
  - `lat` (float, optional)
  - `lng` (float, optional)
  - `imageUrl` (string, optional) - Cloudinary URL
- **Returns**: Cloud observation ID
- **Used By**: SyncService.syncObservationToCloud() (called from syncAllOfflineHikes)

### Get Observations for Hike (from cloud)
- **Endpoint**: `GET /observations/hike/{hikeCloudId}`
- **Service**: `SyncService.java` (`fetchObservationsFromCloud()`)
- **Method**: GET
- **Purpose**: Fetch all observations for a specific hike from cloud
- **Parameters**:
  - `hikeCloudId` (path parameter) - cloud hike ID
- **Returns**: Array of Observation objects
- **Used By**: SyncService.syncCloudToOffline()
- **Notes**: Called after inserting each hike during cloud-to-offline sync

---

## Follow/User Endpoints

### Search Users
- **Endpoint**: `GET /search/users`
- **Service**: `FeedService.java` (`searchUsers()`)
- **Method**: GET
- **Purpose**: Search for users by username
- **Query Parameters**:
  - `username` (string, required)
  - `limit` (int) - max results (default: 50)
  - `offset` (int) - pagination offset (default: 0)
- **Returns**: Array of User objects
- **Used By**: SearchUsersFragment, SearchFeedViewModel.searchUsers()

### Follow User
- **Endpoint**: `POST /follows`
- **Service**: `FeedService.java` (`followUser()`)
- **Method**: POST
- **Purpose**: Follow a user
- **Parameters** (JSON body):
  - `followerId` (long) - current user ID
  - `followedId` (long) - user to follow
- **Returns**: Success message
- **Used By**: SearchUsersFragment (follow button), SearchFeedViewModel.followUser()

### Unfollow User
- **Endpoint**: `DELETE /follows`
- **Service**: `FeedService.java` (`unfollowUser()`)
- **Method**: DELETE
- **Purpose**: Unfollow a user
- **Query Parameters**:
  - `followerId` (long) - current user ID
  - `followedId` (long) - user to unfollow
- **Returns**: Success message
- **Used By**: SearchUsersFragment (unfollow button), SearchFeedViewModel.unfollowUser()

### Check Follow Status
- **Endpoint**: `GET /follows/check`
- **Service**: `FeedService.java` (`checkFollowStatus()`)
- **Method**: GET
- **Purpose**: Check if current user is following another user
- **Query Parameters**:
  - `followerId` (long) - current user ID
  - `followedId` (long) - user to check
- **Returns**: Boolean (true/false)
- **Used By**: FeedHikeDetailActivity (to determine follow/unfollow button state)

---

## Endpoint Summary by HTTP Method

### GET Endpoints (Read-only, No Side Effects)
1. **GET /hikes/my** - User's personal hikes from cloud
2. **GET /hikes/user/{userId}/following** - Feed from followed users
3. **GET /hikes/nearby** - Public hikes nearby by location
4. **GET /observations/hike/{hikeCloudId}** - Observations for a hike
5. **GET /search/users** - Search users by username
6. **GET /follows/check** - Check follow status

### POST Endpoints (Create Operations)
1. **POST /auth/signup** - User registration
2. **POST /auth/signin** - User authentication
3. **POST /hikes** - Create/sync hike to cloud
4. **POST /observations** - Create/sync observation
5. **POST /follows** - Follow a user

### PUT Endpoints
- None currently used

### DELETE Endpoints
1. **DELETE /hikes/{cloudId}** - Delete a hike
2. **DELETE /follows** - Unfollow a user

---

## Endpoint Statistics

- **Total Endpoints**: 12
- **GET Endpoints**: 6 (50%)
- **POST Endpoints**: 5 (42%)
- **DELETE Endpoints**: 2 (17%)
- **PUT Endpoints**: 0 (0%)

---

## Authentication

### JWT Token Usage
- **Included in**: Authorization header as `Bearer {token}`
- **Required For**:
  - GET /hikes/my
  - All sync operations (hikes and observations)
- **Optional For**:
  - GET /hikes/user/{userId}/following
  - GET /hikes/nearby
  - GET /observations/hike/{hikeCloudId}
  - GET /search/users
  - POST /follows
  - DELETE /follows

---

## Cloudinary Integration

### Image Upload Service
- **Service**: `CloudinaryHelper.java`
- **Purpose**: Upload observation images to Cloudinary before syncing
- **Direct API Call**: `POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
- **Used In**: `SyncService.syncObservationToCloud()` before posting to `/observations`
- **Note**: Not a backend endpoint, but part of the sync workflow

---

## Sync Workflow (Data Flow)

### Offline to Cloud Sync
1. **Upload Hikes**: POST /hikes (one per offline hike)
2. **Upload Observations**: POST /observations (one per offline observation)
   - Images uploaded to Cloudinary first
   - Image URLs included in observation payload
3. **Delete Hikes**: DELETE /hikes/{cloudId} (for deleted hikes)
4. **Download Hikes**: GET /hikes/my (to get cloud IDs)
5. **Download Observations**: GET /observations/hike/{hikeCloudId} (for each synced hike)

### Cloud to Offline Sync
1. **Fetch User's Hikes**: GET /hikes/my
2. **For Each Hike**:
   - Download Observations: GET /observations/hike/{hikeCloudId}
   - Download Images: HTTP GET to image URLs (if present)
   - Insert locally with local IDs

---

## Notes for Backend Refactoring

### Potentially Redundant Endpoints
- `POST /hikes` used for both `syncHikeToCloud()` and `syncHikeAsync()` - could consolidate to single implementation

### Missing Error Handling Details
- No explicit error codes documented for each endpoint
- Error messages from backend not standardized in logging

### Security Considerations
- `DELETE /follows` uses query parameters instead of path/body parameters
- No documented rate limiting on search or nearby endpoints
- Public hike endpoints don't validate privacy status in all cases

---

## Generated Data (for reference)

**Endpoints by Service Class**:
- **AuthService.java**: 2 endpoints (signup, signin)
- **FeedService.java**: 6 endpoints (search, feed, nearby, follow ops, check follow)
- **SyncService.java**: 4 endpoints (hike CRUD, observations, cloud sync)

**Endpoints by Feature**:
- **Authentication**: 2
- **Hike Management**: 4
- **Observations**: 2
- **Social/Follow**: 3
- **Discovery/Feed**: 2 (includes nearby)

