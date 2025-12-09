# M-Hike Android (Java) - Social Hiking App

A native Android application for hiking tracking with local SQLite persistence and cloud synchronization. Features include hike management, observations, social networking, and real-time cloud sync.

## 📱 Status

**Production Ready** - All core features implemented with full cloud integration.

| Task | Feature | Status |
|------|---------|--------|
| A | Hike Entry & Management | ✅ Complete |
| B | CRUD + Local Persistence | ✅ Complete |
| C | Observations | ✅ Complete |
| D | Cloud Sync & Auth | ✅ Complete |
| E | Discovery & Feed | ✅ Complete |
| F | Social Features | ✅ Complete |
| G | Geo-Location Features | ✅ Complete |

## 🚀 Quick Start

### Prerequisites
- Android Studio 2024.1+
- Android SDK API 30+
- Java 11+
- Backend server running on localhost:5000 or configured endpoint

### Installation
```bash
# Clone repository
git clone <repo-url>
cd Mhike_java

# Open in Android Studio
open -a "Android Studio" .

# Build APK
./gradlew build

# Install to device/emulator
./gradlew installDebug

# Run
./gradlew run
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 📋 Features

### ✅ Hike Management
- **Create**: Add hikes with form validation
  - Required: Name, Location, Date, Time, Length, Difficulty
  - Optional: Description, Parking availability, Privacy level
- **Read**: Display hikes in list with search and filtering
- **Update**: Edit existing hikes with pre-filled data
- **Delete**: Remove hikes with confirmation dialog
- **Search**: Filter hikes by name and properties
- **Geo-Tagging**: Store and display hike coordinates

### ✅ Observations
- **Create**: Add timestamped observations to hikes
- **Images**: Capture or upload photos with observations
- **Status**: Track observation status (Open, Verified, Disputed)
- **Verification**: Community confirmations and dispute counts
- **Listing**: View all observations for a hike
- **Sync**: Images uploaded to Cloudinary during cloud sync

### ✅ Cloud Synchronization
- **Bidirectional Sync**: Upload local data, download from cloud
- **Authentication**: JWT-based user authentication
- **Image Sync**: Automatic image upload to Cloudinary
- **Offline Support**: Continue using app offline, sync when online
- **Conflict Resolution**: Latest timestamp wins
- **Status Tracking**: Monitor sync status of each item

### ✅ Social Features
- **Follow Users**: Follow other hikers to see their activity
- **Search Users**: Find hikers by username
- **Feed**: View hikes from followed users
- **Unfollow**: Stop following users
- **User Profiles**: View user information and statistics

### ✅ Discovery
- **Nearby Hikes**: Find hikes within specified radius (PostGIS)
- **Location-Based**: Use device GPS for geo-queries
- **Search**: Advanced user search functionality
- **Browse**: Discover new hiking trails and communities

## 🏗️ Architecture

### MVVM Pattern
- **Model**: Room database entities
- **View**: Activities and Fragments with Material Design 3
- **ViewModel**: State management with LiveData

### Data Flow
```
Local SQLite ←→ ViewModel ←→ Repository ←→ Retrofit REST ←→ Express.js API
                  (LiveData)               (Network)
                     ↓
                 UI Fragments
```

### Tech Stack
- **Database**: Room ORM with SQLite
- **Networking**: Retrofit 2 with OkHttp
- **Authentication**: JWT tokens stored in SharedPreferences
- **Image Upload**: Cloudinary integration
- **Background Tasks**: Coroutines + WorkManager
- **UI Framework**: Material Design 3
- **State Management**: LiveData + ViewModel

## 📁 Project Structure

```
app/src/main/
├── java/com/example/mhike/
│   ├── activities/
│   │   ├── MainActivity.java          # Main hike list
│   │   ├── AddHikeActivity.java       # Create/edit hike form
│   │   ├── HikeDetailActivity.java    # View hike details
│   │   ├── LoginActivity.java         # User authentication
│   │   ├── ProfileActivity.java       # User profile & settings
│   │   └── SearchActivity.java        # Search hikes & users
│   │
│   ├── fragments/
│   │   ├── HomeFragment.java          # Hike list tab
│   │   ├── FeedFragment.java          # Feed from followed users
│   │   ├── DiscoveryFragment.java     # Nearby hikes & search
│   │   ├── ProfileFragment.java       # User profile
│   │   └── ObservationFragment.java   # Observation list
│   │
│   ├── viewmodels/
│   │   ├── HikeViewModel.java         # Hike operations
│   │   ├── AuthViewModel.java         # Authentication
│   │   ├── SearchFeedViewModel.java   # Search & discovery
│   │   └── UserViewModel.java         # User management
│   │
│   ├── database/
│   │   ├── AppDatabase.java           # Room database
│   │   ├── daos/
│   │   │   ├── HikeDao.java
│   │   │   ├── ObservationDao.java
│   │   │   └── UserDao.java
│   │   └── entities/
│   │       ├── HikeEntity.java
│   │       ├── ObservationEntity.java
│   │       └── UserEntity.java
│   │
│   ├── api/
│   │   ├── RetrofitClient.java        # Retrofit setup
│   │   └── ApiService.java            # API endpoints
│   │
│   ├── repository/
│   │   ├── HikeRepository.java        # Hike operations
│   │   ├── AuthRepository.java        # Auth operations
│   │   └── SyncRepository.java        # Cloud sync
│   │
│   ├── adapters/
│   │   ├── HikeAdapter.java           # Hike list adapter
│   │   ├── ObservationAdapter.java    # Observation list
│   │   └── SearchResultAdapter.java   # Search results
│   │
│   ├── services/
│   │   ├── SyncService.java           # Cloud sync engine
│   │   ├── AuthService.java           # Auth logic
│   │   └── LocationService.java       # GPS handling
│   │
│   ├── utils/
│   │   ├── CloudinaryHelper.java      # Image upload
│   │   ├── SharedPreferencesManager.java  # Local storage
│   │   └── Constants.java             # App constants
│   │
│   └── callbacks/
│       └── SyncCallback.java          # Sync listeners
│
└── res/
    ├── layout/
    │   ├── activity_*.xml             # Activity layouts
    │   ├── fragment_*.xml             # Fragment layouts
    │   └── item_*.xml                 # List item layouts
    │
    ├── values/
    │   ├── colors.xml                 # Color palette
    │   ├── strings.xml                # String resources
    │   ├── themes.xml                 # Material Design 3 theme
    │   └── dimens.xml                 # Dimension resources
    │
    ├── menu/
    │   └── menu_*.xml                 # Menu definitions
    │
    └── drawable/
        └── ic_*.xml                   # Vector drawables
```

## 🎨 UI/UX Design

### Material Design 3 Color Palette
- **Primary**: #2E7D32 (Green - hiking/nature theme)
- **Secondary**: #8D6E63 (Brown - earth tones)
- **Tertiary**: #FF6F00 (Orange - accents)
- **Error**: #D32F2F (Red - delete/danger)
- **Success**: #388E3C (Green - verified)

### Screens

**1. Login Screen**
- Username/email input
- Password input
- Signup link
- JWT token storage

**2. Home Tab (Hike List)**
- Hike cards with name, location, length
- Search bar for filtering
- FAB to add new hike
- Swipe-to-delete gesture
- Last updated timestamp

**3. Add/Edit Hike**
- Form validation in real-time
- Date and time pickers
- Difficulty dropdown
- Parking availability toggle
- Privacy selector
- Submit and cancel buttons

**4. Hike Details**
- Full hike information
- Hike metadata (date, time, length, difficulty)
- Observations section
- Add observation button
- Edit/delete hike options
- Share functionality

**5. Observations**
- Observation list with images
- Title and comments
- Timestamp display
- Status badge (Open/Verified/Disputed)
- Confirmation and dispute counts
- Delete option

**6. Feed Tab**
- Hikes from followed users
- User information with hike
- Add/remove from feed
- Time-based sorting

**7. Discovery Tab**
- Three sub-tabs:
  - **Nearby Hikes**: GPS-based hike discovery
  - **Search Users**: Find and follow users
  - **Feed**: Personalized feed

**8. Profile Screen**
- User information and avatar
- Statistics (hikes, followers, following)
- Follow/unfollow button
- Settings menu
- Logout button

## 📊 Database Schema

### Hikes Table
```sql
id                  | INTEGER PRIMARY KEY
cloudId             | INTEGER (reference to cloud database)
name                | TEXT NOT NULL
location            | TEXT
date                | TEXT (YYYY-MM-DD)
time                | TEXT (HH:mm)
length              | REAL
difficulty          | TEXT (Easy/Medium/Hard)
parkingAvailable    | BOOLEAN
description         | TEXT
privacy             | TEXT (Public/Private)
syncStatus          | INTEGER (0=local, 1=synced)
latitude            | REAL
longitude           | REAL
createdAt           | INTEGER (unix timestamp ms)
updatedAt           | INTEGER (unix timestamp ms)
```

### Observations Table
```sql
id                  | INTEGER PRIMARY KEY
cloudId             | INTEGER
hikeId              | INTEGER FOREIGN KEY
userId              | INTEGER
title               | TEXT NOT NULL
time                | TEXT (HH:mm)
comments            | TEXT
imageUri            | TEXT (local path)
cloudImageUrl       | TEXT (Cloudinary URL)
latitude            | REAL
longitude           | REAL
status              | TEXT (Open/Verified/Disputed)
confirmations       | INTEGER
disputes            | INTEGER
syncStatus          | INTEGER (0=local, 1=synced)
createdAt           | INTEGER
updatedAt           | INTEGER
```

### Users Table
```sql
id                  | INTEGER PRIMARY KEY
cloudId             | INTEGER
username            | TEXT UNIQUE NOT NULL
email               | TEXT UNIQUE
avatarUrl           | TEXT
bio                 | TEXT
region              | TEXT
followerCount       | INTEGER
followingCount      | INTEGER
createdAt           | INTEGER
updatedAt           | INTEGER
```

## 🔐 Authentication Flow

1. **Signup**: User provides username, email, password
   - POST `/api/auth/signup`
   - Backend creates user and returns JWT token

2. **Login**: User provides credentials
   - POST `/api/auth/signin`
   - Backend verifies and returns JWT token

3. **Token Storage**: Token stored in SharedPreferences
   - Used in Authorization header for all requests
   - Auto-refreshed on 401 Unauthorized

4. **Logout**: Clear token and local data
   - Removes JWT from storage
   - Clears user session

## 🔄 Cloud Sync Process

### Upload (Local → Cloud)
1. User creates/edits hike locally
2. App detects change and queues sync
3. SyncService batches pending items
4. Images uploaded to Cloudinary
5. Hikes/observations sent to backend
6. Server stores with user ID
7. Local syncStatus updated to 1

### Download (Cloud → Local)
1. App fetches hikes from feed
   - `GET /api/hikes/user/:userId/following`
2. Fetches observations for hike
   - `GET /api/observations/hike/:hikeId`
3. Downloads images from Cloudinary URLs
4. Stores in local database
5. Links with local user profiles

### Conflict Resolution
- **Rule**: Latest timestamp wins
- If local and cloud have different data, newer version is kept
- User can always pull latest from cloud

## 🗺️ Geo-Location Features

### Nearby Hikes
- Uses device GPS for current location
- Query parameters:
  - `lat`: Device latitude
  - `lng`: Device longitude
  - `radius`: Search radius (default 5 km)
  - `limit`: Max results (default 50)

**Endpoint**: `GET /api/hikes/nearby?lat=51.5074&lng=-0.1278&radius=5`

Backend uses PostGIS `ST_DWithin()` for efficient spatial queries.

### Observation Geo-Tagging
- Optional latitude/longitude for observations
- Stored with observation in database
- Displayed on map views (future)

## 🖼️ Image Handling

### Capture/Upload Flow
1. User selects "Add Observation"
2. Choose to capture photo or select from gallery
3. Image compressed and stored locally
4. During sync, image sent to Cloudinary
5. Cloudinary returns public URL
6. URL stored in database
7. Local cache file can be deleted

### Image Display
- Loaded from Cloudinary CDN
- Cached with Glide for performance
- Fallback to local file if offline

## 🔔 Background Sync

### WorkManager
- Scheduled sync jobs run periodically
- Network-aware: waits for connection
- Battery-aware: respects doze mode
- Can sync even when app is closed

### Manual Sync
- Swipe-to-refresh on main screen
- Button in profile screen
- Automatic on startup if pending

## 🧪 Testing

### Unit Tests
```bash
./gradlew test
```

### UI Tests (Espresso)
```bash
./gradlew connectedAndroidTest
```

### Manual Testing Checklist
- [ ] Create hike with all fields
- [ ] Edit existing hike
- [ ] Delete hike
- [ ] Search hikes by name
- [ ] Add observation with image
- [ ] Sync to cloud
- [ ] Logout and login
- [ ] Search users
- [ ] Follow/unfollow user
- [ ] View feed from followed users
- [ ] Get nearby hikes with GPS

## 📦 Dependencies

```gradle
// Database & ORM
implementation androidx.room:room-runtime:2.6.1
annotationProcessor androidx.room:room-compiler:2.6.1
implementation androidx.room:room-ktx:2.6.1

// Lifecycle & ViewModel
implementation androidx.lifecycle:lifecycle-viewmodel:2.7.0
implementation androidx.lifecycle:lifecycle-livedata:2.7.0
implementation androidx.lifecycle:lifecycle-runtime:2.7.0

// Networking
implementation com.squareup.retrofit2:retrofit:2.10.0
implementation com.squareup.retrofit2:converter-gson:2.10.0
implementation com.squareup.okhttp3:okhttp:4.11.0
implementation com.squareup.okhttp3:logging-interceptor:4.11.0

// UI & Material Design
implementation com.google.android.material:material:1.13.0
implementation androidx.appcompat:appcompat:1.7.0
implementation androidx.recyclerview:recyclerview:1.3.2
implementation androidx.constraintlayout:constraintlayout:2.1.4
implementation androidx.swiperefreshlayout:swiperefreshlayout:1.1.0

// Image Loading
implementation com.github.bumptech.glide:glide:4.16.0
annotationProcessor com.github.bumptech.glide:compiler:4.16.0

// Background Tasks
implementation androidx.work:work-runtime:2.8.1

// Location Services
implementation com.google.android.gms:play-services-location:21.1.0

// Coroutines
implementation org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3
implementation org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3

// JSON Processing
implementation com.google.code.gson:gson:2.10.1

// Logging
implementation com.jakewharton.timber:timber:5.0.1
```

## ⚙️ Configuration

### API Endpoint
Edit `Constants.java`:
```java
public static final String BASE_URL = "http://10.0.2.2:5000/api/";
```

For production, change to actual backend URL.

### Cloudinary Integration
Configure in `CloudinaryHelper.java`:
```java
CLOUDINARY_NAME = "your_name"
CLOUDINARY_API_KEY = "your_key"
CLOUDINARY_API_SECRET = "your_secret"
```

### JWT Token Expiration
Handled in `AuthService.java`:
- Token refresh on 401 Unauthorized
- Auto re-login on token expiration
- Logout on refresh failure

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean and rebuild
./gradlew clean build

# Sync gradle files
./gradlew --refresh-dependencies
```

### Database Issues
- Settings → Reset Database
- Clears all local data
- Next sync downloads fresh data

### Sync Issues
- Check network connectivity
- Verify backend is running
- Check token validity
- Review Logcat for errors

### Image Issues
- Verify Cloudinary credentials
- Check image file permissions
- Ensure images aren't too large
- Try re-uploading

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed architecture
- **[SCHEMA_ALIGNMENT.md](./SCHEMA_ALIGNMENT.md)** - Database schema mapping
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Feature implementation details

## 🚀 Release Build

```bash
# Create release APK
./gradlew bundleRelease

# Create signed APK
./gradlew assembleRelease --release-key-store=path/to/keystore
```

## 📞 Support

### Common Issues

**Q: App crashes on startup**  
A: Check that backend is running on correct URL. Update Constants.java with correct BASE_URL.

**Q: Images not syncing**  
A: Verify Cloudinary credentials are correct. Check image file permissions.

**Q: Database errors**  
A: Try clearing app data in Settings or use "Reset Database" option.

**Q: Auth token expired**  
A: Logout and login again. Token is automatically refreshed.

## 📄 License

ISC - Part of M-Hike Project (University of Hertfordshire - COMP1786)

## ✍️ Authors

- Android Implementation: Hoang Le Bach
- Backend: See BackEnd/README.md

---

**Last Updated**: December 9, 2025  
**Status**: Production Ready ✅ | All Features Complete | Cloud Sync Active
