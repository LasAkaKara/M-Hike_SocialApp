# Observation Syncing - Quick Reference

## Files Modified

### 1. ObservationDao.java
**Location:** `app/src/main/java/com/example/mhike/database/daos/ObservationDao.java`

**Changes:**
- Added `getObservationsBySyncStatusSync(int syncStatus)` - Get unsynced observations
- Added `getObservationByCloudIdSync(String cloudId)` - Check for duplicates
- Added `getAllObservationsSync()` - Get all observations for status reporting
- Added `permanentlyDelete(long observationId)` - Delete synced observations

### 2. SyncService.java
**Location:** `app/src/main/java/com/example/mhike/services/SyncService.java`

**Changes:**

#### Constructor
- Added `ObservationDao observationDao` field
- Initialize observationDao in constructor

#### syncAllOfflineHikes()
- Now gets observations with `getObservationsBySyncStatusSync(0)`
- Includes observations in total sync count
- Syncs observations using `syncObservationToCloud()`
- Updates observation `syncStatus` to 1 after successful upload
- Reports progress for both hikes and observations

#### New Methods
1. **syncObservationToCloud(Observation)**
   - POST to `/hikes/{hikeId}/observations`
   - Returns true if successful
   - Stores cloudId from response

2. **getOfflineObservationCount(CountCallback)**
   - Returns count of unsync observations
   - Runs on background thread

3. **getObservationSyncStatus(StatusCallback)**
   - Returns total/synced/offline observation counts
   - Returns sync percentage
   - Runs on background thread

4. **fetchObservationsFromCloud(String hikeCloudId)**
   - Fetches observations for a hike from cloud
   - Parses JSON array response
   - Maps cloud ID to local cloudId
   - Returns List<Observation>

#### syncCloudToOffline()
- For each downloaded hike, now calls `fetchObservationsFromCloud()`
- Inserts observations with proper field mapping
- Avoids duplicates by checking cloudId
- Handles insertion errors gracefully

## Sync Flow Summary

```
┌─────────────────────────────────────────┐
│   User Creates Observation Offline      │
│   (syncStatus = 0, cloudId = null)      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   User Triggers Sync                    │
│   syncAllOfflineHikes(callback)         │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   Sync Hikes      Sync Observations
   syncStatus:0    syncStatus:0
        │                 │
        ▼                 ▼
   POST /hikes     POST /hikes/{id}/obs
        │                 │
        └────────┬────────┘
                 │
                 ▼
   ┌──────────────────────────┐
   │ Update All Entities:     │
   │ - cloudId = returned ID  │
   │ - syncStatus = 1         │
   │ - updatedAt = now        │
   └────────────┬─────────────┘
                │
                ▼
   ┌──────────────────────────┐
   │  Sync Complete ✓         │
   │  All data on cloud       │
   └──────────────────────────┘
```

## API Contract

### Upload Single Observation
```
POST /hikes/{hikeId}/observations
Authorization: Bearer {token}

Request:
{
  "title": "string",
  "time": "HH:mm",
  "comments": "string (optional)",
  "status": "Open|Verified|Disputed",
  "latitude": number (optional),
  "longitude": number (optional)
}

Response (200 OK):
{
  "id": "cloud-id",
  "hikeId": hikeId,
  "title": "string",
  "time": "HH:mm",
  "comments": "string",
  "status": "string",
  "latitude": number,
  "longitude": number,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Fetch Observations for Hike
```
GET /hikes/{hikeCloudId}/observations
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": "cloud-id",
    "hikeId": hikeCloudId,
    "title": "string",
    ...
  },
  ...
]
```

## Usage Examples

### Manual Observation Count Check
```java
SyncService syncService = new SyncService(context, httpClient, token);

syncService.getOfflineObservationCount(new SyncService.CountCallback() {
    @Override
    public void onCountReady(int count) {
        System.out.println("Observations pending: " + count);
    }
    
    @Override
    public void onError(String error) {
        System.err.println("Error: " + error);
    }
});
```

### Get Observation Sync Status
```java
syncService.getObservationSyncStatus(new SyncService.StatusCallback() {
    @Override
    public void onStatusReady(SyncService.SyncStatus status) {
        // status.totalHikes = observation count
        // status.syncedHikes = synced observations
        // status.offlineHikes = unsynced observations
        // status.syncPercentage = percent synced
        String msg = String.format("Observations: %d/%d synced (%d%%)",
            status.syncedHikes, status.totalHikes, status.syncPercentage);
        System.out.println(msg);
    }
    
    @Override
    public void onError(String error) {
        System.err.println("Error: " + error);
    }
});
```

### Trigger Full Sync (Hikes + Observations)
```java
syncService.syncAllOfflineHikes(new SyncService.SyncCallback() {
    @Override
    public void onSyncStart(int totalItems) {
        System.out.println("Syncing " + totalItems + " items (hikes + observations)");
    }
    
    @Override
    public void onSyncProgress(int completed, int total) {
        int percent = (completed * 100) / total;
        System.out.println("Progress: " + completed + "/" + total + " (" + percent + "%)");
    }
    
    @Override
    public void onSyncSuccess(SyncService.SyncResult result) {
        System.out.println("Sync complete!");
        System.out.println("- Successful: " + result.successfulUploads);
        System.out.println("- Failed: " + result.failedUploads);
    }
    
    @Override
    public void onSyncError(String error) {
        System.err.println("Sync failed: " + error);
    }
});
```

### Download Hikes + Observations from Cloud
```java
syncService.syncCloudToOffline(new SyncService.CloudSyncCallback() {
    @Override
    public void onCloudSyncStart() {
        System.out.println("Downloading hikes and observations...");
    }
    
    @Override
    public void onCloudSyncProgress(int completed, int total) {
        System.out.println("Downloaded: " + completed + "/" + total);
    }
    
    @Override
    public void onCloudSyncSuccess(SyncService.CloudSyncResult result) {
        System.out.println("Download complete!");
        System.out.println("- Total items: " + result.totalDownloaded);
        System.out.println("- Inserted: " + result.successfulInserts);
        System.out.println("- Skipped duplicates: " + result.skippedDuplicates);
    }
    
    @Override
    public void onCloudSyncError(String error) {
        System.err.println("Download failed: " + error);
    }
});
```

## Key Design Decisions

1. **Reused SyncStatus Fields**: The `SyncStatus` class reuses `totalHikes`, `syncedHikes`, and `offlineHikes` fields for observation statistics. This maintains backward compatibility while extending functionality.

2. **Background Threads**: All sync operations run on background threads to prevent UI blocking. Main thread callbacks via Handler.

3. **Deduplication**: Uses `cloudId` to prevent duplicate downloads from cloud.

4. **Cascading Sync**: Observations are synced immediately after their parent hike, ensuring proper relationship mapping.

5. **Image Sync TODO**: Image upload is not yet implemented due to complexity of multipart form data handling. Will require separate implementation.

## Testing Scenarios

1. **Create offline, sync online**
   - Create observation in offline mode
   - Go online and trigger sync
   - Verify cloudId is stored
   - Verify syncStatus changed to 1

2. **Download from cloud**
   - Download hikes from cloud
   - Verify observations auto-download
   - Verify proper hikeId mapping
   - Verify no duplicates

3. **Mixed sync**
   - Have offline observations
   - Download new hikes with observations
   - Sync everything in one operation
   - Verify all progress callbacks fire

4. **Error handling**
   - Simulate network failure
   - Verify error callback is triggered
   - Verify partial sync is handled
   - Verify retryable state preserved

## Notes

- Observations sync include hike time (`time`), title, comments, location (lat/lng), and status
- Image syncing requires future implementation with multipart uploads
- Empty observations arrays are handled gracefully
- Network errors are logged and reported via callbacks
- All operations are thread-safe using background threads

