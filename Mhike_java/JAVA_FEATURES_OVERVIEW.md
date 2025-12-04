# M-Hike Java Android - Features Overview

## Executive Summary

The M-Hike Android Java application implements a hiking trail documentation system with local SQLite persistence. The app allows users to create, manage, and track hiking records with comprehensive CRUD operations, search capabilities, and observation logging. All data is stored locally and structured for future cloud synchronization.

---

## Core Features

### 1. **Home Screen (Browse Hikes)**

**Approach:** 
- Central hub displaying all hiking records in a scrollable card-based list
- Uses RecyclerView adapter pattern for efficient rendering of large datasets
- Real-time search filtering without page reloads

**Method:**
- MainActivity loads all hikes from local SQLite database via ViewModel
- HikeAdapter binds hike data to card view templates
- SearchBar with TextWatcher listens for user input and filters list in real-time
- Long-press on cards triggers context menu with View/Edit/Delete options
- FloatingActionButton (FAB) provides quick access to add new hike form

**Key Interactions:**
- Tap hike card → Navigate to detail screen
- Long-press card → Show context menu
- Type in search → Instant filtering by hike name
- Tap FAB → Launch add hike form

---

### 2. **Add/Edit Hike Form**

**Approach:**
- Comprehensive form for creating new hikes or editing existing ones
- Form validation ensures data quality before database storage
- Reusable activity handles both create and edit modes (distinguished by intent extras)

**Method:**
- AddHikeActivity hosts form with 9 input fields
- Material Design TextInputLayout components provide consistent styling
- Required vs optional fields clearly distinguished
- Date/Time pickers launch native Android dialogs for reliable input
- Dropdown selectors (AutoCompleteTextView) for Difficulty and Privacy enums
- Form validation runs before save with inline error messages
- Background thread saves to database without blocking UI
- Success/error messages display via Snackbar notifications

**Form Fields:**
1. **Hike Name** - Text input, required, max 255 chars
2. **Location Name** - Text input, required, for user-readable location (separate from GPS)
3. **Latitude** - Auto-populated read-only field from GPS or map picker
4. **Longitude** - Auto-populated read-only field from GPS or map picker
5. **Date** - Date picker, required, shows device calendar
6. **Time** - Time picker, required, 24-hour format
7. **Length** - Decimal number, required, unit is kilometers
8. **Difficulty** - Dropdown selector, required, options: Easy/Medium/Hard
9. **Parking Available** - Toggle switch, optional
10. **Privacy** - Dropdown selector, optional, options: Public/Private
11. **Description** - Multi-line text, optional, 500 character limit

**Location Capture:**
- "Get GPS Location" button uses device GPS via FusedLocationProviderClient
- "Pick on Map" button launches PickLocationActivity for manual selection
- Both methods populate read-only latitude/longitude fields
- Location coordinates persist with hike record

---

### 3. **Geolocation Features**

**Approach:**
- Dual-mode location capture combining GPS accuracy with manual selection flexibility
- Offline-capable map integration using open-source OpenStreetMap tiles (osmdroid)
- Location permission handling with user-friendly dialogs directing to app settings

**Method:**

#### A. GPS Location Capture (LocationManager Service)
- Wraps Android FusedLocationProviderClient for unified location access
- Uses callback pattern for asynchronous location retrieval
- Checks permission status before accessing GPS
- Distinguishes between "permission denied" and "GPS unavailable" errors
- Returns last known location with error handling fallback

#### B. Map-Based Location Picker (PickLocationActivity)
- Loads OpenStreetMap tiles via osmdroid MapView for offline support
- Displays persistent center marker at selected location with coordinates
- Auto-updates marker position as user drags map (200ms polling)
- Shows coordinates in marker snippet for real-time feedback
- "Jump to GPS" FAB centers map on current device location
- Confirm/Cancel buttons return selected coordinates to calling activity

#### C. Permission Management
- AlertDialog prompts users to enable location permissions
- "Open Settings" button launches app permissions settings directly
- Allows user to enable permissions and return to app without restart

**Data Storage:**
- Latitude and Longitude stored as float fields in Hike and Observation entities
- Ready for PostGIS conversion on cloud backend
- Survives app close/reopen via SQLite persistence

---

### 4. **Hike Detail Screen**

**Approach:**
- Comprehensive view of individual hike record with full information display
- Observation management (add/view/delete) nested within hike context
- Edit/Delete operations for the hike itself

**Method:**
- HikeDetailActivity loads hike by ID from database
- Material Design layout displays all hike attributes:
  - Name, location, date/time, length, difficulty, parking status, privacy level
  - Description in expandable section
  - Latitude/Longitude displayed in read-only fields
- Tabs or sections separate Details from Observations
- RecyclerView shows all observations associated with hike
- Observation cards display:
  - Title, timestamp, optional comments
  - Status badge (Open/Verified/Disputed)
  - Location coordinates if geo-tagged
- Action buttons:
  - Edit hike → Launches AddHikeActivity in edit mode
  - Delete hike → Shows confirmation dialog, cascades delete to observations
  - Delete observation → Removes individual observation with confirmation

**Observation Management:**
- Add Observation button opens dialog with form
- Dialog allows entry of:
  - Observation title (required)
  - Time (required)
  - Comments (optional)
  - Status selection (Open/Verified/Disputed)
  - Location capture via same GPS/Map picker as hikes
- ObservationAdapter displays all observations in scrollable list

---

### 5. **Search Functionality**

**Approach:**
- Real-time filtering without requiring search button submission
- Case-insensitive matching for user convenience
- Instant UI updates as user types

**Method:**
- SearchBar component listens to text changes via TextWatcher
- Each keystroke triggers ViewModel search method
- HikeDao filters all hikes by name match (SQL LIKE query)
- RecyclerView adapter notifies of list changes
- Empty state displays when no matches found

**Features:**
- Search by partial hike name
- Matches anywhere in name (not just start)
- Case-insensitive comparison
- Clears instantly when search box cleared

---

### 6. **Local Data Persistence**

**Approach:**
- SQLite database provides reliable offline-first storage
- Room ORM abstracts database operations with compile-time safety
- MVVM architecture ensures data survives configuration changes

**Method:**
- AppDatabase singleton initializes Room database on first app run
- Hike and Observation entities define database tables with schema
- HikeDao and ObservationDao provide CRUD and query methods
- LiveData exposure allows reactive UI updates
- Background threads prevent database operations from blocking UI

**Database Schema:**

**Hike Table (14 columns):**
- id (primary key, auto-increment)
- name, location, date, time, length (km)
- difficulty, parkingAvailable, privacy
- description
- cloudId (for future sync), syncStatus
- latitude, longitude (for geolocation)
- createdAt, updatedAt (timestamps)

**Observation Table (15 columns):**
- id (primary key, auto-increment)
- hikeId (foreign key, cascade delete)
- title, time, comments
- status (Open/Verified/Disputed)
- cloudId (for future sync), syncStatus
- latitude, longitude (for geo-tagged observations)
- imageUri, cloudImageUrl (for future photo support)
- confirmations, disputes (for community features)
- createdAt, updatedAt

---

### 7. **Form Validation**

**Approach:**
- Client-side validation prevents invalid data from reaching database
- Real-time error display guides users to fix issues
- Required fields clearly indicated in UI

**Method:**
- Validation runs on save button click
- Error messages display inline in TextInputLayout components
- Validation checks include:
  - Required field presence
  - String length limits
  - Numeric range checks (length > 0)
  - Number format validation
  - Date/Time format compliance

**Error Handling:**
- Validation failures prevent form submission
- Multiple errors display simultaneously
- Clear, user-friendly error messages
- Errors clear automatically on field correction

---

### 8. **CRUD Operations**

**Create:**
- Form validation ensures clean data
- Database insert happens on background thread
- Auto-increment ID assigned by SQLite
- User receives success/error notification
- For observations: linked to parent hike via foreign key

**Read:**
- All hikes loaded on MainActivity startup
- Hike details loaded on demand when selected
- Observations loaded as needed with hike
- Search filters results in real-time
- LiveData ensures UI always shows current data

**Update:**
- Edit button loads existing hike into form
- All fields pre-populated with current values
- User modifies desired fields
- Save updates database and timestamp
- Observation status can be updated
- UI refreshes automatically

**Delete:**
- Confirmation dialog prevents accidental deletion
- Single hike deletion removes record
- Cascading delete removes all observations for that hike
- Single observation deletion removes only that observation
- User receives success notification

---

### 9. **Data State Management (MVVM)**

**Approach:**
- ViewModel separates business logic from UI concerns
- LiveData enables reactive updates without polling
- Background threads prevent UI freezing

**Method:**
- HikeViewModel holds all hike-related state
- Exposes LiveData objects that Activities observe
- Database operations run on separate threads via Thread class
- MutableLiveData tracks:
  - All hikes list
  - Search query
  - Loading state
  - Success/error messages
- Activities observe LiveData with lifecycle awareness
- Automatic cleanup prevents memory leaks

**Reactive Flow:**
1. User action (e.g., save hike)
2. Activity calls ViewModel method
3. ViewModel dispatches background thread
4. Thread performs database operation
5. LiveData value updated
6. All observing Activities notified
7. UI re-renders automatically

---

### 10. **Material Design 3 UI**

**Approach:**
- Consistent design language across all screens
- Color-coded difficulty indicators for quick scanning
- Touch-friendly component sizing

**Method:**
- MaterialToolbar for app headers
- MaterialButton for all actions
- MaterialCardView for list items
- TextInputLayout for form fields
- SwitchMaterial for toggles
- RecyclerView for efficient list rendering
- FloatingActionButton for primary action

**Color Scheme:**
- Primary Green (#2E7D32) - Main actions, hiking theme
- Secondary Brown (#8D6E63) - Earth tones
- Tertiary Orange (#FF6F00) - Accents
- Difficulty indicators:
  - Easy: Green (#4CAF50)
  - Medium: Orange (#FF9800)
  - Hard: Red (#D32F2F)
- Status badges: Blues and purples for different statuses

---

### 11. **Context Menus & Dialogs**

**Approach:**
- Long-press and menu interactions for secondary actions
- Dialogs for confirmations and error messages

**Method:**
- Long-press on hike card shows context menu (View/Edit/Delete)
- Delete operations show confirmation dialog with warning message
- Success/error notifications via Snackbar (non-intrusive)
- Settings dialog provides app-level options
- Observation dialog handles inline add/edit operations

---

### 12. **Observation Status Tracking**

**Approach:**
- Track observation verification state for community features
- Prepare data structure for future community voting

**Method:**
- Status field stores: "Open", "Verified", or "Disputed"
- Observation cards display status badge with color coding
- Open for community features (confirmations/disputes fields)
- Ready for leaderboards and reputation systems

---

## Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────────┐
│    UI Layer (Activities & Adapters)     │
│  - MainActivity                         │
│  - AddHikeActivity                      │
│  - HikeDetailActivity                   │
│  - PickLocationActivity                 │
│  - HikeAdapter / ObservationAdapter     │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│  ViewModel Layer (State Management)     │
│  - HikeViewModel (LiveData)             │
│  - Background thread handling           │
│  - Message/error distribution           │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│   Data Access Layer (DAOs & Database)   │
│  - HikeDao                              │
│  - ObservationDao                       │
│  - AppDatabase (Room)                   │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│   Storage Layer (SQLite)                │
│  - Local database file (.db)            │
│  - Offline persistence                  │
└─────────────────────────────────────────┘
```

### Data Flow Pattern

**Create Operation:**
```
User fills form
      ↓
Activity validates input
      ↓
Calls ViewModel.insertHike(hike)
      ↓
ViewModel spawns background thread
      ↓
Thread calls HikeDao.insert(hike)
      ↓
Hike saved to SQLite
      ↓
LiveData updated
      ↓
Activity notified via observer
      ↓
UI shows success message
```

---

## Technology Stack

### Android Framework
- **Compilations Target:** SDK 36 (Android 15)
- **Minimum SDK:** 26 (Android 8.0)
- **Language:** Java 11

### Database
- **Room ORM** 2.6.1 - Type-safe database abstraction
- **SQLite** - Local embedded database

### UI Framework
- **Material Design 3** - Modern design components
- **AndroidX** - Compatibility libraries
- **RecyclerView** - Efficient list rendering

### State Management
- **MVVM** - Model-View-ViewModel pattern
- **LiveData** - Reactive data holders with lifecycle awareness
- **ViewModel** - State holder across configuration changes

### Location Services
- **Google Play Services Location** 21.0.1 - FusedLocationProviderClient
- **osmdroid** 6.1.18 - Offline OpenStreetMap maps

### Additional Libraries
- **Retrofit** 2.10.0 - HTTP client (prepared for cloud sync)
- **Gson** 2.10.1 - JSON serialization
- **Glide** 4.16.0 - Image loading (prepared for observation photos)

---

## Prepared for Future Features

### Cloud Synchronization
- **cloudId field** in entities for mapping local↔cloud records
- **syncStatus field** tracks sync state (0=local, 1=synced)
- **Retrofit setup** ready for API integration
- **Schema alignment** documented for seamless migration

### Photo Support
- **imageUri field** in Observation for local photo path
- **cloudImageUrl field** for cloud-hosted image URLs
- **Glide integration** ready for image display
- **FileProvider** configured in manifest for photo access

### Community Features
- **status field** (Open/Verified/Disputed) for observation voting
- **confirmations/disputes fields** for future community verification
- **User identification fields** prepared for follow/friend systems
- **Data structure** supports leaderboard calculations

### Discovery Feed
- **Latitude/longitude fields** enable geo-proximity queries
- **PostGIS conversion path** documented
- **Status tracking** supports feed filtering
- **Timestamp fields** ready for sorting algorithms

---

## Key Design Decisions

1. **Local-First Approach** - All data stored locally first, cloud sync as future phase
2. **Background Threading** - Database operations never block UI thread
3. **ViewModel Pattern** - Separates business logic from UI for testability
4. **LiveData Observers** - Reactive updates without manual polling
5. **Material Design** - Consistent, modern UX following Android guidelines
6. **Callback Pattern** - Location services use callbacks for async operations
7. **Offline Maps** - osmdroid allows map functionality without internet
8. **Separate Location Fields** - User-friendly name separate from GPS coordinates

---

## Summary of Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Hike CRUD** | ✅ Complete | Create, read, update, delete fully functional |
| **Search** | ✅ Complete | Real-time filtering by name |
| **Form Validation** | ✅ Complete | Client-side validation with error messages |
| **Local Persistence** | ✅ Complete | SQLite database with Room ORM |
| **Observations** | ✅ Complete | Add, view, delete nested observations |
| **Geolocation** | ✅ Complete | GPS capture and map picker |
| **Location Permissions** | ✅ Complete | Permission dialogs with settings link |
| **Material Design 3** | ✅ Complete | Consistent modern UI throughout |
| **MVVM Architecture** | ✅ Complete | Reactive state management |
| **Cloud Sync** | ⏳ Prepared | Schema aligned, Retrofit ready |
| **Photo Upload** | ⏳ Prepared | Fields and Glide integration ready |
| **Community Features** | ⏳ Prepared | Data structure and fields ready |
| **Discovery Feed** | ⏳ Prepared | Geolocation and status fields ready |

