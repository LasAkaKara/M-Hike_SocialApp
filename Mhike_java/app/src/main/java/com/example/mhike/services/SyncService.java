package com.example.mhike.services;

import android.content.Context;
import android.util.Log;

import com.example.mhike.database.AppDatabase;
import com.example.mhike.database.daos.HikeDao;
import com.example.mhike.database.entities.Hike;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * SyncService - Handles syncing offline hikes to the cloud backend
 * Manages bulk uploads, sync status updates, and conflict resolution
 */
public class SyncService {
    
    private static final String TAG = "SyncService";
    private static final String BASE_URL = "https://kandis-nonappealable-flatly.ngrok-free.dev/api";
    
    private final Context context;
    private final OkHttpClient httpClient;
    private final HikeDao hikeDao;
    private final String authToken;
    
    // Callback interface for sync operations
    public interface SyncCallback {
        void onSyncStart(int totalHikes);
        void onSyncProgress(int completed, int total);
        void onSyncSuccess(SyncResult result);
        void onSyncError(String errorMessage);
    }
    
    /**
     * Result object containing sync statistics
     */
    public static class SyncResult {
        public int totalHikes;
        public int successfulUploads;
        public int failedUploads;
        public int skippedHikes;
        public long syncDuration;
        
        @Override
        public String toString() {
            return "SyncResult{" +
                    "totalHikes=" + totalHikes +
                    ", successfulUploads=" + successfulUploads +
                    ", failedUploads=" + failedUploads +
                    ", skippedHikes=" + skippedHikes +
                    ", syncDuration=" + syncDuration + "ms" +
                    '}';
        }
    }
    
    public SyncService(Context context, OkHttpClient httpClient, String authToken) {
        this.context = context.getApplicationContext();
        this.httpClient = httpClient;
        this.authToken = authToken;
        
        AppDatabase database = AppDatabase.getInstance(context);
        this.hikeDao = database.hikeDao();
    }
    
    /**
     * Sync all offline hikes to the cloud
     * Hikes with syncStatus = 0 will be uploaded, and syncStatus will be updated to 1
     */
    public void syncAllOfflineHikes(SyncCallback callback) {
        new Thread(() -> {
            try {
                long startTime = System.currentTimeMillis();
                SyncResult result = new SyncResult();
                
                // Get all offline hikes (syncStatus = 0) - using sync method for background thread
                List<Hike> offlineHikes = hikeDao.getHikesBySyncStatusSync(0);
                
                if (offlineHikes == null || offlineHikes.isEmpty()) {
                    result.totalHikes = 0;
                    result.successfulUploads = 0;
                    result.failedUploads = 0;
                    result.skippedHikes = 0;
                    result.syncDuration = System.currentTimeMillis() - startTime;
                    
                    if (callback != null) {
                        callback.onSyncSuccess(result);
                    }
                    return;
                }
                
                result.totalHikes = offlineHikes.size();
                if (callback != null) {
                    callback.onSyncStart(result.totalHikes);
                }
                
                // Sync hikes sequentially to maintain order and proper error handling
                int completedCount = 0;
                for (Hike hike : offlineHikes) {
                    if (syncHikeToCloud(hike)) {
                        // Update sync status to 1 (synced)
                        hike.syncStatus = 1;
                        hike.updatedAt = System.currentTimeMillis();
                        hikeDao.update(hike);
                        result.successfulUploads++;
                    } else {
                        result.failedUploads++;
                    }
                    
                    completedCount++;
                    if (callback != null) {
                        callback.onSyncProgress(completedCount, result.totalHikes);
                    }
                }
                
                result.syncDuration = System.currentTimeMillis() - startTime;
                
                if (callback != null) {
                    callback.onSyncSuccess(result);
                }
            } catch (Exception e) {
                Log.e(TAG, "Sync error: " + e.getMessage(), e);
                if (callback != null) {
                    callback.onSyncError("Sync failed: " + e.getMessage());
                }
            }
        }).start();
    }
    
    /**
     * Sync a single hike to the cloud
     * Returns true if successful, false otherwise
     */
    private boolean syncHikeToCloud(Hike hike) {
        try {
            String url = BASE_URL + "/hikes";
            
            // Build request body from hike object
            JsonObject body = new JsonObject();
            body.addProperty("userId", 1); // TODO: Get actual user ID from auth
            body.addProperty("name", hike.name);
            body.addProperty("location", hike.location);
            body.addProperty("length", hike.length);
            body.addProperty("difficulty", hike.difficulty);
            body.addProperty("description", hike.description != null ? hike.description : "");
            body.addProperty("privacy", hike.privacy);
            body.addProperty("lat", hike.latitude);
            body.addProperty("lng", hike.longitude);
            
            RequestBody requestBody = RequestBody.create(
                body.toString(),
                MediaType.parse("application/json")
            );
            
            Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + authToken)
                .build();
            
            // Make synchronous call
            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    try {
                        assert response.body() != null;
                        JSONObject responseJson = new JSONObject(response.body().string());
                        String cloudId = responseJson.optString("id");
                        
                        // Store cloud ID for future updates
                        hike.cloudId = cloudId;
                        Log.d(TAG, "Successfully synced hike: " + hike.name + " with cloud ID: " + cloudId);
                        return true;
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to parse response: " + e.getMessage());
                        return false;
                    }
                } else {
                    assert response.body() != null;
                    String errorBody = response.body().string();
                    Log.e(TAG, "Failed to sync hike " + hike.name + ": " + response.code() + " - " + errorBody);
                    return false;
                }
            }
        } catch (IOException e) {
            Log.e(TAG, "Network error while syncing hike " + hike.name + ": " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Sync hikes asynchronously (one at a time)
     * This is an alternative approach using callbacks for each hike
     */
    public void syncHikeAsync(Hike hike, SyncCallback callback) {
        new Thread(() -> {
            try {
                String url = BASE_URL + "/hikes";
                
                JsonObject body = new JsonObject();
                body.addProperty("userId", 1); // TODO: Get actual user ID from auth
                body.addProperty("name", hike.name);
                body.addProperty("location", hike.location);
                body.addProperty("length", hike.length);
                body.addProperty("difficulty", hike.difficulty);
                body.addProperty("description", hike.description != null ? hike.description : "");
                body.addProperty("privacy", hike.privacy);
                body.addProperty("lat", hike.latitude);
                body.addProperty("lng", hike.longitude);
                
                RequestBody requestBody = RequestBody.create(
                    body.toString(),
                    MediaType.parse("application/json")
                );
                
                Request request = new Request.Builder()
                    .url(url)
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Bearer " + authToken)
                    .build();
                
                httpClient.newCall(request).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        Log.e(TAG, "Network error: " + e.getMessage(), e);
                        if (callback != null) {
                            callback.onSyncError("Network error: " + e.getMessage());
                        }
                    }
                    
                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        if (response.isSuccessful()) {
                            try {
                                JSONObject responseJson = new JSONObject(response.body().string());
                                String cloudId = responseJson.optString("id");
                                
                                // Update hike sync status
                                hike.syncStatus = 1;
                                hike.cloudId = cloudId;
                                hike.updatedAt = System.currentTimeMillis();
                                hikeDao.update(hike);
                                
                                Log.d(TAG, "Successfully synced hike: " + hike.name);
                                
                                if (callback != null) {
                                    SyncResult result = new SyncResult();
                                    result.totalHikes = 1;
                                    result.successfulUploads = 1;
                                    result.failedUploads = 0;
                                    result.skippedHikes = 0;
                                    callback.onSyncSuccess(result);
                                }
                            } catch (JSONException e) {
                                Log.e(TAG, "Parse error: " + e.getMessage());
                                if (callback != null) {
                                    callback.onSyncError("Failed to parse response");
                                }
                            }
                        } else {
                            String errorBody = response.body().string();
                            Log.e(TAG, "Sync failed: " + response.code() + " - " + errorBody);
                            if (callback != null) {
                                callback.onSyncError("Sync failed: HTTP " + response.code());
                            }
                        }
                    }
                });
            } catch (Exception e) {
                Log.e(TAG, "Error: " + e.getMessage(), e);
                if (callback != null) {
                    callback.onSyncError("Error: " + e.getMessage());
                }
            }
        }).start();
    }
    
    /**
     * Get count of offline hikes waiting to be synced
     */
    public void getOfflineHikeCount(CountCallback callback) {
        new Thread(() -> {
            try {
                List<Hike> offlineHikes = hikeDao.getHikesBySyncStatusSync(0);
                int count = offlineHikes != null ? offlineHikes.size() : 0;
                if (callback != null) {
                    callback.onCountReady(count);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting offline hike count: " + e.getMessage());
                if (callback != null) {
                    callback.onError(e.getMessage());
                }
            }
        }).start();
    }
    
    /**
     * Check sync status of all hikes
     */
    public void getSyncStatus(StatusCallback callback) {
        new Thread(() -> {
            try {
                List<Hike> allHikes = hikeDao.getAllHikesSync();
                
                SyncStatus status = new SyncStatus();
                status.totalHikes = allHikes.size();
                status.syncedHikes = 0;
                status.offlineHikes = 0;
                
                for (Hike hike : allHikes) {
                    if (hike.syncStatus == 1) {
                        status.syncedHikes++;
                    } else {
                        status.offlineHikes++;
                    }
                }
                
                status.syncPercentage = status.totalHikes > 0 
                    ? (status.syncedHikes * 100) / status.totalHikes 
                    : 0;
                
                if (callback != null) {
                    callback.onStatusReady(status);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting sync status: " + e.getMessage());
                if (callback != null) {
                    callback.onError(e.getMessage());
                }
            }
        }).start();
    }
    
    /**
     * Sync status information class
     */
    public static class SyncStatus {
        public int totalHikes;
        public int syncedHikes;
        public int offlineHikes;
        public int syncPercentage;
        
        @Override
        public String toString() {
            return "SyncStatus{" +
                    "totalHikes=" + totalHikes +
                    ", syncedHikes=" + syncedHikes +
                    ", offlineHikes=" + offlineHikes +
                    ", syncPercentage=" + syncPercentage + "%" +
                    '}';
        }
    }
    
    /**
     * Callback interface for getting offline hike count
     */
    public interface CountCallback {
        void onCountReady(int count);
        void onError(String errorMessage);
    }
    
    /**
     * Callback interface for getting sync status
     */
    public interface StatusCallback {
        void onStatusReady(SyncStatus status);
        void onError(String errorMessage);
    }
}
