package com.example.mhike.services;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.example.mhike.database.entities.Hike;
import com.example.mhike.database.entities.User;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * FeedService - Handles all API calls for feed, search, and follow functionality
 * Provides methods for:
 * - Searching users by name
 * - Following/unfollowing users
 * - Retrieving feed (followed users' public hikes)
 * - Checking follow status
 */
public class FeedService {
    
    private static final String TAG = "FeedService";
    private static final String PREFS_NAME = "m_hike_auth";
    private static final String TOKEN_KEY = "jwt_token";
    
    private static final String BASE_URL = "https://kandis-nonappealable-flatly.ngrok-free.dev/api";
    
    private final Context context;
    private final SharedPreferences prefs;
    private final OkHttpClient httpClient;
    private final Gson gson;
    private String authToken;
    
    // Callback interfaces
    public interface UserSearchCallback {
        void onSuccess(List<User> users);
        void onError(String errorMessage);
    }
    
    public interface FeedCallback {
        void onSuccess(List<Hike> hikes);
        void onError(String errorMessage);
    }
    
    public interface FollowCallback {
        void onSuccess(String message);
        void onError(String errorMessage);
    }
    
    public interface CheckFollowCallback {
        void onSuccess(boolean isFollowing);
        void onError(String errorMessage);
    }
    
    public FeedService(Context context, OkHttpClient httpClient) {
        this.context = context.getApplicationContext();
        this.httpClient = httpClient;
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        this.gson = new Gson();
        this.authToken = prefs.getString(TOKEN_KEY, null);
    }
    
    /**
     * Search users by username
     */
    public void searchUsers(String username, int limit, int offset, UserSearchCallback callback) {
        String url = BASE_URL + "/search/users?username=" + username + "&limit=" + limit + "&offset=" + offset;
        Log.d(TAG, "=== Search Users ===");
        Log.d(TAG, "URL: " + url);
        
        Request request = new Request.Builder()
            .url(url)
            .get()
            .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Search users failed: " + e.getMessage());
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        Log.d(TAG, "Search response: " + responseBody);
                        JsonArray jsonArray = gson.fromJson(responseBody, JsonArray.class);
                        
                        List<User> users = new ArrayList<>();
                        for (int i = 0; i < jsonArray.size(); i++) {
                            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
                            Log.d(TAG, "User " + i + ": " + jsonObject.toString());
                            User user = gson.fromJson(jsonObject, User.class);
                            Log.d(TAG, "Parsed user: " + user.username + " followers=" + user.followerCount);
                            users.add(user);
                        }
                        
                        Log.d(TAG, "Total users found: " + users.size());
                        if (callback != null) {
                            callback.onSuccess(users);
                        }
                    } else {
                        Log.e(TAG, "Search failed with code: " + response.code());
                        if (callback != null) {
                            callback.onError("Failed to search users: " + response.code());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing search results: " + e.getMessage(), e);
                    if (callback != null) {
                        callback.onError("Error parsing results: " + e.getMessage());
                    }
                }
            }
        });
    }
    
    /**
     * Get feed - all public hikes from followed users
     */
    public void getFeed(long userId, int limit, int offset, FeedCallback callback) {
        String url = BASE_URL + "/hikes/user/" + userId + "/following?limit=" + limit + "&offset=" + offset;
        Log.d(TAG, "=== Get Feed ===");
        Log.d(TAG, "URL: " + url);
        Log.d(TAG, "User ID: " + userId);
        
        Request request = new Request.Builder()
            .url(url)
            .get()
            .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Get feed failed: " + e.getMessage(), e);
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        Log.d(TAG, "Feed response length: " + responseBody.length());
                        Log.d(TAG, "Feed response: " + responseBody);
                        JsonArray jsonArray = gson.fromJson(responseBody, JsonArray.class);
                        
                        Log.d(TAG, "Feed hikes count: " + (jsonArray != null ? jsonArray.size() : "null"));
                        
                        List<Hike> hikes = new ArrayList<>();
                        if (jsonArray != null) {
                            for (int i = 0; i < jsonArray.size(); i++) {
                                JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
                                Log.d(TAG, "Hike " + i + ": " + jsonObject.toString());
                                Hike hike = gson.fromJson(jsonObject, Hike.class);
                                Log.d(TAG, "Parsed hike: " + hike.name + " by " + hike.userName);
                                hikes.add(hike);
                            }
                        }
                        
                        Log.d(TAG, "Total hikes in feed: " + hikes.size());
                        if (callback != null) {
                            callback.onSuccess(hikes);
                        }
                    } else {
                        Log.e(TAG, "Get feed failed with code: " + response.code());
                        String errorBody = response.body() != null ? response.body().string() : "No body";
                        Log.e(TAG, "Error response: " + errorBody);
                        if (callback != null) {
                            callback.onError("Failed to get feed: " + response.code());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing feed: " + e.getMessage(), e);
                    if (callback != null) {
                        callback.onError("Error parsing feed: " + e.getMessage());
                    }
                }
            }
        });
    }
    
    /**
     * Follow a user
     */
    public void followUser(long followerId, long followedId, FollowCallback callback) {
        String url = BASE_URL + "/follows";
        
        JsonObject body = new JsonObject();
        body.addProperty("followerId", followerId);
        body.addProperty("followedId", followedId);
        
        RequestBody requestBody = RequestBody.create(
            body.toString(),
            okhttp3.MediaType.parse("application/json")
        );
        
        Request request = new Request.Builder()
            .url(url)
            .post(requestBody)
            .addHeader("Authorization", "Bearer " + authToken)
            .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Follow user failed: " + e.getMessage());
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful()) {
                        if (callback != null) {
                            callback.onSuccess("User followed successfully");
                        }
                    } else {
                        if (callback != null) {
                            callback.onError("Failed to follow user: " + response.code());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error following user: " + e.getMessage());
                    if (callback != null) {
                        callback.onError("Error: " + e.getMessage());
                    }
                }
            }
        });
    }
    
    /**
     * Unfollow a user
     */
    public void unfollowUser(long followerId, long followedId, FollowCallback callback) {
        String url = BASE_URL + "/follows";
        
        JsonObject body = new JsonObject();
        body.addProperty("followerId", followerId);
        body.addProperty("followedId", followedId);
        
        RequestBody requestBody = RequestBody.create(
            body.toString(),
            okhttp3.MediaType.parse("application/json")
        );
        
        Request request = new Request.Builder()
            .url(url)
            .delete(requestBody)
            .addHeader("Authorization", "Bearer " + authToken)
            .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Unfollow user failed: " + e.getMessage());
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful()) {
                        if (callback != null) {
                            callback.onSuccess("User unfollowed successfully");
                        }
                    } else {
                        if (callback != null) {
                            callback.onError("Failed to unfollow user: " + response.code());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error unfollowing user: " + e.getMessage());
                    if (callback != null) {
                        callback.onError("Error: " + e.getMessage());
                    }
                }
            }
        });
    }
    
    /**
     * Check if user follows another user
     */
    public void checkFollowStatus(long followerId, long followedId, CheckFollowCallback callback) {
        String url = BASE_URL + "/follows/check?followerId=" + followerId + "&followedId=" + followedId;
        
        Request request = new Request.Builder()
            .url(url)
            .get()
            .addHeader("Authorization", "Bearer " + authToken)
            .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Check follow status failed: " + e.getMessage());
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
                        boolean isFollowing = jsonObject.get("isFollowing").getAsBoolean();
                        
                        if (callback != null) {
                            callback.onSuccess(isFollowing);
                        }
                    } else {
                        if (callback != null) {
                            callback.onError("Failed to check follow status: " + response.code());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error checking follow status: " + e.getMessage());
                    if (callback != null) {
                        callback.onError("Error: " + e.getMessage());
                    }
                }
            }
        });
    }
    
    /**
     * Get public hikes nearby based on location and radius
     * @param latitude User's latitude
     * @param longitude User's longitude
     * @param radiusKm Search radius in kilometers
     * @param limit Maximum number of hikes to return
     * @param offset Pagination offset
     * @param callback FeedCallback for results
     */
    public void getNearbyHikes(double latitude, double longitude, double radiusKm, int limit, int offset, FeedCallback callback) {
        String url = BASE_URL + "/hikes/nearby?lat=" + latitude + "&lng=" + longitude + 
                     "&radius=" + radiusKm + "&limit=" + limit + "&offset=" + offset;
        
        Log.d(TAG, "=== Get Nearby Hikes ===");
        Log.d(TAG, "URL: " + url);
        Log.d(TAG, "Location: " + latitude + ", " + longitude + " | Radius: " + radiusKm + "km");
        
        Request request = new Request.Builder()
            .url(url)
            .get()
            .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Get nearby hikes failed: " + e.getMessage());
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        Log.d(TAG, "Nearby hikes response received, parsing...");
                        
                        try {
                            JsonArray jsonArray = gson.fromJson(responseBody, JsonArray.class);
                            List<Hike> hikes = new ArrayList<>();
                            
                            for (int i = 0; i < jsonArray.size(); i++) {
                                try {
                                    JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
                                    Hike hike = gson.fromJson(jsonObject, Hike.class);
                                    
                                    // Extract author information if present
                                    if (jsonObject.has("User") && !jsonObject.get("User").isJsonNull()) {
                                        JsonObject userObject = jsonObject.getAsJsonObject("User");
                                        hike.userName = userObject.has("username") ? userObject.get("username").getAsString() : "Unknown";
                                    }
                                    
                                    hikes.add(hike);
                                } catch (Exception e) {
                                    Log.w(TAG, "Failed to parse hike: " + e.getMessage());
                                }
                            }
                            
                            Log.d(TAG, "Successfully parsed " + hikes.size() + " nearby hikes");
                            if (callback != null) {
                                callback.onSuccess(hikes);
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Failed to parse nearby hikes JSON: " + e.getMessage());
                            if (callback != null) {
                                callback.onError("Failed to parse response: " + e.getMessage());
                            }
                        }
                    } else {
                        assert response.body() != null;
                        String errorBody = response.body().string();
                        Log.e(TAG, "Get nearby hikes error: " + response.code() + " - " + errorBody);
                        if (callback != null) {
                            callback.onError("HTTP " + response.code() + ": " + errorBody);
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error processing nearby hikes response: " + e.getMessage());
                    if (callback != null) {
                        callback.onError("Error: " + e.getMessage());
                    }
                }
            }
        });
    }
}
