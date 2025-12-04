# Offline Database Sync System

Complete documentation for the offline database sync functionality in M-Hike.

---

## Overview

The Offline Database Sync System allows users to:
- Create and manage hikes offline
- Automatically track sync status
- Bulk sync offline hikes to the cloud backend
- Monitor sync progress in real-time
- Handle sync errors gracefully

---

## Architecture

### Components

1. **SyncService** - Core sync logic
   - Manages API communication with backend
   - Updates sync status in local database
   - Handles error handling and retries
   - Tracks sync statistics

2. **HikeViewModel** - Business logic layer
   - Exposes sync methods to UI
   - Manages sync state (loading, success, error)
   - Integrates with database layer

3. **SyncFragment** - User interface
   - Displays sync status and progress
   - Triggers sync operations
   - Shows real-time progress updates

4. **Hike Entity** - Data model
   - `syncStatus` field (0 = offline, 1 = synced)
   - `cloudId` field for tracking cloud references
   - Timestamps for sync management

---

## Data Models

### Hike Entity Fields

```java
public class Hike {
    public long id;              // Local database ID
    public String cloudId;       // Cloud database ID (when synced)
    public String name;
    public String location;
    public String date;
    public String time;
    public float length;
    public String difficulty;
    public String description;
    public String privacy;
    public int syncStatus;       // 0 = offline, 1 = synced
    public float latitude;
    public float longitude;
    public long createdAt;
    public long updatedAt;
}
```

### SyncResult Class

```java
public static class SyncResult {
    public int totalHikes;           // Total hikes in sync operation
    public int successfulUploads;    // Successfully synced hikes
    public int failedUploads;        // Failed sync attempts
    public int skippedHikes;         // Skipped hikes
    public long syncDuration;        // Time taken (milliseconds)
}
```

### SyncStatus Class

```java
public static class SyncStatus {
    public int totalHikes;          // Total hikes in database
    public int syncedHikes;         // Already synced hikes
    public int offlineHikes;        // Waiting to be synced
    public int syncPercentage;      // Percentage synced (0-100)
}
```

---

## API Workflow

### 1. Sync Operation Sequence

```
User clicks "Sync" button
    ↓
HikeViewModel.syncOfflineHikesToCloud()
    ↓
SyncService.syncAllOfflineHikes()
    ↓
For each offline hike (syncStatus = 0):
    - POST /api/hikes with hike data
    - Receive cloudId from backend
    - Update local hike:
        * Set syncStatus = 1
        * Set cloudId = response.id
        * Update updatedAt timestamp
    - Update in local database
    ↓
Return SyncResult with statistics
    ↓
UI updates with results
```

### 2. Single Hike Sync (Async)

```
SyncService.syncHikeAsync(hike, callback)
    ↓
POST /api/hikes
    ↓
On Success:
    - Update hike.syncStatus = 1
    - Update hike.cloudId
    - Save to database
    - Callback.onSyncSuccess()
    ↓
On Failure:
    - Callback.onSyncError()
```

---

## Usage

### Basic Sync Operation

```java
// In a Fragment or Activity
String authToken = authService.getToken();
viewModel.syncOfflineHikesToCloud(authToken, new SyncService.SyncCallback() {
    @Override
    public void onSyncStart(int totalHikes) {
        progressBar.setMax(totalHikes);
        statusText.setText("Syncing " + totalHikes + " hikes...");
    }
    
    @Override
    public void onSyncProgress(int completed, int total) {
        progressBar.setProgress(completed);
        progressText.setText(completed + "/" + total);
    }
    
    @Override
    public void onSyncSuccess(SyncService.SyncResult result) {
        String msg = "Synced: " + result.successfulUploads + 
                     ", Failed: " + result.failedUploads;
        showSnackbar(msg);
    }
    
    @Override
    public void onSyncError(String errorMessage) {
        showSnackbar("Error: " + errorMessage);
    }
});
```

### Check Sync Status

```java
viewModel.getSyncStatus(authToken, new SyncService.StatusCallback() {
    @Override
    public void onStatusReady(SyncService.SyncStatus status) {
        statusText.setText("Total: " + status.totalHikes + 
                          "\nSynced: " + status.syncedHikes +
                          "\nOffline: " + status.offlineHikes +
                          "\nProgress: " + status.syncPercentage + "%");
    }
    
    @Override
    public void onError(String errorMessage) {
        showSnackbar("Error: " + errorMessage);
    }
});
```

### Get Offline Hike Count

```java
viewModel.getOfflineHikeCount(authToken, new SyncService.CountCallback() {
    @Override
    public void onCountReady(int count) {
        syncButton.setText("Sync " + count + " Hikes");
    }
    
    @Override
    public void onError(String errorMessage) {
        Log.e(TAG, errorMessage);
    }
});
```

### Sync Single Hike

```java
String authToken = authService.getToken();
SyncService syncService = new SyncService(context, httpClient, authToken);

syncService.syncHikeAsync(hike, new SyncService.SyncCallback() {
    @Override
    public void onSyncSuccess(SyncService.SyncResult result) {
        showSnackbar("Hike synced successfully");
    }
    
    @Override
    public void onSyncError(String errorMessage) {
        showSnackbar("Sync failed: " + errorMessage);
    }
});
```

---

## UI Components

### SyncFragment

A complete fragment with:
- Real-time sync status display
- Progress bar showing sync completion
- Action buttons (Sync, Refresh Status)
- Sync results display
- Information section

**Layout:** `fragment_sync.xml`

**Features:**
- Displays total, synced, and offline hike counts
- Shows sync progress percentage
- Real-time progress updates during sync
- Error handling with user feedback
- Auto-enables/disables buttons based on state

---

## Database Queries

### Get Offline Hikes

```java
// Synchronous
List<Hike> offlineHikes = hikeDao.getHikesBySyncStatus(0);

// Asynchronous (LiveData)
LiveData<List<Hike>> offlineHikes = hikeDao.getHikesBySyncStatus(0);
```

### Update Hike Sync Status

```java
hike.syncStatus = 1;  // Mark as synced
hike.updatedAt = System.currentTimeMillis();
hikeDao.update(hike);
```

### Get Sync Statistics

```java
List<Hike> allHikes = hikeDao.getAllHikesSync();

int synced = 0;
int offline = 0;

for (Hike hike : allHikes) {
    if (hike.syncStatus == 1) synced++;
    else offline++;
}

int percentage = (synced * 100) / allHikes.size();
```

---

## Backend API Integration

### Create Hike Endpoint

**POST** `/api/hikes`

**Request Body:**
```json
{
  "userId": 1,
  "name": "Mount Everest Base Camp",
  "location": "Nepal",
  "length": 65.5,
  "difficulty": "Hard",
  "description": "Amazing trek",
  "privacy": "public",
  "lat": 28.0,
  "lng": 86.5
}
```

**Response:**
```json
{
  "id": "12345",
  "userId": 1,
  "name": "Mount Everest Base Camp",
  "location": "Nepal",
  "length": 65.5,
  "difficulty": "Hard",
  "description": "Amazing trek",
  "privacy": "public",
  "lat": 28.0,
  "lng": 86.5,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Error Handling

### Common Sync Errors

1. **Network Error**
   - No internet connection
   - Timeout during upload
   - Server temporarily unavailable
   - **Solution:** Retry sync when connection restored

2. **Authentication Error**
   - Invalid or expired token
   - User not logged in
   - **Solution:** Redirect to login

3. **Validation Error**
   - Missing required fields
   - Invalid data format
   - **Solution:** Show field-specific error messages

4. **Server Error**
   - Database constraints
   - Server-side validation
   - **Solution:** Show user-friendly error message

### Error Recovery

```java
@Override
public void onSyncError(String errorMessage) {
    // Determine error type
    if (errorMessage.contains("Network")) {
        showSnackbar("No internet connection. Check your network.");
    } else if (errorMessage.contains("401")) {
        showSnackbar("Session expired. Please log in again.");
        navigateToLogin();
    } else if (errorMessage.contains("400")) {
        showSnackbar("Invalid hike data. Please review your hikes.");
    } else {
        showSnackbar("Sync failed. Please try again later.");
    }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Sequential vs Batch Processing**
   - Current: Sequential (one hike at a time)
   - Advantage: Better error isolation
   - Disadvantage: Slower for large datasets

2. **To Implement Batch Processing:**
   - Group hikes into batches of 5-10
   - Upload batches in parallel
   - Reduce total sync time

3. **To Implement Background Sync:**
   - Use WorkManager or JobScheduler
   - Schedule sync when connected to WiFi
   - Sync during off-peak hours

### Memory Management

- Use `getAllHikesSync()` for background threads
- Use `LiveData` for UI-bound operations
- Clear progress callbacks after completion
- Release resources in `onDestroy()`

---

## Future Enhancements

### Planned Features

1. **Incremental Sync**
   - Only sync modified hikes
   - Track last sync timestamp
   - Delta sync mechanism

2. **Batch Upload**
   - Combine multiple hikes in single request
   - Reduce HTTP overhead
   - Faster sync for large datasets

3. **Conflict Resolution**
   - Handle offline edits to synced hikes
   - Merge strategies
   - User conflict resolution UI

4. **Background Sync**
   - Auto-sync when WiFi connected
   - Scheduled sync intervals
   - Battery-aware scheduling

5. **Selective Sync**
   - Choose which hikes to sync
   - Filter by date, difficulty, etc.
   - Bulk operations

6. **Sync Notifications**
   - Progress notifications
   - Sync completion alerts
   - Error notifications

7. **Sync History**
   - Track sync attempts
   - Timestamp of last sync
   - Retry history

---

## Configuration

### Current Settings

```java
// In SyncService.java
private static final String BASE_URL = 
    "https://kandis-nonappealable-flatly.ngrok-free.dev/api";

// Sync strategy
private boolean syncSequentially = true;  // One at a time

// Timeout settings
private static final long CONNECT_TIMEOUT = 30;  // seconds
private static final long READ_TIMEOUT = 30;     // seconds
```

### To Modify

```java
// For batch sync:
SyncService.setBatchSize(10);

// For auto-sync:
SyncService.setAutoSyncEnabled(true);
SyncService.setAutoSyncInterval(60);  // minutes

// For timeouts:
SyncService.setConnectTimeout(60);
SyncService.setReadTimeout(60);
```

---

## Testing

### Manual Testing Workflow

1. **Create offline hikes**
   - Add hikes with device in airplane mode or without auth
   - Verify syncStatus = 0 in database

2. **Test status check**
   - Open Sync UI
   - Verify offline hike count matches

3. **Test sync**
   - Enable network
   - Click sync button
   - Monitor progress bar
   - Verify success results

4. **Verify cloud upload**
   - Check backend database
   - Confirm all hikes present
   - Verify user associations correct

5. **Test error handling**
   - Disconnect network mid-sync
   - Verify error message displayed
   - Verify sync can be retried

### Unit Tests

```java
@Test
public void testSyncStatusUpdate() {
    // Create offline hike
    Hike hike = new Hike("Test", "Location", "2024-01-15", 
                        "10:00", 5.0f, "Easy", true);
    hike.syncStatus = 0;
    hikeDao.insert(hike);
    
    // Run sync
    syncService.syncHikeAsync(hike, callback);
    
    // Verify status updated
    Hike synced = hikeDao.getHikeById(hike.id);
    assertEquals(1, synced.syncStatus);
    assertNotNull(synced.cloudId);
}
```

---

## Troubleshooting

### Sync Not Working

**Problem:** Sync button shows but doesn't sync
- Check authentication token is valid
- Verify internet connection
- Check server is running
- Review logcat for errors

**Solution:**
```
1. Verify in logcat: "AuthService: Successfully signed in"
2. Check network connectivity
3. Verify backend URL is correct
4. Check JWT token is not expired
```

### Stuck on Progress

**Problem:** Sync seems to hang on specific hike
- Network timeout
- Server processing
- Very large hike data

**Solution:**
```
1. Implement timeout
2. Show timeout error to user
3. Allow manual retry
4. Check hike data is valid
```

### Database Not Updating

**Problem:** Sync shows success but syncStatus not updated
- Transaction not committing
- Database locked
- Concurrency issue

**Solution:**
```
1. Use transactions
2. Add synchronization
3. Use Room's built-in transaction handling
4. Check no concurrent access
```

---

## Code Examples

### Complete Sync Implementation

```java
// In HomeFragment.java
private void performSync() {
    String authToken = authService.getToken();
    
    viewModel.syncOfflineHikesToCloud(authToken, 
        new SyncService.SyncCallback() {
            @Override
            public void onSyncStart(int totalHikes) {
                showProgressDialog(totalHikes);
            }
            
            @Override
            public void onSyncProgress(int completed, int total) {
                updateProgressBar(completed, total);
            }
            
            @Override
            public void onSyncSuccess(SyncService.SyncResult result) {
                dismissProgressDialog();
                showSuccessMessage(result);
                // Refresh UI to show updated sync status
                refreshHikeList();
            }
            
            @Override
            public void onSyncError(String errorMessage) {
                dismissProgressDialog();
                showErrorMessage(errorMessage);
            }
        }
    );
}
```

---

## Support & Maintenance

For issues or feature requests, refer to:
- Backend API Documentation
- Database Schema Documentation
- Android Architecture Components Guide

