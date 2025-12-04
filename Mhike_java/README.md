# M-Hike Android (Java) - Tasks A & B Implementation

A native Android application for hiking tracking with local SQLite persistence. This is the full-featured implementation supporting all features (Tasks A-G eventually), with initial focus on Tasks A & B.

## 📱 Project Status

| Task | Feature | Status |
|------|---------|--------|
| A | Hike Entry Form | ✅ Complete |
| B | CRUD + Local Persistence | ✅ Complete |
| C | Observations | ✅ Complete (Basic) |
| D | Search & Filtering | ⏳ UI Ready, needs backend |
| E | Hike Review Modal | ⏳ Planned |
| F | Cloud Sync | ⏳ Architecture ready |
| G | Social Features | ⏳ Planned |

## 🚀 Quick Start

### Prerequisites
- Android Studio (2024.1+)
- Android SDK API 30+
- Java 11+

### Getting Started
```bash
# Open in Android Studio
open -a "Android Studio" .

# Or via command line
./gradlew build
./gradlew installDebug
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 📁 Project Structure

```
Mhike_java/
├── app/src/main/
│   ├── java/com/example/mhike/
│   │   ├── database/              # Room ORM & SQLite
│   │   │   ├── AppDatabase.java
│   │   │   ├── daos/              # Data Access Objects
│   │   │   └── entities/          # @Entity classes
│   │   ├── ui/                    # Activities & Fragments
│   │   │   ├── MainActivity.java
│   │   │   ├── adapters/          # RecyclerView adapters
│   │   │   ├── add/AddHikeActivity.java
│   │   │   ├── details/HikeDetailActivity.java
│   │   │   └── viewmodels/        # MVVM ViewModels
│   │   ├── api/                   # Network layer (future)
│   │   └── repository/            # Repository pattern (future)
│   └── res/
│       ├── layout/                # XML layouts
│       ├── values/                # Colors, strings, themes
│       └── menu/                  # Menu definitions
├── QUICKSTART.md                  # Getting started guide
├── DEVELOPMENT.md                 # Detailed architecture
└── SCHEMA_ALIGNMENT.md            # Local↔Cloud schema mapping
```

## 🎯 Features

### ✅ Implemented (Tasks A-B)

#### Task A: Hike Entry
- Create hike with form validation
- Required fields: Name, Location, Date, Time, Length, Difficulty
- Optional fields: Description, Parking, Privacy
- Date/Time pickers with Material Design
- Real-time form validation

#### Task B: CRUD + Local Persistence
- **Create**: Add new hikes via form
- **Read**: Display hikes in list with search
- **Update**: Edit existing hikes
- **Delete**: Remove hikes with confirmation
- **Search**: Filter hikes by name
- **Local DB**: SQLite with Room ORM
- **Reset**: Database reset from settings

#### Task C: Observations (Basic)
- Add timestamped observations to hikes
- View observations in hike details
- Delete observations
- Status tracking (Open, Verified, Disputed)

### 🔄 Architecture Highlights

**MVVM Pattern**
- ViewModel for state management
- LiveData for observable data
- Repository pattern ready (not yet implemented)

**Material Design 3**
- MaterialCardView for cards
- TextInputLayout for forms
- MaterialButton for actions
- Color scheme: Green/Brown/Orange hiking theme

**Room Database**
- Type-safe database abstraction
- LiveData integration
- Query builders with Room annotations
- Foreign key relationships

## 📊 Database Schema

### Hikes Table
```sql
id (PK)         | Local auto-increment ID
cloudId         | Reference to cloud database
name            | Hike name (required)
location        | Location (required)
date            | Date in YYYY-MM-DD format
time            | Time in HH:mm format
length          | Distance in kilometers
difficulty      | Easy/Medium/Hard
parkingAvailable| Boolean flag
description     | Optional description
privacy         | Public/Private
syncStatus      | 0=local, 1=synced
createdAt       | Unix timestamp (ms)
updatedAt       | Unix timestamp (ms)
latitude        | Optional geo-tag
longitude       | Optional geo-tag
```

### Observations Table
```sql
id (PK)         | Local auto-increment ID
cloudId         | Reference to cloud database
hikeId (FK)     | Parent hike reference
title           | Observation title (required)
time            | Time in HH:mm format
comments        | Optional comments
imageUri        | Local image file path
cloudImageUrl   | Cloud image URL when synced
latitude        | Optional geo-tag
longitude       | Optional geo-tag
status          | Open/Verified/Disputed
confirmations   | Community verification count
disputes        | Community dispute count
syncStatus      | 0=local, 1=synced
createdAt       | Unix timestamp (ms)
updatedAt       | Unix timestamp (ms)
```

See [SCHEMA_ALIGNMENT.md](./SCHEMA_ALIGNMENT.md) for cloud schema mapping.

## 🎨 UI/UX Design

### Color Palette (Material Design 3)
- **Primary**: #2E7D32 (Green hiking theme)
- **Secondary**: #8D6E63 (Brown earth tones)
- **Tertiary**: #FF6F00 (Orange accents)
- **Error**: #D32F2F (Red for delete)
- **Success**: #388E3C (Green for verified)

### Screens
1. **Home (MainActivity)**
   - Hike list with cards
   - Search bar
   - FAB for add new
   - Settings menu

2. **Add/Edit Hike (AddHikeActivity)**
   - Form with validation
   - Date/time pickers
   - Dropdown selectors
   - Required field indicators

3. **Hike Details (HikeDetailActivity)**
   - Full hike information
   - Observations list
   - Edit/Delete buttons
   - Add observation button

## 🔗 Integration Points

### With Node.js Backend
- **Tasks D-G**: Will add Retrofit client for REST API
- **Cloud Sync**: Will implement bi-directional sync
- **Authentication**: Will add JWT token handling

### Data Flow (Future)
```
Local SQLite ←→ Retrofit REST Client ←→ Express.js API ←→ PostgreSQL
    ↓
  Room ORM
    ↓
ViewModel → LiveData → UI
```

## 🧪 Testing

### Manual Testing Scenarios
1. ✅ Create hike with all fields
2. ✅ Edit existing hike
3. ✅ Delete hike (with confirmation)
4. ✅ Search hikes by name
5. ✅ Add/delete observations
6. ✅ Reset database

### Automated Testing (Future)
- Unit tests for ViewModels
- Database integration tests
- UI tests with Espresso

Run tests:
```bash
./gradlew test                # Unit tests
./gradlew connectedAndroidTest # UI tests
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Getting started (5 min read)
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed architecture (30 min read)
- **[SCHEMA_ALIGNMENT.md](./SCHEMA_ALIGNMENT.md)** - Database mapping (20 min read)

## 🛠️ Development

### Build & Run
```bash
# Build APK
./gradlew build

# Install to emulator/device
./gradlew installDebug

# Run with Gradle
./gradlew run
```

### Debug
- Use **Logcat** in Android Studio (View → Tool Windows → Logcat)
- Set breakpoints in Java files
- Use **Device Explorer** to inspect database

### Add New Features
1. Add UI element to layout XML
2. Add DAO method if accessing database
3. Add ViewModel method
4. Connect in Activity
5. Test thoroughly

## 📦 Dependencies

```gradle
// Database
implementation androidx.room:room-runtime:2.6.1
annotationProcessor androidx.room:room-compiler:2.6.1

// Lifecycle (MVVM)
implementation androidx.lifecycle:lifecycle-viewmodel:2.7.0
implementation androidx.lifecycle:lifecycle-livedata:2.7.0

// UI
implementation com.google.android.material:material:1.13.0
implementation androidx.recyclerview:recyclerview:1.3.2
implementation androidx.constraintlayout:constraintlayout:2.1.4

// Networking (future)
implementation com.squareup.retrofit2:retrofit:2.10.0
```

## 🐛 Known Issues & Limitations

### Current Limitations
- ⚠️ No cloud sync yet (Tasks D onwards)
- ⚠️ Photo upload not implemented
- ⚠️ No authentication
- ⚠️ No social features
- ⚠️ No offline-online conflict resolution

### Workarounds
- All data is stored locally only
- Photos not supported yet
- Use "Reset Database" to clear all data

## 🚦 Next Steps

### Phase 2: Cloud Integration (Task D)
- [ ] Implement Retrofit HTTP client
- [ ] Add authentication (JWT)
- [ ] Create sync service
- [ ] Handle offline/online transitions

### Phase 3: Advanced Search (Task E)
- [ ] Advanced filter UI
- [ ] Backend filter API
- [ ] Location-based queries

### Phase 4: Social Features (Task G)
- [ ] Following system
- [ ] Feed display
- [ ] Leaderboards
- [ ] Community verification

## 📞 Support

### Troubleshooting
1. **Build fails**: `./gradlew clean build`
2. **No R symbols**: Rebuild the project
3. **Database errors**: Use Settings → Reset Database
4. **Crashes**: Check Logcat for exceptions

### Resources
- [Android Developer Docs](https://developer.android.com/)
- [Room Database Guide](https://developer.android.com/training/data-storage/room)
- [Material Design 3](https://m3.material.io/)

## 📄 License

Part of the M-Hike project at University of Hertfordshire (COMP1786).

## ✍️ Authors

- Backend: (See BackEnd/README.md)
- Android (Java): This implementation
- React Native: (See FrontEnd/README.md)

---

**Last Updated**: December 2024  
**Status**: Tasks A-B Complete ✅ | Tasks C Ready ✅ | Tasks D-G Architecture Ready 🔄
