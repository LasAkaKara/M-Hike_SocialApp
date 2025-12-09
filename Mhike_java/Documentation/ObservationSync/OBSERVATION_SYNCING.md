# Observation Syncing Implementation

## Overview

The M-Hike app now supports **bidirectional syncing of observations** alongside hikes. This allows observations created offline to be uploaded to the cloud backend, and observations from the cloud to be downloaded and stored locally.

## What Changed

### 1. ObservationDao Updates
Added new query methods to support syncing operations:

```java
// Get observations by sync status (for background threads)
@Query("SELECT * FROM observations WHERE syncStatus = :syncStatus ORDER BY createdAt DESC")
List<Observation> getObservationsBySyncStatusSync(int syncStatus);

// Get observation by cloud ID
@Query("SELECT * FROM observations WHERE cloudId = :cloudId LIMIT 1")
Observation getObservationByCloudIdSync(String cloudId);

// Get all observations (for background threads)
@Query("SELECT * FROM observations ORDER BY createdAt DESC")
List<Observation> getAllObservationsSync();

// Permanently delete an observation
@Query("DELETE FROM observations WHERE id = :observationId")
void permanentlyDelete(long observationId);
```

### 2. SyncService Enhancements

#### Constructor Update
Now initializes ObservationDao:
```java
public SyncService(Context context, OkHttpClient httpClient, String authToken) {
    this.context = context.getApplicationContext();
    this.httpClient = httpClient;
    this.authToken = authToken;
    
    AppDatabase database = AppDatabase.getInstance(context);
    this.hikeDao = database.hikeDao();
    this.observationDao = database.observationDao();  // NEW
}
```

#### syncAllOfflineHikes() Method
Enhanced to include observation syncing:

**Before:**
- Only synced hikes with `syncStatus = 0` to the cloud
- Only included hikes in the total sync count

**After:**
- Still syncs hikes with `syncStatus = 0`
- Also syncs observations with `syncStatus = 0`
- Includes both in total sync count and progress tracking
- Updates observation `syncStatus` to `1` after successful upload

```java
public void syncAllOfflineHikes(SyncCallback callback) {
    // Get all offline hikes
    List<Hike> offlineHikes = hikeDao.getHikesBySyncStatusSync(0);
    
    // Get all offline observations (NEW)
    List<Observation> offlineObservations = observationDao.getObservationsBySyncStatusSync(0);
    
    // Get deleted hikes
    List<Hike> deletedHikes = hikeDao.getDeletedHikesSync();
    
    int totalToSync = hikes + observations + deletedHikes;
    
    // ... sync all three types with progress reporting
}
```

#### New Method: syncObservationToCloud()
Handles uploading a single observation to the cloud:

```java
private boolean syncObservationToCloud(Observation observation) {
    // POST to /hikes/{hikeId}/observations
    // Sends: title, time, comments, status, latitude, longitude
    // Returns: cloudId for future reference
    // Note: Image sync is TODO - requires multipart form data
}
```

#### New Method: getOfflineObservationCount()
Returns the count of observations waiting to be synced:

```java
public void getOfflineObservationCount(CountCallback callback) {
    // Get count of observations with syncStatus = 0
    // Returns via callback: onCountReady(count)
}
```

#### New Method: getObservationSyncStatus()
Returns overall observation sync statistics:

```java
public void getObservationSyncStatus(StatusCallback callback) {
    // Returns SyncStatus with:
    // - totalHikes (reused field for observation count)
    // - syncedHikes (reused field for synced observations)
    // - offlineHikes (reused field for offline observations)
    // - syncPercentage (percentage synced)
}
```

### 3. Cloud-to-Offline Syncing

#### Enhanced syncCloudToOffline() Method
Now downloads observations along with hikes:

**Process:**
1. Fetch hikes from cloud (existing)
2. For each hike:
   - Insert hike locally
   - Fetch observations for that hike (NEW)
   - Insert observations locally while mapping:
     - Cloud `id` → local `cloudId`
     - Cloud `hikeId` → local `hikeId` (using inserted hike's ID)
     - Reset local `id` to 0 (let Room auto-generate)
     - Set `syncStatus = 1` (already synced)

#### New Method: fetchObservationsFromCloud()
Fetches observations for a specific hike from the cloud:

```java
private List<Observation> fetchObservationsFromCloud(String hikeCloudId) {
    // GET from /hikes/{hikeCloudId}/observations
    // Parses JSON array of observations
    // Maps cloud 'id' to local 'cloudId'
    // Returns List<Observation>
}
```

## Data Flow

### Offline to Cloud (Upload)

```
User creates observation offline
          ↓
syncStatus = 0, cloudId = null
          ↓
User triggers sync
          ↓
syncObservationToCloud() called
          ↓
POST /hikes/{hikeId}/observations
          ↓
Backend returns observation with ID
          ↓
Update observation:
  - cloudId = returned ID
  - syncStatus = 1
  - updatedAt = now
          ↓
Observation synced ✓
```

### Cloud to Offline (Download)

```
User downloads from cloud
          ↓
fetchObservationsFromCloud(hikeCloudId) called
          ↓
GET /hikes/{hikeCloudId}/observations
          ↓
Parse JSON array of observations
          ↓
For each observation:
  - Check if cloudId already exists locally
  - If not, insert with:
    - id = 0 (auto-generate)
    - hikeId = inserted hike's local ID
    - cloudId = cloud ID
    - syncStatus = 1
          ↓
Observations available locally ✓
```

## Sync Status Values

| Value | Meaning | Action |
|-------|---------|--------|
| 0 | Local only (unsync) | Included in next sync upload |
| 1 | Synced with cloud | Not included in upload sync |

## API Endpoints Used

### Upload Observation
```
POST /hikes/{hikeId}/observations
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "observation title",
  "time": "HH:mm",
  "comments": "optional comments",
  "status": "Open|Verified|Disputed",
  "latitude": optional,
  "longitude": optional
}

Response:
{
  "id": "cloud-id",
  ...observation fields...
}
```

### Download Observations
```
GET /hikes/{hikeCloudId}/observations
Authorization: Bearer {token}

Response:
[
  {
    "id": "cloud-id",
    "title": "observation title",
    "time": "HH:mm",
    "comments": "optional comments",
    "status": "Open|Verified|Disputed",
    "latitude": optional,
    "longitude": optional
  },
  ...more observations...
]
```

## Important Notes

### Image Syncing
⚠️ **Currently Not Implemented**

The observation `imageUri` field is stored locally but not synced to the cloud. To implement image syncing:

1. Use multipart form data instead of JSON
2. Upload image file to `/hikes/{hikeId}/observations/{obsId}/image` endpoint
3. Store returned cloud image URL in `cloudImageUrl` field
4. Update sync methods to handle multipart uploads

### Future Improvements
1. **Delete sync**: Handle deletion of observations on cloud when marked as deleted locally
2. **Conflict resolution**: Handle cases where observation is edited both locally and remotely
3. **Batch operations**: Optimize large observation uploads with batch endpoint
4. **Image compression**: Compress images before upload to save bandwidth

## Testing Checklist

- [ ] Create observation while offline
- [ ] Verify `syncStatus = 0` is set
- [ ] Trigger full sync
- [ ] Verify observation uploaded successfully
- [ ] Verify `syncStatus` updated to `1`
- [ ] Verify `cloudId` is stored
- [ ] Download hikes with observations from cloud
- [ ] Verify observations are inserted with correct `hikeId`
- [ ] Verify `cloudId` mapping is correct
- [ ] Check progress callbacks report observation syncs

## Code Examples

### Check if observations need syncing
```java
syncService.getOfflineObservationCount(new SyncService.CountCallback() {
    @Override
    public void onCountReady(int count) {
        if (count > 0) {
            Toast.makeText(context, count + " observations pending sync", 
                Toast.LENGTH_SHORT).show();
        }
    }
    
    @Override
    public void onError(String errorMessage) {
        Log.e("ObsSync", "Error: " + errorMessage);
    }
});
```

### Get observation sync percentage
```java
syncService.getObservationSyncStatus(new SyncService.StatusCallback() {
    @Override
    public void onStatusReady(SyncService.SyncStatus status) {
        String msg = String.format(
            "Observations: %d/%d (%d%% synced)",
            status.syncedHikes,  // reused field
            status.totalHikes,   // reused field
            status.syncPercentage
        );
        Log.d("ObsSync", msg);
    }
    
    @Override
    public void onError(String errorMessage) {
        Log.e("ObsSync", "Error: " + errorMessage);
    }
});
```

## Integration Points

This feature integrates with:
- **SyncFragment**: UI for sync progress (can display observation counts)
- **AddObservationActivity**: Creates observations with `syncStatus = 0`
- **ObservationViewModel**: Manages observation lifecycle
- **Backend API**: `/hikes/{id}/observations` endpoints

## Summary

The observation syncing feature enables:
✅ Offline observation creation
✅ Automatic cloud upload when online
✅ Cloud observation download to local database
✅ Deduplication via `cloudId` tracking
✅ Progress reporting for both hikes and observations
✅ Consistent sync status management across all offline data

