# M-Hike Android Development Guide

## Project Overview

M-Hike is a hiking tracking application for Android (Java) with local SQLite persistence and cloud synchronization capabilities. This guide covers the Tasks A & B implementation (Hike entry and local CRUD operations).

---

## Architecture Overview

### Local Database (SQLite via Room)
- **Hike**: Stores user's personal hike records
- **Observation**: Timestamped observations attached to hikes
- Offline-first approach: all data starts locally
- Sync status tracking for cloud synchronization

### Remote Database (PostgreSQL via Node.js Backend)
- Will be used for social features (Task G)
- User authentication and cloud sync
- Not implemented yet in this phase

---

## Project Structure

```
Mhike_java/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/mhike/
│   │       │   ├── database/
│   │       │   │   ├── AppDatabase.java          # Room database singleton
│   │       │   │   ├── daos/                     # Data Access Objects
│   │       │   │   │   ├── HikeDao.java
│   │       │   │   │   └── ObservationDao.java
│   │       │   │   └── entities/                 # Database entities
│   │       │   │       ├── Hike.java
│   │       │   │       └── Observation.java
│   │       │   │
│   │       │   ├── ui/
│   │       │   │   ├── MainActivity.java         # Home screen with hike list
│   │       │   │   ├── adapters/                 # RecyclerView adapters
│   │       │   │   │   ├── HikeAdapter.java
│   │       │   │   │   └── ObservationAdapter.java
│   │       │   │   ├── add/
│   │       │   │   │   └── AddHikeActivity.java  # Add/Edit hike form
│   │       │   │   ├── details/
│   │       │   │   │   └── HikeDetailActivity.java # Hike detail & observations
│   │       │   │   └── viewmodels/
│   │       │   │       └── HikeViewModel.java    # MVVM ViewModel
│   │       │   │
│   │       │   ├── api/                          # Network layer (Future)
│   │       │   ├── repository/                   # Repository pattern (Future)
│   │       │   └── utils/                        # Helper utilities
│   │       │
│   │       ├── res/
│   │       │   ├── layout/
│   │       │   │   ├── activity_main.xml         # Home screen layout
│   │       │   │   ├── activity_add_hike.xml     # Hike form layout
│   │       │   │   ├── activity_hike_detail.xml  # Detail screen layout
│   │       │   │   ├── item_hike.xml             # Hike list item card
│   │       │   │   └── item_observation.xml      # Observation card
│   │       │   ├── menu/
│   │       │   │   ├── menu_main.xml             # App bar menu
│   │       │   │   └── menu_detail.xml           # Detail screen menu
│   │       │   ├── values/
│   │       │   │   ├── strings.xml               # All UI text strings
│   │       │   │   └── colors.xml                # Material Design colors
│   │       │   └── drawable/
│   │       │       └── chip_background.xml       # Shape drawables
│   │       │
│   │       └── AndroidManifest.xml               # App configuration
│   │
│   └── build.gradle.kts                          # App-level Gradle config
│
├── gradle/
│   └── libs.versions.toml                        # Centralized dependency management
│
└── build.gradle.kts                              # Project-level Gradle config

```

---

## Key Components

### 1. Database Layer (Room ORM)

**Entities:**
- `Hike`: Represents a hiking trip with all required fields
- `Observation`: Represents a timestamped observation within a hike

**DAOs (Data Access Objects):**
- `HikeDao`: CRUD + search/filter operations on hikes
- `ObservationDao`: CRUD operations on observations

**AppDatabase:**
- Singleton pattern for database access
- Thread-safe initialization
- Manages database schema versioning

### 2. ViewModel (MVVM Pattern)

`HikeViewModel` handles:
- All database operations on background threads
- LiveData exposure for UI observation
- Error/success message handling
- Search and filtering logic

### 3. Activities & Fragments

**MainActivity:**
- Displays list of hikes in RecyclerView
- Search functionality
- Empty state handling
- Settings menu (Reset database)
- Long-click context menu for hikes

**AddHikeActivity:**
- Form for creating/editing hikes
- Real-time validation
- Date/time pickers
- Difficulty and privacy dropdowns
- Required field indicators

**HikeDetailActivity:**
- Full hike information display
- List of observations
- Add/Edit/Delete observation buttons
- Hike statistics

### 4. Adapters

**HikeAdapter:**
- Displays hikes in a card-based MaterialCardView
- Click listeners for navigation
- Sync status and difficulty color coding

**ObservationAdapter:**
- Shows observations for a specific hike
- Delete functionality
- Status badges (Open, Verified, Disputed)

### 5. Layouts (Material Design 3)

All layouts use Material Design 3 components:
- `MaterialCardView` for cards
- `TextInputLayout` for form fields
- `MaterialButton` for buttons
- `MaterialSwitch` for toggles
- `MaterialToolbar` for app bar
- `RecyclerView` for lists

---

## Database Schema

### Local SQLite Schema

#### Hikes Table
```sql
CREATE TABLE hikes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cloudId TEXT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL (YYYY-MM-DD),
    time TEXT NOT NULL (HH:mm),
    length REAL NOT NULL,
    difficulty TEXT NOT NULL,
    parkingAvailable INTEGER NOT NULL,
    description TEXT,
    privacy TEXT NOT NULL,
    syncStatus INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    latitude REAL,
    longitude REAL
);
```

#### Observations Table
```sql
CREATE TABLE observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cloudId TEXT,
    hikeId INTEGER NOT NULL,
    title TEXT NOT NULL,
    time TEXT NOT NULL (HH:mm),
    comments TEXT,
    imageUri TEXT,
    cloudImageUrl TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT NOT NULL,
    confirmations INTEGER,
    disputes INTEGER,
    syncStatus INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY(hikeId) REFERENCES hikes(id) ON DELETE CASCADE
);
```

---

## Color Scheme (Material Design 3)

### Primary Colors (Hiking Theme - Green)
- Primary: `#2E7D32` (Green)
- Light: `#66BB6A`
- Dark: `#1B5E20`

### Secondary Colors (Earth Tones - Brown)
- Secondary: `#8D6E63`
- Light: `#A1887F`
- Dark: `#6D4C41`

### Semantic Colors
- Error: `#D32F2F`
- Warning: `#FF9800`
- Success: `#388E3C`
- Info: `#1976D2`

### Difficulty Colors
- Easy: `#4CAF50` (Green)
- Medium: `#FF9800` (Orange)
- Hard: `#D32F2F` (Red)

---

## Features Implemented (Tasks A & B)

### Task A: Hike Entry
✅ Create hike with required fields:
  - Name
  - Location
  - Date (with date picker)
  - Time (with time picker)
  - Length (in kilometers)
  - Difficulty (Easy/Medium/Hard dropdown)
  - Parking availability (switch)
  - Privacy status (Public/Private dropdown)
  - Optional description

✅ Form validation with error messages
✅ Summary confirmation before save

### Task B: CRUD + Local Persistence
✅ Create: Add new hikes to SQLite
✅ Read: Display all hikes in list with search
✅ Update: Edit existing hikes
✅ Delete: Remove hikes (with confirmation)
✅ Local SQLite persistence using Room
✅ Search hikes by name
✅ Filter by difficulty
✅ Reset database functionality

### Task C: Observations (Partial)
✅ One-to-many relationship (Hike → Observations)
✅ Add observations to hikes
✅ Display observations in detail view
✅ Delete observations
⏳ Photo upload (UI prepared, not implemented yet)
⏳ Geo-tagging (fields prepared, not implemented yet)

---

## Building & Running

### Prerequisites
- Android Studio (latest)
- Java 11+
- Android SDK API level 30+

### Build Steps

1. **Open in Android Studio**
   ```bash
   cd Mhike_java
   # Open in Android Studio or use:
   ./gradlew build
   ```

2. **Install to Emulator/Device**
   ```bash
   ./gradlew installDebug
   ```

3. **Run Tests**
   ```bash
   ./gradlew test
   ```

### Debug Build Variants
- Edit `build.gradle.kts` to add build variants if needed

---

## Key Dependencies

### Database
- **Room**: Type-safe database abstraction over SQLite
  - room-runtime: Runtime support
  - room-compiler: Annotation processor

### Lifecycle
- **Lifecycle**: MVVM architecture support
  - lifecycle-viewmodel: ViewModel class
  - lifecycle-livedata: LiveData observable data holders
  - lifecycle-runtime: Lifecycle management

### Networking (Future - for Tasks D onwards)
- **Retrofit**: REST API client
- **OkHttp**: HTTP client
- **Gson**: JSON serialization

### UI
- **Material Components**: Material Design 3 UI components
- **ConstraintLayout**: Flexible layouts
- **RecyclerView**: List rendering
- **Fragment**: Fragment support for modular UI

### Image Loading (Future)
- **Glide**: Image loading and caching

---

## Next Steps

### To Add Features:

#### 1. Network Layer (Task D onwards)
- Create `api/ApiService.java` with Retrofit
- Implement cloud sync for public hikes
- Add authentication with JWT

#### 2. Repository Pattern
- Create `repository/HikeRepository.java`
- Decide local vs cloud data source
- Handle sync conflicts

#### 3. Social Features (Task G)
- Following/followers system
- Feed display (following & discovery)
- Leaderboard rankings
- Community verification system

#### 4. Advanced UI
- Map integration for hike visualization
- Photo gallery for observations
- Advanced filtering and search
- Dark mode support

#### 5. Testing
- Unit tests for ViewModels
- Database tests with testImplementation
- UI tests with Espresso

---

## Common Development Tasks

### Add a New Field to Hike
1. Add field to `Hike.java` entity
2. Update `HikeDao.java` queries if needed
3. Update `activity_add_hike.xml` layout
4. Update `AddHikeActivity.java` form handling
5. Increment `AppDatabase.VERSION` for schema migration

### Add a Search Filter
1. Add query method to `HikeDao.java`
2. Add UI elements to `activity_main.xml`
3. Add observer in `MainActivity.java`
4. Bind filter to `HikeViewModel.java`

### Modify Hike Card Layout
- Edit `item_hike.xml`
- Update `HikeAdapter.HikeViewHolder.bind()` method
- Adjust `HikeAdapter` styling

---

## Troubleshooting

### Room Database Issues
- **"Cannot find symbol" for DAOs**: Run `./gradlew build` to generate Room classes
- **Migration errors**: Update `AppDatabase.VERSION` and add migration
- **No data appearing**: Check Room entities have proper annotations

### Build Issues
- **"package R does not exist"**: Run `./gradlew clean build`
- **Gradle sync failed**: Delete `.gradle/` folder and sync again
- **Kotlin Gradle errors**: Ensure gradle wrapper version matches

### Runtime Issues
- **NullPointerException in ViewModel**: Check LiveData is being observed
- **Database locks**: Ensure database operations are on background threads
- **UI not updating**: Verify you're using `LiveData` not `List`

---

## Resources

- [Android Room Documentation](https://developer.android.com/training/data-storage/room)
- [Android ViewModel Documentation](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [Material Design 3 Components](https://m3.material.io/)
- [Android Development Best Practices](https://developer.android.com/guide)

---

## Contact & Support

For questions about this implementation, refer to the main project documentation or create an issue in the repository.

Last Updated: December 2024
