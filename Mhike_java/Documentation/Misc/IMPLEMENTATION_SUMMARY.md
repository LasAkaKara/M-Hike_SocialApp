# M-Hike Java Implementation Summary

## Overview
This document summarizes all features implemented in the M-Hike Android application (Java), built with MVVM architecture, Room ORM, and Material Design 3.

---

## 1. Cloud-to-Offline Sync with Deduplication

### Approach
- **Bidirectional sync**: Downloads hikes from the backend when app is online
- **Cloud ID mapping**: Each local hike has a `cloudId` field to identify which remote hike it corresponds to
- **Soft delete tracking**: Hikes marked with `isDeleted` flag to maintain sync integrity
- **Threading safety**: All background operations marshaled to main thread via `Handler(Looper.getMainLooper()).post()`

### Implementation Details
- **SyncService.java**: Core sync engine that orchestrates downloads
- **Database schema v3**: Added `cloudId`, `isDeleted`, and timestamp fields
- **Deduplication logic**: Checks if hike already exists by cloudId before inserting
- **Handler-based threading**: Prevents `ViewRootImpl$CalledFromWrongThreadException`

### Key Code Pattern
```java
// Callback marshaling pattern used throughout
handler.post(() -> {
    // Update UI safely on main thread
    viewModel.updateHikes(hikes);
});
```

---

## 2. User Search with Debounced TextWatcher

### Approach
- **500ms debounce delay**: Prevents excessive API calls while user types
- **Handler-based scheduling**: Cancels previous pending searches before scheduling new ones
- **Real-time updates**: LiveData observers update RecyclerView as results arrive
- **Case-insensitive matching**: Backend ILIKE query for flexible searching

### Implementation Details
- **SearchUsersFragment.java**: Fragment with TextWatcher debounce logic
- **Handler debounce pattern**: `Handler.postDelayed()` with `removeCallbacks()` cancellation
- **FeedService.java**: API layer for user search endpoint
- **SearchFeedViewModel.java**: ViewModel coordinating search operations

### Key Code Pattern
```java
searchInput.addTextChangedListener(new TextWatcher() {
    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {
        // Cancel previous search
        if (searchRunnable != null) {
            searchHandler.removeCallbacks(searchRunnable);
        }
        // Schedule new search with delay
        searchRunnable = () -> performSearch();
        searchHandler.postDelayed(searchRunnable, SEARCH_DELAY_MS);
    }
});
```

---

## 3. User Follow/Unfollow with Status Tracking

### Approach
- **Bidirectional follow tracking**: Backend maintains `follows` table with followerId and followedId
- **Dynamic count calculation**: Query-time aggregation instead of static table columns
- **Serialization mapping**: `@SerializedName` annotations handle JSON field name mismatches
- **Integer casting in SQL**: Explicit `CAST(followerCount AS INTEGER)` to ensure proper JSON serialization

### Implementation Details
- **FeedService.java**: Methods for follow/unfollow API calls
- **SearchFeedViewModel.java**: Manages follow state and user status
- **UserAdapter.java**: Displays follower counts with proper binding
- **User.java model**: Uses `@SerializedName` for lowercase JSON field mapping

### Bug Fixes Applied
1. **Follower count showing 0**: Fixed by adding `@SerializedName("followercount")` to User model
2. **Following count showing 0**: Backend query was reading static table columns instead of counting follows table
3. **Hike/distance showing 0**: Fixed by adding `CAST()` to ensure numeric types in SQL response

### Key Code Pattern
```java
@SerializedName("followercount")
public int followerCount = 0;

@SerializedName("followingcount")
public int followingCount = 0;
```

---

## 4. Community Feed with Public Hikes

### Approach
- **Real-time feed**: Fetches public hikes from followed users via `GET /hikes/user/:userId/following`
- **Pull-to-refresh**: SwipeRefreshLayout for manual feed refresh
- **Author information display**: Shows user avatar, name, and relative timestamps
- **Empty state handling**: Displays helpful message when no hikes in feed

### Implementation Details
- **FeedFragment.java**: Main feed display fragment with SwipeRefreshLayout
- **FeedHikeAdapter.java**: Custom adapter for feed hike items with author info
- **item_feed_hike.xml**: Layout showing hike name, location, length, difficulty with author card
- **SearchFeedViewModel.java**: Coordinates feed loading via FeedService

### Key Features
- **Relative timestamps**: Converts millisecond timestamps to "5 minutes ago" format
- **Author click handling**: Separate callback for viewing author profile (TODO)
- **Hike click handling**: Launches detail view with full hike information

---

## 5. Feed Hike Detail View

### Approach
- **Data passing via Intent extras**: Avoids database queries by passing hike data through Intent
- **Read-only interface**: Hides edit/add observation buttons for feed hikes
- **Reusable layout**: Uses same `activity_hike_detail.xml` as offline hikes
- **Observation display**: Shows all related observations with author info

### Implementation Details
- **FeedHikeDetailActivity.java**: New activity for viewing feed hikes
- **Intent extras pattern**: FeedFragment passes all hike data to avoid DB lookups
- **Observation loading**: Fetches from local database by hike ID
- **UI state management**: Hidden "Add Observation" button for read-only experience

### Data Flow
```
FeedFragment (onHikeClick)
  → Intent with hike extras
  → FeedHikeDetailActivity
  → displayHikeFromExtras() for quick UI update
  → loadObservations() from local DB
  → Display observations in RecyclerView
```

---

## 6. Material Design 3 UI Components

### Approach
- **Consistent theming**: Primary, secondary, and tertiary color palette
- **Component library**: Using Material Design 3 widgets throughout
- **Responsive layouts**: ConstraintLayout and GridLayout for flexible designs
- **Typography hierarchy**: Material text styles for headers, body, and captions

### Implementation Details
- **MaterialButton**: Follow buttons with outline style
- **MaterialTextView**: Consistent text rendering with Material typography
- **ShapeableImageView**: Circular avatars with proper shape appearance
- **RecyclerView**: Efficient list rendering with LinearLayoutManager
- **SwipeRefreshLayout**: Pull-to-refresh pattern for feed updates
- **CircularProgressIndicator**: Loading state indicator during API calls

### Color System
- **difficulty_easy**: Green for easy trails
- **difficulty_medium**: Yellow for medium trails
- **difficulty_hard**: Red for hard trails
- **primary/secondary**: Brand colors from theme

---

## 7. MVVM Architecture with LiveData

### Approach
- **ViewModels**: Separate ViewModels for different feature sets (HikeViewModel, SearchFeedViewModel)
- **LiveData**: Observable data holders with lifecycle awareness
- **Coroutines/Callbacks**: Async operations with proper main thread marshaling
- **Repository pattern**: Services layer (FeedService) abstracts API calls

### Implementation Details
- **SearchFeedViewModel.java**: Coordinates search, feed, and follow operations
- **HikeViewModel.java**: Manages offline hike CRUD and observations
- **Observers pattern**: Fragments observe ViewModel LiveData for state changes
- **Lifecycle-aware**: Observers automatically cleaned up when fragment destroyed

### Key Architecture Pattern
```
Fragment (UI)
  ↓
ViewModel (State Management)
  ↓
Service (Business Logic)
  ↓
API/Database (Data Layer)
```

---

## 8. JSON Serialization with Gson and Type Mapping

### Approach
- **Custom serialization**: `@SerializedName` annotations handle JSON ↔ Java field mapping
- **Type safety**: Explicit type conversions in SQL to ensure correct JSON types
- **Null handling**: `@Nullable` and default values for optional fields
- **Case sensitivity**: Backend returns lowercase field names, mapped to camelCase Java fields

### Implementation Details
- **Gson configuration**: Default Gson instance in FeedService with no custom configurations needed
- **Annotation usage**: Every API-mapped field has `@SerializedName` matching JSON key
- **SQL casting**: `CAST()` operations ensure numeric fields serialize as JSON numbers, not strings

### Fixed Issues
1. **String vs Integer mismatch**: `"hikecount":"0"` → `CAST(COUNT(h.id) AS INTEGER) as hikeCount`
2. **Field name case**: `avatarurl` → `@SerializedName("avatarurl")`
3. **Null safety**: `COALESCE()` in SQL prevents null JSON values

---

## 9. Search API Response Data Type Corrections

### Approach
- **Backend SQL fixes**: Properly cast aggregate functions and counts to INTEGER type
- **Dynamic count aggregation**: Calculate follower/following counts at query time from `follows` table
- **Type-safe serialization**: Ensure all numeric fields serialize as JSON numbers

### Implementation Details
- **searchUsers endpoint**: Fixed to calculate dynamic follower/following counts
  - Before: Selected static `u.followerCount` → Always 0
  - After: `COALESCE((SELECT COUNT(*) FROM follows WHERE followedId = u.id), 0)`
  
- **hikeCount casting**: `CAST(COUNT(h.id) AS INTEGER) as hikeCount`
  - Before: Returned as string `"0"`
  - After: Returns as number `0`

- **totalDistance calculation**: `COALESCE(SUM(h.length), 0)`
  - Properly sums public hike lengths

### Code Changes
```javascript
// Before (searchService.js searchUsers method)
SELECT u.id, u.username, u.followerCount, u.followingCount,
       COUNT(h.id) as hikeCount, ...

// After (dynamic + proper casting)
SELECT u.id, u.username,
       COALESCE((SELECT COUNT(*) FROM follows WHERE followedId = u.id), 0) as followerCount,
       COALESCE((SELECT COUNT(*) FROM follows WHERE followerId = u.id), 0) as followingCount,
       CAST(COUNT(h.id) AS INTEGER) as hikeCount, ...
```

---

## 10. Adapter Enhancements for Data Display

### Approach
- **UserAdapter**: Displays user cards with follower count, following count, hike stats
- **FeedHikeAdapter**: Shows feed hikes with author info, timestamps, and statistics
- **ObservationAdapter**: Displays observations with edit/delete actions
- **Callback interfaces**: Separate listener patterns for different user interactions

### Implementation Details
- **UserAdapter.java**
  - Displays: Avatar, username, bio, hikes, distance, followers
  - Click listeners: User card click, follow button click
  - `setFollowStatus()` method for button state management

- **FeedHikeAdapter.java**
  - Displays: Author avatar/name, hike name, location, length, difficulty, description
  - Callbacks: `onHikeClick()` for detail view, `onAuthorClick()` for profile (TODO)
  - Timestamp formatting: Human-readable "X minutes ago" format

- **Data binding**: Each adapter item properly displays all available fields from models

---

## 11. Error Handling and User Feedback

### Approach
- **Snackbar messages**: Brief, dismissible notifications for user actions
- **LiveData error state**: ViewModel exposes error messages to fragments
- **Logging strategy**: Comprehensive D/DEBUG logs at API, parsing, and UI layers
- **Empty state handling**: User-friendly messages when no data available

### Implementation Details
- **FeedService logging**: API request URLs, response bodies, parsing results
- **Fragment logging**: LiveData observer updates, user interactions
- **Error messages**: "No users found", "No hikes in your feed", etc.
- **Toast notifications**: Fallback for critical errors

### Key Logging Points
```
=== Search Users === (request initiated)
URL: https://...
Search response: [...]
Parsed user: username followers=X
Total users found: X

=== Get Feed === (feed request)
Feed hikes updated: X
Hike X: name by author
```

---

## 12. Database Schema and Room ORM

### Approach
- **Entity definitions**: Clear, well-documented data models
- **Room migrations**: Schema versioning for backward compatibility
- **Relationships**: @Ignore fields for non-persisted computed values
- **Timestamps**: `createdAt`, `updatedAt` for sync tracking

### Implementation Details
- **User.java**: User profile with follower/following/hike counts
  - Fields: id, username, avatarUrl, bio, region, followerCount, followingCount, hikeCount, totalDistance
  - Serialization: @SerializedName for JSON field mapping

- **Hike.java**: Hiking activity record with sync fields
  - Fields: id, cloudId, name, location, date, time, length, difficulty, privacy, description, parkingAvailable
  - @Ignore: userName, userAvatarUrl (for display only)
  - Sync: syncStatus, isDeleted for cloud synchronization

- **Observation.java**: Wildlife/environmental observations on hikes
  - Fields: id, hikeId, title, comments, time, imageUri, latitude, longitude
  - Location tracking: GPS coordinates for each observation

- **Follow.java**: User relationship tracking
  - Fields: followerId, followedId (composite primary key)
  - Used for: Feed generation, follower count calculations

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Language** | Java | 11+ |
| **Architecture** | MVVM | - |
| **Database** | Room ORM | 2.5+ |
| **UI Framework** | Material Design 3 | 1.9+ |
| **HTTP Client** | OkHttp3 | 4.9+ |
| **JSON** | Gson | 2.8+ |
| **Image Loading** | Glide | 4.13+ |
| **Async** | Callbacks + Handler | Android Framework |
| **Build** | Gradle | 8.0+ |

---

## Testing & Validation

### Verified Functionality
- ✅ User search with debouncing (500ms delay)
- ✅ Follow/unfollow operations
- ✅ Follower count accuracy (dynamic calculation)
- ✅ Hike count and distance calculations
- ✅ Feed hike display from followed users
- ✅ Feed hike detail view with observations
- ✅ Pull-to-refresh feed updates
- ✅ Threading safety (no UI crashes)
- ✅ Fragment lifecycle management
- ✅ JSON serialization/deserialization

### Known Limitations
- Author profile view (TODO)
- Observation comments on feed hikes (read-only)
- Offline observation creation (synced at next login)

---

## Development Workflow

### Key Decisions Made
1. **Intent extras over DB queries**: Faster UI response in detail views
2. **Server-side calculation**: Follower counts calculated at query time vs. stored
3. **Handler debouncing**: Simple, effective solution for search throttling
4. **Soft deletes**: Maintains sync integrity without permanent deletions
5. **Serialization mapping**: Handles backend JSON naming conventions

### Common Patterns Used
- **Debouncing**: `Handler.postDelayed()` + `removeCallbacks()`
- **Threading**: `Handler(Looper.getMainLooper()).post()` for main thread safety
- **Observing**: `LiveData.observe(getViewLifecycleOwner(), ...)`
- **Async callbacks**: Service layer with interface callbacks

---

## Future Enhancements

1. **User Profile View**: Navigate to user profile from search/feed author
2. **Comments on Observations**: Allow discussion on observations from feed
3. **Offline Persistence**: Cache feed hikes for offline browsing
4. **Pagination**: Load more items on scroll (currently loads all)
5. **Search Filters**: Filter by region, difficulty, date range
6. **Notifications**: Real-time follow notifications
7. **Image Caching**: Better image loading strategy with caching
8. **Search History**: Remember recent searches for quick access

---

## Conclusion

This implementation provides a complete social networking feature set for the M-Hike application, with proper separation of concerns, thread-safe operations, and user-friendly interfaces. The architecture is scalable and maintainable, with clear patterns for adding new features.
