# Quick Integration Guide - Sync Feature

## 5-Minute Setup

### Step 1: Add Sync to Navigation (Optional)

If you want to add Sync as a menu item in the bottom navigation:

**File:** `app/src/main/res/menu/menu_bottom_navigation.xml`

```xml
<item
    android:id="@+id/syncFragment"
    android:title="@string/sync"
    app:showAsAction="never" />
```

**File:** `app/src/main/res/values/strings.xml`

```xml
<string name="sync">Sync</string>
```

### Step 2: Update MainActivity Navigation

**File:** `ui/MainActivity.java`

Add to navigation listener:

```java
case R.id.syncFragment:
    currentFragment = SyncFragment.newInstance();
    break;
```

### Step 3: Test the Feature

1. **Create offline hikes**
   - Enable airplane mode or disconnect internet
   - Add hikes normally
   - Hikes will have `syncStatus = 0`

2. **Open Sync UI**
   - Navigate to Sync fragment
   - Click "Refresh Status" button
   - See offline hike count

3. **Enable network and sync**
   - Reconnect to internet
   - Click "Sync Offline Hikes"
   - Watch progress bar
   - See success results

---

## Core Components Overview

### SyncService.java
**Location:** `services/SyncService.java`

**Main Methods:**
```java
// Sync all offline hikes
syncAllOfflineHikes(SyncCallback callback)

// Sync single hike
syncHikeAsync(Hike hike, SyncCallback callback)

// Get offline hike count
getOfflineHikeCount(CountCallback callback)

// Get sync status
getSyncStatus(StatusCallback callback)
```

### HikeViewModel.java
**Location:** `ui/viewmodels/HikeViewModel.java`

**New Methods:**
```java
// Main sync method
syncOfflineHikesToCloud(String authToken, SyncCallback callback)

// Check status
getSyncStatus(String authToken, StatusCallback callback)

// Get count
getOfflineHikeCount(String authToken, CountCallback callback)
```

### SyncFragment.java
**Location:** `ui/sync/SyncFragment.java`

**Features:**
- Status display with hike counts
- Progress bar
- Sync button
- Status refresh button
- Results display

---

## Usage in Your Code

### Example 1: Sync from HomeFragment

```java
// In HomeFragment.java
private void setupSyncButton() {
    Button syncButton = rootView.findViewById(R.id.syncButton);
    syncButton.setOnClickListener(v -> {
        String authToken = authService.getToken();
        
        viewModel.syncOfflineHikesToCloud(authToken, 
            new SyncService.SyncCallback() {
                @Override
                public void onSyncStart(int totalHikes) {
                    showProgressDialog();
                }
                
                @Override
                public void onSyncProgress(int completed, int total) {
                    updateProgressBar(completed, total);
                }
                
                @Override
                public void onSyncSuccess(SyncService.SyncResult result) {
                    dismissProgressDialog();
                    showSnackbar("Synced " + result.successfulUploads + " hikes");
                    refreshHikeList();
                }
                
                @Override
                public void onSyncError(String errorMessage) {
                    dismissProgressDialog();
                    showSnackbar("Error: " + errorMessage);
                }
            }
        );
    });
}
```

### Example 2: Check Sync Status

```java
// In any Fragment/Activity
private void checkOfflineHikes() {
    String authToken = authService.getToken();
    
    viewModel.getOfflineHikeCount(authToken, 
        new SyncService.CountCallback() {
            @Override
            public void onCountReady(int count) {
                if (count > 0) {
                    showNotification("You have " + count + " offline hikes");
                } else {
                    showNotification("All hikes are synced");
                }
            }
            
            @Override
            public void onError(String errorMessage) {
                Log.e(TAG, "Error: " + errorMessage);
            }
        }
    );
}
```

### Example 3: Display Sync Status

```java
// In ProfileFragment or SettingsFragment
private void displaySyncStatus() {
    String authToken = authService.getToken();
    
    viewModel.getSyncStatus(authToken, 
        new SyncService.StatusCallback() {
            @Override
            public void onStatusReady(SyncService.SyncStatus status) {
                String statusText = String.format(
                    "Total: %d | Synced: %d | Offline: %d | Progress: %d%%",
                    status.totalHikes,
                    status.syncedHikes,
                    status.offlineHikes,
                    status.syncPercentage
                );
                statusView.setText(statusText);
            }
            
            @Override
            public void onError(String errorMessage) {
                statusView.setText("Error: " + errorMessage);
            }
        }
    );
}
```

---

## Data Flow

### Creating Offline Hike

```
User adds hike (no internet)
    ↓
Hike.syncStatus = 0 (default)
    ↓
Hike saved to local database
    ↓
Hike available in app
    ↓
Ready for sync when connected
```

### Syncing Hike

```
User connects to internet
    ↓
User opens Sync UI
    ↓
Click "Sync Offline Hikes"
    ↓
POST /api/hikes with hike data
    ↓
Backend creates hike
    ↓
Backend returns cloudId
    ↓
App updates local hike:
  - syncStatus = 1
  - cloudId = response.id
  - updatedAt = now
    ↓
Local database updated
    ↓
UI shows success
```

---

## API Connection Details

### Endpoint
```
POST https://kandis-nonappealable-flatly.ngrok-free.dev/api/hikes
```

### Request Body
```json
{
  "userId": 1,
  "name": "Hike Name",
  "location": "Location",
  "length": 5.5,
  "difficulty": "Easy",
  "description": "Description",
  "privacy": "public",
  "lat": 40.7128,
  "lng": -74.0060
}
```

### Response
```json
{
  "id": "cloud_database_id",
  "userId": 1,
  "name": "Hike Name",
  ...
}
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Database

### Hike Fields

| Field | Type | Purpose |
|-------|------|---------|
| `id` | long | Local database ID |
| `cloudId` | String | Cloud database reference |
| `name` | String | Hike name |
| `location` | String | Hike location |
| `length` | float | Hike length (km) |
| `difficulty` | String | Easy/Medium/Hard |
| `description` | String | Hike description |
| `privacy` | String | Public/Private |
| `syncStatus` | int | 0=offline, 1=synced |
| `latitude` | float | GPS latitude |
| `longitude` | float | GPS longitude |
| `createdAt` | long | Creation timestamp |
| `updatedAt` | long | Last update timestamp |

### Query Examples

```java
// Get offline hikes
List<Hike> offlineHikes = hikeDao.getHikesBySyncStatus(0);

// Get synced hikes
List<Hike> syncedHikes = hikeDao.getHikesBySyncStatus(1);

// Get all hikes (live)
LiveData<List<Hike>> allHikes = hikeDao.getAllHikes();
```

---

## Callbacks Reference

### SyncCallback

```java
public interface SyncCallback {
    // Called when sync starts with total count
    void onSyncStart(int totalHikes);
    
    // Called for each hike synced
    void onSyncProgress(int completed, int total);
    
    // Called on successful completion
    void onSyncSuccess(SyncService.SyncResult result);
    
    // Called on error
    void onSyncError(String errorMessage);
}
```

### CountCallback

```java
public interface CountCallback {
    // Called with offline hike count
    void onCountReady(int count);
    
    // Called on error
    void onError(String errorMessage);
}
```

### StatusCallback

```java
public interface StatusCallback {
    // Called with sync status
    void onStatusReady(SyncService.SyncStatus status);
    
    // Called on error
    void onError(String errorMessage);
}
```

---

## Common Tasks

### Task 1: Show Sync Button Only If Offline Hikes Exist

```java
viewModel.getOfflineHikeCount(authToken, 
    new SyncService.CountCallback() {
        @Override
        public void onCountReady(int count) {
            syncButton.setVisibility(count > 0 ? View.VISIBLE : View.GONE);
        }
        
        @Override
        public void onError(String errorMessage) {
            syncButton.setVisibility(View.GONE);
        }
    }
);
```

### Task 2: Auto-Sync on App Start

```java
@Override
public void onStart() {
    super.onStart();
    
    String authToken = authService.getToken();
    if (authToken != null) {
        // Auto-check if sync needed
        viewModel.getOfflineHikeCount(authToken, 
            new SyncService.CountCallback() {
                @Override
                public void onCountReady(int count) {
                    if (count > 0) {
                        showSyncReminder(count);
                    }
                }
                
                @Override
                public void onError(String errorMessage) {
                    Log.e(TAG, errorMessage);
                }
            }
        );
    }
}
```

### Task 3: Sync Notification

```java
viewModel.syncOfflineHikesToCloud(authToken, 
    new SyncService.SyncCallback() {
        @Override
        public void onSyncSuccess(SyncService.SyncResult result) {
            // Show notification
            showNotification(
                "Sync Complete",
                "Uploaded " + result.successfulUploads + " hikes"
            );
        }
        
        @Override
        public void onSyncError(String errorMessage) {
            showNotification("Sync Failed", errorMessage);
        }
    }
);
```

---

## Troubleshooting

### Issue: Sync Not Working

**Check:**
1. Is user authenticated? 
   - `authService.getToken()` should return non-null
2. Is internet connected?
   - Enable mobile data or WiFi
3. Are there offline hikes?
   - Open Sync UI → check offline count
4. Check logcat for errors
   - Filter by tag "SyncService"

**Solution:**
```java
// Debug sync
Log.d("SyncService", "Token: " + authToken);
Log.d("SyncService", "Starting sync...");
// Check logcat for errors
```

### Issue: Sync Succeeds But syncStatus Not Updated

**Check:**
1. Database transaction completed?
2. No concurrent access?
3. Hike object properly updated?

**Solution:**
```java
// Verify after sync
Hike hike = hikeDao.getHikeById(hikeId);
Log.d("SyncService", "SyncStatus: " + hike.syncStatus);
Log.d("SyncService", "CloudId: " + hike.cloudId);
```

### Issue: Network Timeout

**Check:**
1. Server is running?
2. ngrok URL is current?
3. Network is stable?

**Solution:**
```java
// Update BASE_URL in SyncService if needed
private static final String BASE_URL = 
    "your_new_ngrok_url/api";
```

---

## Files Created

- ✅ `services/SyncService.java` - Core sync engine
- ✅ `ui/sync/SyncFragment.java` - UI component
- ✅ `res/layout/fragment_sync.xml` - Layout
- ✅ `OFFLINE_SYNC_GUIDE.md` - Complete documentation
- ✅ `SYNC_IMPLEMENTATION_SUMMARY.md` - Implementation details

## Files Updated

- ✅ `ui/viewmodels/HikeViewModel.java` - Added sync methods

---

## Next Steps

1. ✅ Review the components
2. ✅ Test offline hike creation
3. ✅ Test sync functionality
4. ✅ Integrate into navigation
5. ✅ Deploy to production

---

## Support Resources

- **Full Documentation:** `OFFLINE_SYNC_GUIDE.md`
- **Implementation Details:** `SYNC_IMPLEMENTATION_SUMMARY.md`
- **Backend API:** `API_DOCUMENTATION.md`
- **Advanced Features:** `ADVANCED_FEATURES.md`

