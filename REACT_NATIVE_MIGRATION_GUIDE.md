# React Native Migration Guide - M-Hike App

## Overview
This document provides complete context for implementing the M-Hike social hiking application in React Native. It details all features built in the Android Java version that need to be ported.

---

## Project Architecture & Technology Stack

### Current Android Implementation (Reference)
- **Language**: Java 11
- **UI Framework**: Android Material Design 3
- **Database**: SQLite via Room ORM v2.6.1
- **State Management**: LiveData + ViewModel
- **Networking**: Retrofit 2.10.0 (prepared, not yet used)
- **Threading**: Background threads with Handler/Looper for UI marshaling

### Target React Native Implementation
- **Framework**: React Native (latest stable)
- **Language**: TypeScript (recommended)
- **State Management**: Redux or Context API (recommend Redux Toolkit)
- **Database**: SQLite (via `react-native-sqlite-storage` or `expo-sqlite`)
- **Networking**: Axios or Fetch API (for future cloud sync)
- **Styling**: React Native Paper (Material Design 3) or StyleSheet
- **Image Handling**: React Native Image Picker + File System
- **Navigation**: React Navigation

---

## Database Schema

### Hike Entity
```typescript
interface Hike {
  id: number;                    // Primary key (auto-increment)
  cloudId: string | null;        // Reference to cloud database
  
  // Core information (Required)
  name: string;                  // Hike name
  location: string;              // Location/area name
  date: string;                  // ISO format: YYYY-MM-DD
  time: string;                  // ISO format: HH:mm
  length: number;                // Distance in kilometers
  difficulty: string;            // "Easy" | "Medium" | "Hard"
  parkingAvailable: boolean;     // Whether parking is available
  
  // Optional fields
  description: string;           // Long description (optional)
  
  // Privacy & Status
  privacy: string;               // "Public" | "Private"
  syncStatus: number;            // 0 = local only, 1 = synced to cloud
  
  // Metadata
  createdAt: number;             // Timestamp in milliseconds
  updatedAt: number;             // Timestamp in milliseconds
  latitude?: number;             // Optional geo-tagging
  longitude?: number;            // Optional geo-tagging
}
```

### Observation Entity
```typescript
interface Observation {
  id: number;                    // Primary key (auto-increment)
  cloudId: string | null;        // Reference to cloud database
  
  // Foreign key
  hikeId: number;                // Reference to parent Hike
  
  // Core information (Required)
  title: string;                 // Observation title
  time: string;                  // ISO format: HH:mm
  
  // Optional fields
  comments: string;              // User comments
  imageUri: string | null;       // Local file path to image
  cloudImageUrl: string | null;  // Cloud URL if synced
  
  // Geo-tagging
  latitude?: number;
  longitude?: number;
  
  // Status & Community
  status: string;                // "Open" | "Verified" | "Disputed"
  confirmations: number;         // Number of confirmations
  disputes: number;              // Number of disputes
  syncStatus: number;            // 0 = local only, 1 = synced to cloud
  
  // Metadata
  createdAt: number;             // Timestamp in milliseconds
  updatedAt: number;             // Timestamp in milliseconds
}
```

### Database Schema Relationships
- **One-to-Many**: One Hike has many Observations
- **Cascade Delete**: Deleting a Hike cascades to delete its Observations
- **Indexing**: hikeId field in observations table should be indexed for performance

---

## Features Implemented (Android)

### 1. Hike Management
- ✅ **Create Hike**: Full form with validation
  - Fields: name, location, date, time, length, difficulty, parking availability, privacy, description
  - Validation: required fields, length must be numeric (float)
  - Date/Time: ISO format (YYYY-MM-DD, HH:mm)
  
- ✅ **View Hike Details**: Display all hike information
  - Shows 14 fields in grid layout (2 columns)
  - Difficulty color-coded: Easy (green), Medium (orange), Hard (red)
  - Description shows "No description provided" if empty
  
- ✅ **Edit Hike**: Modify existing hike
  - All fields editable
  - Updates `updatedAt` timestamp
  - Confirmation dialog before save
  
- ✅ **Delete Hike**: Remove hike with cascade delete
  - Confirmation dialog
  - Cascades deletion to all observations
  - Success message on completion
  
- ✅ **List Hikes**: RecyclerView with all hikes
  - Sorted by date DESC, then time DESC (newest first)
  - Tap to view details
  - Long-press to edit/delete (not yet implemented)

### 2. Advanced Search & Filtering
- ✅ **Search Filter Dialog**: Multi-criteria search
  - Fields: name, location, minimum length, date
  - All criteria optional and can be combined
  - Date picker for date selection
  - Length parsed as float
  
- ✅ **Search Methods** (DAO level):
  - `searchHikesByName(String query)`: LIKE case-insensitive search
  - `searchHikesByLocation(String location)`: LIKE case-insensitive search
  - `searchHikesByDate(String date)`: Exact date match
  - `filterByMinLength(Float minLength)`: >= comparison
  
- ✅ **Multi-criteria Filtering** (ViewModel level):
  - `searchHikesWithFilters()`: Combines all criteria
  - Background thread execution
  - Handler-based main thread marshaling for UI updates
  - Callback pattern for async results
  - Error handling with user messages

### 3. Observation Management
- ✅ **Create Observation**: Dialog-based creation
  - Fields: title, time (HH:mm), comments, image
  - Auto-fills current time (HH:mm format)
  - Image optional
  - Title required validation
  
- ✅ **Edit Observation**: Full observation editing
  - Pre-populates all fields
  - Time can be changed
  - Image can be updated or cleared
  - Updates `updatedAt` timestamp
  
- ✅ **Delete Observation**: Remove observation
  - Confirmation dialog
  - Cascades handled by database FK
  
- ✅ **List Observations**: RecyclerView per hike
  - Displays: title, time, comments (if exists), image (if exists), status badge
  - Status color-coded: Open (blue), Verified (green), Disputed (red)
  - Edit and Delete buttons per observation

### 4. Image Upload & Storage
- ✅ **Image Picker**: "Pick Image" button
  - Opens device gallery/file picker
  - MIME type: image/*
  - Uses ActivityResultLauncher (modern Android approach)
  
- ✅ **Image Storage**: Local file system
  - Saved to app cache directory: `/data/data/com.example.mhike/cache/`
  - Filename: `observation_<timestamp>.jpg`
  - JPEG compression at 85% quality
  - Survives app updates, cleared on cache clear
  
- ✅ **Image Display**: ObservationAdapter
  - Loads image from local file path via BitmapFactory
  - Displays at 200dp height with CENTER_CROP scaling
  - Gracefully handles missing/deleted files
  - Shows gray placeholder background when no image
  
- ✅ **Image Preview**: Dialog preview
  - Shows image preview when selected
  - "Clear Image" button to remove selection
  - Preview updates immediately on selection

### 5. User Interface
- ✅ **Material Design 3**: Consistent styling throughout
  - Primary color: Green (#2E7D32)
  - Secondary: Brown (#8D6E63)
  - Tertiary: Orange (#FF6F00)
  - Dark grays for text (#424242, #616161, etc.)
  
- ✅ **Material Components Used**:
  - MaterialButton (outlined, filled, text variants)
  - MaterialTextView
  - TextInputLayout with helper text
  - MaterialCardView
  - GridLayout for 2-column hike details
  
- ✅ **Navigation**:
  - MainActivity: Hike list + search menu
  - HikeDetailActivity: Full hike details + observations
  - AddHikeActivity: Create/edit hike form
  - Back navigation support
  
- ✅ **Empty States**:
  - Empty observation layout when no observations
  - Appropriate messages for users

### 6. Data Validation
- ✅ **Hike Creation**:
  - Name: required, non-empty
  - Location: required, non-empty
  - Date: required, YYYY-MM-DD format
  - Time: required, HH:mm format
  - Length: required, must be numeric float > 0
  - Difficulty: required, dropdown selection
  
- ✅ **Observation Creation**:
  - Title: required, non-empty
  - Time: optional, validated HH:mm format
  - Comments: optional, any text
  - Image: optional
  
- ✅ **Search Filtering**:
  - Length field: validated as float
  - All other fields: trimmed and validated
  - Empty values treated as "no filter"

### 7. Error Handling & User Feedback
- ✅ **Success Messages**:
  - "Hike saved successfully"
  - "Hike updated successfully"
  - "Observation saved"
  - Displayed via Snackbar (bottom toast)
  
- ✅ **Error Messages**:
  - Database operation failures
  - File I/O errors
  - Validation errors
  - Network errors (prepared for future)
  
- ✅ **Threading Safety**:
  - Background threads for database operations
  - Handler.post(Looper.getMainLooper()) for UI updates
  - No main thread blocking

### 8. Persistence & Database
- ✅ **SQLite Storage**: Room ORM
  - Database version 2 (with migrations support)
  - Supports `fallbackToDestructiveMigration()` for development
  - Foreign key constraints enabled
  - Cascade delete on observation-hike relationship
  
- ✅ **Query Performance**:
  - Indexed hikeId foreign key column
  - Ordered queries (date DESC, time DESC)
  - LIKE queries case-insensitive with LOWER()
  
- ✅ **Data Sync Preparation**:
  - `cloudId` field for cloud database references
  - `syncStatus` field (0 = local only, 1 = synced)
  - `cloudImageUrl` for synced images
  - Timestamps for sync logic (createdAt, updatedAt)

---

## Code Patterns & Architecture

### MVVM Pattern (Android)
```
View (Activities/Fragments)
    ↓ (observes)
ViewModel (LiveData)
    ↓ (uses)
Repository/DAO (Database)
    ↓ (persists)
SQLite Database
```

### Search Flow (Threading & Callbacks)
```
MainActivity.showSearchFilterDialog()
    ↓ (user enters criteria)
ViewModel.searchHikesWithFilters(callback)
    ↓ (starts background thread)
Background Thread: Query DAO with multiple criteria
    ↓ (marshals result to main thread)
Handler.post(Looper.getMainLooper()) { callback.onFilterComplete(results) }
    ↓
MainActivity callback updates UI (safe on main thread)
```

### Image Handling Flow
```
User taps "Pick Image"
    ↓
ImagePickerLauncher.launch("image/*")
    ↓
System gallery opens
    ↓
User selects image (Uri returned)
    ↓
Callback stores Uri, updates preview
    ↓
On save: saveImageToCache(Uri)
    ↓
Read bitmap from Uri → Compress JPEG → Save to cache dir
    ↓
Store filename in Observation.imageUri
```

---

## Permissions Required

### Android Manifest Permissions
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Runtime Permissions (React Native)
Implement runtime permission requests for:
- `READ_EXTERNAL_STORAGE` / `PHOTO_LIBRARY` (image picker)
- `WRITE_EXTERNAL_STORAGE` (image storage on Android)
- `LOCATION` (optional, for future geo-tagging)
- `INTERNET` (for future cloud sync)

---

## File Structure Mapping

### Android Structure → React Native Structure
```
Android Structure:
- HikeDetailActivity.java → HikeDetailScreen.tsx
- AddHikeActivity.java → AddHikeScreen.tsx (AddHikeActivity)
- MainActivity.java → HomeScreen.tsx
- HikeViewModel.java → Redux/Context store
- HikeDao.java → SQLite service layer
- Hike.java → TypeScript interface
- Observation.java → TypeScript interface
- ObservationAdapter.java → ObservationList.tsx component

Database:
- Room Database → SQLite (expo-sqlite or react-native-sqlite-storage)
- AppDatabase.java → database initialization/setup file
```

---

## Implementation Checklist for React Native

### Phase 1: Foundation
- [ ] Set up React Native project with TypeScript
- [ ] Configure React Navigation for tab/stack navigation
- [ ] Set up SQLite database with schema
- [ ] Create data models (Hike, Observation interfaces)
- [ ] Create Redux store or Context for state management
- [ ] Implement database service layer (CRUD operations)

### Phase 2: Core Features
- [ ] Home Screen (Hike list)
- [ ] Hike Details Screen (view hike + observations)
- [ ] Add Hike Screen (create form)
- [ ] Edit Hike Screen (modify form)
- [ ] Delete Hike functionality
- [ ] Observation list component
- [ ] Add Observation dialog

### Phase 3: Advanced Features
- [ ] Edit Observation functionality
- [ ] Delete Observation functionality
- [ ] Image upload with file picker
- [ ] Image display in observations
- [ ] Search filter dialog
- [ ] Multi-criteria search/filtering

### Phase 4: Polish
- [ ] Material Design 3 styling throughout
- [ ] Error handling & user feedback (toasts/snackbars)
- [ ] Input validation
- [ ] Loading states
- [ ] Empty states
- [ ] Permissions handling

### Phase 5: Future
- [ ] Cloud sync (Retrofit/Axios to backend)
- [ ] Observation verification/disputes UI
- [ ] Leaderboard screen
- [ ] Discovery feed
- [ ] User authentication
- [ ] Follow system

---

## Key Technical Decisions to Make

1. **State Management**: Redux Toolkit vs Context API + useReducer
   - Recommendation: Redux Toolkit for scalability given feature scope

2. **Database Library**: expo-sqlite vs react-native-sqlite-storage
   - Recommendation: expo-sqlite if using Expo, react-native-sqlite-storage for bare React Native

3. **Image Picker**: react-native-image-picker vs react-native-image-crop-picker
   - Recommendation: react-native-image-picker (simpler, fewer dependencies)

4. **UI Library**: React Native Paper vs NativeBase vs custom styling
   - Recommendation: React Native Paper (direct Material Design 3 implementation)

5. **Navigation**: React Navigation v6 with TypeScript
   - Recommendation: Tab navigator (HomeScreen, ProfileScreen) + Stack navigators for detail screens

6. **Async Operations**: Redux Thunk vs Redux Saga vs RTK Query
   - Recommendation: Redux Thunk (built into Redux Toolkit, adequate complexity)

---

## Important Implementation Notes

### Time Format
- **Hike Time**: HH:mm format (e.g., "14:30")
- **Observation Time**: HH:mm format (e.g., "14:45")
- **Dates**: YYYY-MM-DD format (e.g., "2025-12-04")
- Implement formatters: `formatDate()`, `formatTime()`, `getCurrentTime()`

### Image Storage
- Store full file paths in database, not just filenames
- Use platform-specific cache directory:
  - Android: `getCacheDir()` → `/data/data/.../cache/`
  - iOS: `NSTemporaryDirectory()` or Documents folder
- Consider cleanup of orphaned images when observations deleted
- JPEG compression at 85% quality for balance of quality/size

### Search Logic
- All searches are case-insensitive (use LOWER() or toLowerCase())
- Length filter is ">=" comparison (minimum length)
- Date filter is exact match
- Multiple filters are combined with AND logic (all must match)
- All filters optional (empty = no constraint)

### Status Badges
- **Open**: Blue (#1976D2)
- **Verified**: Green (#388E3C)
- **Disputed**: Red (#D32F2F)
- Default for new observations: "Open"

### Difficulty Colors
- **Easy**: Green (#2E7D32)
- **Medium**: Orange (#FF6F00)
- **Hard**: Red (#C62828)

### Validation Rules
- **Name**: 1-200 characters, required
- **Location**: 1-200 characters, required
- **Date**: Valid YYYY-MM-DD, required
- **Time**: Valid HH:mm (00:00-23:59), required for hikes
- **Length**: > 0, float (e.g., 5.5), required
- **Difficulty**: "Easy", "Medium", or "Hard", required
- **Description**: 0-2000 characters, optional
- **Title (Observation)**: 1-200 characters, required
- **Comments**: 0-2000 characters, optional

---

## Testing Considerations

### Unit Tests
- Database operations (insert, update, delete, query)
- Search/filter logic
- Data validation functions
- Image processing functions

### Integration Tests
- Navigation flows
- Full CRUD cycles (create → read → update → delete)
- Search with various filter combinations
- Image upload and display

### UI/E2E Tests
- Form submission flows
- Error message display
- Empty state handling
- Image selection and preview

---

## Performance Optimization Tips

1. **Database Queries**:
   - Use pagination for large hike lists
   - Index frequently queried columns (hikeId, date)
   - Use LiveData/subscriptions for reactive updates

2. **Image Handling**:
   - Don't load full resolution images for previews
   - Cache decoded bitmaps
   - Clear cache periodically

3. **List Rendering**:
   - Implement FlatList with removeClippedSubviews
   - Use React.memo for list items
   - Implement virtualization for large lists

4. **State Management**:
   - Keep Redux state normalized
   - Use selectors for derived data
   - Debounce search inputs

---

## Future Features (Not in Current Scope)

- Cloud synchronization with backend API
- User authentication & profiles
- Observation verification system
- Community comments & ratings
- Leaderboard & achievements
- Photo gallery per hike
- Map integration with hike routes
- Weather integration
- Offline mode with sync queue

---

## Success Criteria

✅ All features from Android version replicated in React Native
✅ UI visually matches Material Design 3 specification
✅ Database persistence working correctly
✅ Search/filtering fully functional with all criteria
✅ Image upload, storage, and display working end-to-end
✅ All validation rules enforced
✅ Error handling with user-friendly messages
✅ No main thread blocking, smooth animations
✅ Code organized in clean component structure
✅ TypeScript types used throughout for safety

---

## References & Dependencies

### Core Dependencies
```json
{
  "react-native": "^0.73.0",
  "react-navigation": "^6.1.0",
  "react-navigation-bottom-tabs": "^6.5.0",
  "react-navigation-stack": "^5.14.0",
  "@react-navigation/native": "^6.1.0",
  "react-native-paper": "^5.11.0",
  "react-redux": "^8.1.3",
  "@reduxjs/toolkit": "^1.9.5",
  "redux": "^4.2.1",
  "redux-thunk": "^2.4.2",
  "react-native-image-picker": "^7.0.0",
  "expo-sqlite": "^11.3.0",
  "typescript": "^5.2.0"
}
```

### File System & Media
- `react-native-fs` or `expo-file-system` for file operations
- `react-native-image-picker` for image selection

### Database
- `expo-sqlite` (if using Expo) or `react-native-sqlite-storage` (bare RN)

### Notifications/Feedback
- Toast library: `react-native-toast-message` or similar

---

**Document Version**: 1.0
**Last Updated**: December 4, 2025
**Status**: Complete Android Implementation - Ready for React Native Migration
