# Offline Sync System - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐         ┌──────────────────────────┐   │
│  │   SyncFragment.java │         │   HomeFragment.java      │   │
│  │                     │         │                          │   │
│  │ • Status Display    │         │ • Sync Button            │   │
│  │ • Progress Bar      │◄───────►│ • Offline Hike List      │   │
│  │ • Sync Controls     │         │ • Delete All Hikes       │   │
│  │ • Result Display    │         │                          │   │
│  └──────────┬──────────┘         └──────────┬───────────────┘   │
│             │                               │                    │
└─────────────┼───────────────────────────────┼────────────────────┘
              │ Observer Pattern              │
              │ (Observes callbacks)          │
              │                               │
┌─────────────▼───────────────────────────────▼────────────────────┐
│                      VIEWMODEL LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          HikeViewModel.java                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  • syncOfflineHikesToCloud()                            │   │
│  │  • getOfflineHikeCount()                                │   │
│  │  • getSyncStatus()                                      │   │
│  │                                                          │   │
│  │  LiveData Observables:                                  │   │
│  │  • isLoading: Boolean                                   │   │
│  │  • errorMessage: String                                 │   │
│  │  • successMessage: String                               │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
└─────────────────────┼─────────────────────────────────────────────┘
                      │
                      │ Delegates to
                      │
┌─────────────────────▼─────────────────────────────────────────────┐
│                   SERVICE LAYER                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          SyncService.java (Core Sync Engine)            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  Methods:                                               │   │
│  │  ├─ syncAllOfflineHikes(callback)                       │   │
│  │  ├─ syncHikeAsync(hike, callback)                       │   │
│  │  ├─ getOfflineHikeCount(callback)                       │   │
│  │  └─ getSyncStatus(callback)                             │   │
│  │                                                          │   │
│  │  Classes:                                               │   │
│  │  ├─ SyncResult (operation statistics)                   │   │
│  │  ├─ SyncStatus (status overview)                        │   │
│  │  └─ Callbacks (progress tracking)                       │   │
│  └──────────────────┬──────────────────────────────────────┘   │
│                     │                                             │
└─────────────────────┼─────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌─────────────┐ ┌────────────────┐
│   DATABASE   │ │ HTTP CLIENT │ │  PREFERENCES   │
│   (ROOM)     │ │ (OKHTTP)    │ │ (SharedPrefs)  │
│              │ │             │ │                │
│ • HikeDao    │ │ • POST      │ │ • Auth Token   │
│ • Hike       │ │ • Headers   │ │ • User ID      │
│ • Queries    │ │ • Timeout   │ │ • Username     │
└──────┬───────┘ └──────┬──────┘ └────────┬───────┘
       │                │                 │
       │ Reads/Writes   │                 │
       │ Sync Status    │                 │
       │                │ Updates         │
       │                │ cloudId         │
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        │ Stores Locally
                        │
            ┌───────────┴────────────┐
            │                        │
            ▼                        ▼
      ┌─────────────┐         ┌──────────────┐
      │ SQLite DB   │         │ SharedPrefs  │
      │             │         │              │
      │ Hikes Table │         │ Auth Data    │
      │ (syncStatus)│         │ Preferences  │
      │ (cloudId)   │         │              │
      └─────────────┘         └──────────────┘
```

---

## Sync Operation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INITIATES SYNC                                          │
│    User clicks "Sync Offline Hikes" button in UI               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 2. REQUEST AUTHENTICATION                                       │
│    Check JWT token from AuthService                             │
│    Verify user is logged in                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 3. RETRIEVE OFFLINE HIKES                                       │
│    Query: SELECT * FROM hikes WHERE syncStatus = 0            │
│    Load all offline hikes from SQLite                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 4. NOTIFY UI - SYNC START                                       │
│    onSyncStart(totalHikes)                                      │
│    Show progress dialog, disable buttons                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         │ For each offline hike:             │
         │                                    │
         ▼                                    ▼
    ┌────────────────────────────────────────────────┐
    │ 5. PREPARE HIKE DATA                           │
    │    Convert hike object to JSON:                │
    │    {                                           │
    │      "userId": 1,                              │
    │      "name": "Trail Name",                     │
    │      "location": "Location",                   │
    │      "length": 5.5,                            │
    │      "difficulty": "Easy",                     │
    │      "description": "...",                     │
    │      "privacy": "public",                      │
    │      "lat": 40.7128,                           │
    │      "lng": -74.0060                           │
    │    }                                           │
    └──────────┬───────────────────────────────────┘
               │
    ┌──────────▼───────────────────────────────────┐
    │ 6. SEND HTTP REQUEST                         │
    │    POST /api/hikes                           │
    │    Headers:                                  │
    │    • Authorization: Bearer <token>           │
    │    • Content-Type: application/json          │
    │                                              │
    │    Wait for response...                      │
    └──────────┬───────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ┌─────────┐  ┌──────────┐
    │ SUCCESS │  │  ERROR   │
    │ (200)   │  │ (4xx-5xx)│
    └────┬────┘  └─────┬────┘
         │             │
         ▼             ▼
    ┌──────────────┐ ┌──────────────┐
    │ Parse JSON   │ │ Log Error    │
    │ Get cloudId  │ │ Increment    │
    │              │ │ failedCount  │
    └────┬─────────┘ └──────────────┘
         │                 │
         ▼                 │
    ┌──────────────┐       │
    │ Update Hike: │       │
    │ • syncStatus=1       │
    │ • cloudId=response.id│
    │ • updatedAt=now      │
    │                      │
    │ Save to DB:          │
    │ hikeDao.update()     │
    │                      │
    │ Increment            │
    │ successCount++       │
    └────┬─────────────────┘
         │
         │ (Move to next hike)
         │
         └──┬─────────────────────┐
            │                     │
            ▼                     ▼
    (More hikes?)          (All done?)
            │                     │
         YES└──→ Loop            │
                                 NO
                                 │
    ┌────────────────────────────▼───────────────────┐
    │ 7. CREATE SYNC RESULT                          │
    │    totalHikes: 10                              │
    │    successfulUploads: 9                        │
    │    failedUploads: 1                            │
    │    skippedHikes: 0                             │
    │    syncDuration: 15234ms                       │
    └────────────┬─────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────┐
    │ 8. NOTIFY UI - SYNC COMPLETE                 │
    │    onSyncSuccess(result)                     │
    │                                              │
    │    Update UI:                                │
    │    • Show success message                    │
    │    • Display results                         │
    │    • Enable buttons                          │
    │    • Show completion percentage              │
    └────────────┬─────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────┐
    │ 9. REFRESH UI STATE                          │
    │    • Reload hike list                        │
    │    • Update status display                   │
    │    • Clear progress bar                      │
    │    • Show action buttons                     │
    └────────────────────────────────────────────┘
```

---

## Data Flow During Sync

```
┌─────────────────────────────────────────────────────────────────┐
│ LOCAL HIKE (Before Sync)                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Hike {                                                          │
│    id: 5,                                   ← Local DB ID       │
│    cloudId: null,                           ← Not yet synced   │
│    name: "Mount Everest Base Camp",                             │
│    location: "Nepal",                                           │
│    length: 65.5,                                                │
│    difficulty: "Hard",                                          │
│    description: "Amazing trek to base camp",                    │
│    privacy: "public",                                           │
│    latitude: 28.0,                                              │
│    longitude: 86.5,                                             │
│    syncStatus: 0,                           ← OFFLINE          │
│    createdAt: 1705329000000,                                    │
│    updatedAt: 1705329000000                                     │
│  }                                                               │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Convert to JSON
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ HTTP REQUEST BODY                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  {                                                               │
│    "userId": 1,                                                 │
│    "name": "Mount Everest Base Camp",                           │
│    "location": "Nepal",                                         │
│    "length": 65.5,                                              │
│    "difficulty": "Hard",                                        │
│    "description": "Amazing trek to base camp",                  │
│    "privacy": "public",                                         │
│    "lat": 28.0,                                                 │
│    "lng": 86.5                                                  │
│  }                                                               │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    POST /api/hikes
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ HTTP RESPONSE (Backend Created)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  {                                                               │
│    "id": "cloud_12345",                     ← Cloud DB ID      │
│    "userId": 1,                                                 │
│    "name": "Mount Everest Base Camp",                           │
│    "location": "Nepal",                                         │
│    "length": 65.5,                                              │
│    "difficulty": "Hard",                                        │
│    "description": "Amazing trek to base camp",                  │
│    "privacy": "public",                                         │
│    "lat": 28.0,                                                 │
│    "lng": 86.5,                                                 │
│    "createdAt": "2024-01-15T10:30:00Z"                          │
│  }                                                               │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Extract cloudId
                           │ Update local hike
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ LOCAL HIKE (After Sync)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Hike {                                                          │
│    id: 5,                                   ← Same local ID    │
│    cloudId: "cloud_12345",                  ← NOW SET!        │
│    name: "Mount Everest Base Camp",                             │
│    location: "Nepal",                                           │
│    length: 65.5,                                                │
│    difficulty: "Hard",                                          │
│    description: "Amazing trek to base camp",                    │
│    privacy: "public",                                           │
│    latitude: 28.0,                                              │
│    longitude: 86.5,                                             │
│    syncStatus: 1,                           ← SYNCED!         │
│    createdAt: 1705329000000,                                    │
│    updatedAt: 1705329015234                 ← UPDATED         │
│  }                                                               │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ hikeDao.update(hike)
                           │ Save to SQLite
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ DATABASE UPDATE COMPLETE                                        │
│ Hike now synced in both local and cloud databases               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status Transitions

```
┌──────────────┐
│ Create Hike  │
│ (Offline)    │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐         ┌──────────────────┐
│  syncStatus = 0     │────────▶│  Ready for Sync  │
│  cloudId = null     │ Click   │  (Offline State) │
│  (Local Only)       │ Sync    │                  │
└─────────────────────┘         └────────┬─────────┘
       ▲                                 │
       │                                 │
       │                   POST /api/hikes
       │                                 │
       │                    ┌────────────▼─────────┐
       │                    │ Uploading to Cloud.. │
       │                    └────────────┬─────────┘
       │                                 │
       │        ┌────────────────────────┴────────────────────┐
       │        │                                             │
       │        ▼ (Success)                            ▼ (Failed)
       │  ┌──────────────┐                        ┌─────────────┐
       │  │ Update Local:│                        │ Stay Offline│
       │  │              │                        │             │
       │  │ syncStatus=1 │                        │ syncStatus=0│
       │  │ cloudId=id   │                        │ Can Retry   │
       │  └──────┬───────┘                        └─────────────┘
       │         │                                       │
       │         ▼                                       │
       │  ┌──────────────────────┐                       │
       │  │  syncStatus = 1      │                       │
       │  │  cloudId = cloud_id  │                       │
       │  │  (Synced with Cloud) │                       │
       │  └──────┬───────────────┘                       │
       │         │                                       │
       │         │ (Hike stays synced)                   │
       │         │                                       │
       │         └───────────────────────────────────────┘
       │                                                 │
       └─────────────────────────────────────────────────┘
          (Retry/Manual Sync)
```

---

## Class Relationships

```
┌─────────────────────────────────────────────────────────┐
│                   UI Layer                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SyncFragment                                           │
│  ├─ Observes: HikeViewModel                            │
│  ├─ Shows: Progress, Status, Results                   │
│  └─ Calls: viewModel.syncOfflineHikesToCloud()        │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │ depends on
                       │
┌──────────────────────▼──────────────────────────────────┐
│              ViewModel Layer                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HikeViewModel                                          │
│  ├─ Creates: SyncService instances                    │
│  ├─ Exposes: syncOfflineHikesToCloud()                │
│  ├─ Observables: isLoading, errorMessage, successMsg  │
│  └─ Delegates: To SyncService                         │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │ delegates to
                       │
┌──────────────────────▼──────────────────────────────────┐
│               Service Layer                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SyncService                                            │
│  ├─ Methods:                                           │
│  │  ├─ syncAllOfflineHikes()                           │
│  │  ├─ syncHikeAsync()                                 │
│  │  ├─ getOfflineHikeCount()                           │
│  │  └─ getSyncStatus()                                 │
│  │                                                     │
│  ├─ Uses:                                              │
│  │  ├─ HikeDao (database access)                       │
│  │  ├─ OkHttpClient (HTTP communication)              │
│  │  └─ AuthService (JWT token)                        │
│  │                                                     │
│  └─ Callbacks:                                         │
│     ├─ SyncCallback                                    │
│     ├─ CountCallback                                   │
│     └─ StatusCallback                                  │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │ uses
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Data Access Layer                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HikeDao                    Hike (Entity)               │
│  ├─ getHikesBySyncStatus()  • id                       │
│  ├─ insert()                • cloudId                  │
│  ├─ update()                • name                     │
│  ├─ delete()                • location                 │
│  └─ getAllHikesSync()       • length                   │
│                             • difficulty               │
│  Room Database              • syncStatus ← KEY        │
│  └─ SQLite hikes table      • updatedAt               │
│     └─ Stores all hikes     • ...other fields         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## External Systems Integration

```
┌──────────────────────────────────────────────────────────────┐
│ M-HIKE ANDROID APP                                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SyncService / HikeViewModel / SyncFragment            │ │
│  │                                                        │ │
│  │ Offline Hikes (syncStatus = 0)                        │ │
│  │ │                                                     │ │
│  │ └─ Convert to JSON                                   │ │
│  │    POST /api/hikes                                   │ │
│  │    Headers:                                          │ │
│  │    • Authorization: Bearer JWT_TOKEN                │ │
│  │    • Content-Type: application/json                 │ │
│  │                                                     │ │
│  │    Body: { hike data }                              │ │
│  └───────────────┬───────────────────────────────────┘ │
│                  │ HTTP                              │
│                  │                                  │
└──────────────────┼──────────────────────────────────┘
                   │
                   │ HTTPS
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ BACKEND API                                                 │
│ (Node.js/Express)                                           │
│                                                              │
│  POST /api/hikes                                             │
│  ├─ Verify JWT Token                                         │
│  ├─ Validate Hike Data                                       │
│  ├─ Create Hike in PostgreSQL                                │
│  ├─ Return: { id: "cloud_id", ...hike_data }               │
│  │                                                           │
│  └─ Store in: PostgreSQL Database                            │
│     └─ hikes table                                           │
│        ├─ id (cloud database ID)                             │
│        ├─ user_id                                            │
│        ├─ name, location, length, difficulty                 │
│        ├─ lat, lng                                           │
│        └─ timestamps (createdAt, updatedAt)                  │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │ Response
                   │ { id: "cloud_id" }
                   │
┌──────────────────▼───────────────────────────────────────────┐
│ ANDROID APP                                                  │
│ (Receives Response)                                          │
│                                                              │
│  Extract cloudId                                             │
│  Update Local Hike:                                          │
│  ├─ hike.cloudId = "cloud_id"                               │
│  ├─ hike.syncStatus = 1                                      │
│  ├─ hike.updatedAt = now                                     │
│  │                                                           │
│  └─ Save to SQLite: hikeDao.update(hike)                    │
│                                                              │
│  Hike Now Synced! ✓                                           │
│  └─ Available on cloud                                        │
│  └─ Accessible from other devices                            │
│  └─ Visible in web app                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────┐
│ Sync Operation Started                     │
└──────────────┬───────────────────────────┘
               │
        ┌──────▼──────┐
        │ Try to Sync │
        └──────┬──────┘
               │
        ┌──────▼────────────┐
        │ Catch Exception   │
        └──────┬────────────┘
               │
        ┌──────┴──────────────────────┐
        │                             │
        ▼                             ▼
    IOException            Network/HTTP Error
    (Network Error)         (Server Response)
        │                             │
        ▼                             ▼
    ├─ No Internet        ├─ 401 Unauthorized
    ├─ Timeout            ├─ 400 Bad Request
    ├─ DNS Failure        ├─ 403 Forbidden
    └─ Connection Reset   ├─ 500 Server Error
                          └─ 503 Unavailable
        │                             │
        └──────────┬──────────────────┘
                   │
                   ▼
            ┌────────────────┐
            │ Log Error      │
            │ Message        │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────────────────┐
            │ Callback:                  │
            │ onSyncError(message)       │
            │                            │
            │ UI Shows:                  │
            │ "Sync failed: [message]"   │
            └────────┬───────────────────┘
                     │
                     ▼
            ┌────────────────────────────┐
            │ User Options:              │
            │                            │
            │ 1. Retry Sync              │
            │ 2. Check Network           │
            │ 3. Try Later               │
            └────────────────────────────┘
```

---

## Summary

**Key Points:**

1. **Offline Support**: Hikes created offline have `syncStatus = 0`
2. **Sync Process**: All offline hikes uploaded via bulk operation
3. **Status Update**: After sync, `syncStatus` changes to 1 and `cloudId` is set
4. **Real-time Feedback**: Progress callbacks keep UI updated
5. **Error Handling**: Network errors caught and reported to user
6. **Data Persistence**: All changes persisted to local SQLite
7. **Cloud Integration**: Uses backend `/api/hikes` endpoint with JWT auth

**Architecture Benefits:**

- ✅ Clean separation of concerns (UI, ViewModel, Service, Data)
- ✅ Real-time progress updates
- ✅ Robust error handling
- ✅ Offline-first approach
- ✅ Scalable to batch processing
- ✅ Easy to test each layer

