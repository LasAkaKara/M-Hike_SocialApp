# M-Hike Database Schema Alignment

## Overview

This document shows how the local SQLite schema aligns with the cloud PostgreSQL schema, ensuring seamless synchronization when social features are added.

---

## Hike Entity Alignment

### Local SQLite (Room Entity: `Hike.java`)

```java
@Entity(tableName = "hikes")
public class Hike {
    @PrimaryKey(autoGenerate = true)
    public long id;                          // Local auto-increment ID
    
    public String cloudId;                   // Reference to cloud ID
    
    // Core fields (Required)
    public String name;                      // "Bear Mountain Trail"
    public String location;                  // "Rocky Mountains"
    public String date;                      // ISO: "2024-01-15"
    public String time;                      // ISO: "09:30"
    public float length;                     // 7.5 km
    public String difficulty;                // "Easy", "Medium", "Hard"
    public boolean parkingAvailable;         // true/false
    
    // Optional fields
    public String description;               // "Beautiful alpine views"
    public String privacy;                   // "Public", "Private"
    
    // Sync tracking
    public int syncStatus;                   // 0=local, 1=synced
    
    // Metadata
    public long createdAt;                   // Unix timestamp (ms)
    public long updatedAt;                   // Unix timestamp (ms)
    public float latitude;                   // Geo-tagging
    public float longitude;                  // Geo-tagging
}
```

### Cloud PostgreSQL Schema (from backend)

```sql
CREATE TABLE HIKES (
    id BIGINT PRIMARY KEY,
    userId BIGINT NOT NULL REFERENCES USERS(id),
    name VARCHAR(255) NOT NULL,             -- Maps to: name
    location VARCHAR(255) NOT NULL,         -- Maps to: location
    length FLOAT NOT NULL,                  -- Maps to: length
    difficulty VARCHAR(50) NOT NULL,        -- Maps to: difficulty
    description TEXT,                       -- Maps to: description
    privacy VARCHAR(50) NOT NULL,           -- Maps to: privacy
    lat FLOAT,                              -- Maps to: latitude
    lng FLOAT,                              -- Maps to: longitude
    createdAt TIMESTAMP DEFAULT NOW(),      -- Maps to: createdAt (convert ms→timestamp)
    updatedAt TIMESTAMP DEFAULT NOW()       -- Maps to: updatedAt (convert ms→timestamp)
);
```

### Mapping Strategy for Cloud Sync

| Local Field | Cloud Field | Conversion | Notes |
|---|---|---|---|
| `id` | (not synced) | Discard after upload | Local ID only |
| `cloudId` | `id` | Cloud returns this | Store to prevent duplicate uploads |
| `name` | `name` | Direct string | Required |
| `location` | `location` | Direct string | Required |
| `date` + `time` | Reconstructed | Parse from cloud `createdAt` | Cloud uses single timestamp |
| `length` | `length` | Direct float | Required |
| `difficulty` | `difficulty` | Direct string | Must match enum |
| `parkingAvailable` | (Not in cloud) | Not synced | App-only field |
| `description` | `description` | Direct text | Optional |
| `privacy` | `privacy` | Direct string | Public/Private |
| `latitude`, `longitude` | `lat`, `lng` | Direct float | For geo-queries |
| `createdAt` | `createdAt` | Unix ms → timestamp | Convert on upload |
| `updatedAt` | `updatedAt` | Unix ms → timestamp | Convert on upload |
| `syncStatus` | (not in cloud) | Not synced | Only for local tracking |

---

## Observation Entity Alignment

### Local SQLite (Room Entity: `Observation.java`)

```java
@Entity(
    tableName = "observations",
    foreignKeys = @ForeignKey(
        entity = Hike.class,
        parentColumns = "id",
        childColumns = "hikeId",
        onDelete = ForeignKey.CASCADE
    )
)
public class Observation {
    @PrimaryKey(autoGenerate = true)
    public long id;                          // Local auto-increment ID
    
    public String cloudId;                   // Reference to cloud ID
    public long hikeId;                      // Foreign key to parent hike
    
    // Core fields (Required)
    public String title;                     // "Trail is muddy"
    public String time;                      // ISO: "10:45"
    
    // Optional fields
    public String comments;                  // "Recommend hiking boots"
    public String imageUri;                  // "file:///path/to/image"
    public String cloudImageUrl;             // "https://cdn/observation123.jpg"
    
    // Geo-tagging
    public Float latitude;
    public Float longitude;
    
    // Community feedback
    public String status;                    // "Open", "Verified", "Disputed"
    public int confirmations;                // Count of verifications
    public int disputes;                     // Count of disputes
    
    // Sync tracking
    public int syncStatus;                   // 0=local, 1=synced
    
    // Metadata
    public long createdAt;                   // Unix timestamp (ms)
    public long updatedAt;                   // Unix timestamp (ms)
}
```

### Cloud PostgreSQL Schema (from backend)

```sql
CREATE TABLE OBSERVATIONS (
    id BIGINT PRIMARY KEY,
    hikeId BIGINT NOT NULL REFERENCES HIKES(id),
    userId BIGINT NOT NULL REFERENCES USERS(id),
    title VARCHAR(255) NOT NULL,            -- Maps to: title
    imageUrl VARCHAR(500),                  -- Maps to: cloudImageUrl
    lat FLOAT,                              -- Maps to: latitude
    lng FLOAT,                              -- Maps to: longitude
    status VARCHAR(50) NOT NULL,            -- Maps to: status
    confirmations INTEGER DEFAULT 0,        -- Maps to: confirmations
    disputes INTEGER DEFAULT 0,             -- Maps to: disputes
    createdAt TIMESTAMP DEFAULT NOW(),      -- Maps to: createdAt
    updatedAt TIMESTAMP DEFAULT NOW()       -- Maps to: updatedAt
);

CREATE TABLE OBSERVATION_COMMENTS (
    id BIGINT PRIMARY KEY,
    observationId BIGINT NOT NULL REFERENCES OBSERVATIONS(id),
    userId BIGINT NOT NULL REFERENCES USERS(id),
    content TEXT NOT NULL,                  -- Maps to: comments
    createdAt TIMESTAMP DEFAULT NOW()
);
```

### Mapping Strategy for Cloud Sync

| Local Field | Cloud Field(s) | Conversion | Notes |
|---|---|---|---|
| `id` | (not synced) | Discard after upload | Local ID only |
| `cloudId` | `id` | Cloud returns this | Store to prevent duplicates |
| `hikeId` | `hikeId` | Local→Cloud conversion | Must resolve local→cloud ID |
| `title` | `title` | Direct string | Required |
| `time` | (not in cloud) | Not synced | App-only field |
| `comments` | OBSERVATION_COMMENTS.content | Create separate comment record | Create comment row on cloud |
| `imageUri` | (not synced) | Process locally | Local file path |
| `cloudImageUrl` | `imageUrl` | Direct URL | Store when synced |
| `latitude`, `longitude` | `lat`, `lng` | Direct float | For geo-queries |
| `status` | `status` | Direct enum | Open/Verified/Disputed |
| `confirmations` | `confirmations` | Direct int | Read-only from cloud |
| `disputes` | `disputes` | Direct int | Read-only from cloud |
| `createdAt` | `createdAt` | Unix ms → timestamp | Convert on upload |
| `updatedAt` | `updatedAt` | Unix ms → timestamp | Convert on upload |
| `syncStatus` | (not in cloud) | Not synced | Only for local tracking |

---

## Sync Flow Diagram

```
Local SQLite                     REST API                Cloud PostgreSQL
──────────────────────────────────────────────────────────────────────
                                                      
┌──────────────────┐                            ┌──────────────────┐
│ Hike (local)     │──  POST /api/hikes  ───→  │ Hike (cloud)     │
│ id: 5            │  {name, location, ...}    │ id: 123          │
│ cloudId: null    │←─ {id: 123, ...}      ────│ userId: 7        │
│ syncStatus: 0    │                            │ createdAt: time  │
└──────────────────┘                            └──────────────────┘
Update cloudId: 123                                      
Update syncStatus: 1                             

┌──────────────────┐                            ┌──────────────────┐
│ Observation      │──  POST /api/obs     ───→  │ Observation      │
│ (local)          │  {hikeId: 123,             │ (cloud)          │
│ id: 12           │   title: "...", ...}       │ id: 456          │
│ hikeId: 123      │←─ {id: 456, ...}       ────│ hikeId: 123      │
│ cloudId: null    │                            │ createdAt: time  │
└──────────────────┘                            └──────────────────┘
Update cloudId: 456
Update syncStatus: 1

                    ← Background sync checks →
        Every X minutes: GET /api/hikes?userId=7
        Merges cloud changes with local data
```

---

## Migration Strategy

When upgrading the database schema:

### Step 1: Add Migration File
```java
// In AppDatabase.java
@Database(
    entities = {Hike.class, Observation.class},
    version = 2,  // Increment version
    exportSchema = false
)
```

### Step 2: Create Migration (if schema changes)
```java
static final Migration MIGRATION_1_2 = new Migration(1, 2) {
    @Override
    public void migrate(@NonNull SupportSQLiteDatabase database) {
        // Add new columns if needed
        // database.execSQL("ALTER TABLE hikes ADD COLUMN newField TEXT");
    }
};
```

### Step 3: Register Migration
```java
INSTANCE = Room.databaseBuilder(context, AppDatabase.class, DATABASE_NAME)
    .addMigrations(MIGRATION_1_2)
    .build();
```

---

## Data Type Conversions

### String Encoding
- All strings stored as TEXT in SQLite
- JSON serialization for Retrofit when uploading to cloud

### Date/Time Handling
- **Local**: Unix timestamp in milliseconds (long)
- **Cloud**: PostgreSQL TIMESTAMP with timezone
- **Conversion**:
  ```java
  // Local → Cloud (upload)
  long localMs = System.currentTimeMillis();
  long secondsForCloud = localMs / 1000;  // Convert ms to seconds
  
  // Cloud → Local (download)
  long cloudSeconds = timestamp.getTime() / 1000;
  long localMs = cloudSeconds * 1000;
  ```

### Boolean Handling
- **Local SQLite**: Stored as INTEGER (0 or 1)
- **Cloud PostgreSQL**: BOOLEAN type
- **Conversion**:
  ```java
  boolean parking = sqliteInteger == 1;  // On read
  int sqliteValue = parking ? 1 : 0;     // On write
  ```

### Floating Point
- Both use FLOAT/DOUBLE
- Direct conversion without special handling

---

## Sync Conflict Resolution

When downloading updates from cloud:

### For Hikes
```
Cloud record newer (updatedAt > local)?
  YES → Overwrite local hike
  NO → Keep local (in case of future sync)
```

### For Observations
```
Cloud observation not in local?
  YES → Insert new observation
  
Observation exists locally?
  Cloud is newer?
    YES → Update local
    NO → Skip (preserve local changes)
```

---

## Special Cases

### Parking (App-Only Field)
- `parkingAvailable` only exists locally
- Not synced to cloud
- ✅ This is intentional - cloud doesn't need this

### Time (Observation-Only Local Field)
- `time` is separate from `createdAt`
- Cloud only has `createdAt` (timestamp)
- When downloading: Extract time from `createdAt`
- When uploading: Time is derived from device

### User ID Resolution
- Cloud requires `userId` for every hike/observation
- Local app doesn't track this yet
- **Will be added when**: Authentication task is implemented
- **Temporary**: Use placeholder `userId=1` for testing

### Image Handling
- `imageUri`: Local file path (app-only)
- `cloudImageUrl`: Cloud CDN URL (after upload)
- **Future**: Implement Cloudinary upload in sync service

---

## Validation Rules

### Hike Validation
```
✓ name: non-empty, max 255 chars
✓ location: non-empty, max 255 chars
✓ date: valid ISO format (YYYY-MM-DD)
✓ time: valid ISO format (HH:mm)
✓ length: > 0, finite float
✓ difficulty: one of {Easy, Medium, Hard}
✓ privacy: one of {Public, Private}
```

### Observation Validation
```
✓ title: non-empty, max 255 chars
✓ time: valid ISO format (HH:mm)
✓ comments: max 500 chars
✓ hikeId: valid FK reference
```

---

## Future: Cloud-Only Fields

These fields exist on cloud but are not in local app (yet):

```java
// On Hike (cloud only)
userId BIGINT              // Will add when auth is implemented
userLikes INTEGER          // Social feature
trailRating FLOAT          // Aggregated from observations

// On Observation (cloud only)
userId BIGINT              // Will add when auth is implemented
imageUrl VARCHAR           // Already tracked as cloudImageUrl
OBSERVATION_COMMENTS       // Will create separate comment UI
```

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Hike Schema** | ✅ Aligned | All required fields match |
| **Observation Schema** | ✅ Aligned | Relationships preserved |
| **ID Mapping** | ✅ Ready | Local→Cloud via cloudId field |
| **Date/Time Conversion** | ✅ Planned | Will implement in sync service |
| **Image Sync** | ⏳ Planned | Needs Cloudinary integration |
| **User ID** | ⏳ Pending | Needs authentication |
| **Conflict Resolution** | ✅ Planned | Last-write-wins strategy |

The local schema is designed to seamlessly integrate with the cloud backend when synchronization features are added in Tasks D-G.

---

## References

- [Plan.md](../Plan.md) - Overall project architecture
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Implementation details
- Backend Database Schema - See `../BackEnd/` folder
- Android Room Migration Guide: https://developer.android.com/training/data-storage/room/migrating-db-versions
