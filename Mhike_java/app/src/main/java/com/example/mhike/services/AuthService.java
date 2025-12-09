package com.example.mhike.services;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * AuthService - Handles authentication API calls and JWT token management
 * Provides signup, signin, and token refresh functionality
 */
public class AuthService {
    
    private static final String TAG = "AuthService";
    private static final String PREFS_NAME = "m_hike_auth";
    private static final String TOKEN_KEY = "jwt_token";
    private static final String USER_ID_KEY = "user_id";
    private static final String USERNAME_KEY = "username";
    
    private static final String BASE_URL = "https://kandis-nonappealable-flatly.ngrok-free.dev/api";
    
    private final Context context;
    private final SharedPreferences prefs;
    private final OkHttpClient httpClient;
    private final Gson gson;
    
    // Callback interface
    public interface AuthCallback {
        void onSuccess(String token, long userId, String username);
        void onError(String errorMessage);
    }
    
    public AuthService(Context context, OkHttpClient httpClient) {
        this.context = context.getApplicationContext();
        this.httpClient = httpClient;
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        this.gson = new Gson();
    }
    
    /**
     * Sign up with username and password
     */
    public void signup(String username, String password, String bio, String region, String avatarUrl, AuthCallback callback) {
        JsonObject body = new JsonObject();
        body.addProperty("username", username);
        body.addProperty("password", password);
        body.addProperty("bio", bio != null ? bio : "");
        body.addProperty("region", region != null ? region : "");
        body.addProperty("avatarUrl", avatarUrl != null ? avatarUrl : "");
        
        makeAuthRequest("POST", "/auth/signup", body.toString(), callback);
    }
    
    /**
     * Sign in with username and password
     */
    public void signin(String username, String password, AuthCallback callback) {
        JsonObject body = new JsonObject();
        body.addProperty("username", username);
        body.addProperty("password", password);
        
        makeAuthRequest("POST", "/auth/signin", body.toString(), callback);
    }
    
    /**
     * Make authentication API request
     */
    private void makeAuthRequest(String method, String endpoint, String jsonBody, AuthCallback callback) {
        String url = BASE_URL + endpoint;
        
        RequestBody body = RequestBody.create(jsonBody, MediaType.parse("application/json"));
        
        Request.Builder requestBuilder = new Request.Builder()
            .url(url)
            .header("Content-Type", "application/json");
        
        if (method.equals("POST")) {
            requestBuilder.post(body);
        } else if (method.equals("GET")) {
            requestBuilder.get();
        } else if (method.equals("PUT")) {
            requestBuilder.put(body);
        }
        
        Request request = requestBuilder.build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Auth request failed: " + e.getMessage(), e);
                if (callback != null) {
                    callback.onError("Network error: " + e.getMessage());
                }
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                
                if (response.isSuccessful()) {
                    try {
                        JSONObject json = new JSONObject(responseBody);
                        String token = json.getString("token");
                        
                        JSONObject userObj = json.getJSONObject("user");
                        long userId = userObj.getLong("id");
                        String userUsername = userObj.getString("username");
                        
                        // Save token and user info
                        saveToken(token, userId, userUsername);
                        
                        if (callback != null) {
                            callback.onSuccess(token, userId, userUsername);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to parse auth response: " + e.getMessage(), e);
                        if (callback != null) {
                            callback.onError("Invalid response format: " + e.getMessage());
                        }
                    }
                } else {
                    try {
                        JSONObject json = new JSONObject(responseBody);
                        String error = json.optString("error", "Authentication failed");
                        if (callback != null) {
                            callback.onError(error);
                        }
                    } catch (Exception e) {
                        if (callback != null) {
                            callback.onError("Authentication failed: " + response.code());
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Save JWT token to SharedPreferences
     */
    public void saveToken(String token, long userId, String username) {
        prefs.edit()
            .putString(TOKEN_KEY, token)
            .putLong(USER_ID_KEY, userId)
            .putString(USERNAME_KEY, username)
            .apply();
        Log.d(TAG, "Token saved for user: " + username);
    }
    
    /**
     * Get stored JWT token
     */
    public String getToken() {
        return prefs.getString(TOKEN_KEY, null);
    }
    
    /**
     * Get stored user ID
     */
    public long getUserId() {
        return prefs.getLong(USER_ID_KEY, -1);
    }
    
    /**
     * Get stored username
     */
    public String getUsername() {
        return prefs.getString(USERNAME_KEY, null);
    }
    
    /**
     * Check if user is logged in
     */
    public boolean isLoggedIn() {
        return getToken() != null && !getToken().isEmpty();
    }
    
    /**
     * Logout - clear all auth data
     */
    public void logout() {
        prefs.edit()
            .remove(TOKEN_KEY)
            .remove(USER_ID_KEY)
            .remove(USERNAME_KEY)
            .apply();
        Log.d(TAG, "User logged out");
    }
    
    /**
     * Set the base URL for testing/different environments
     */
    public static void setBaseUrl(String url) {
        // Note: For production, create a config file
        // This is a workaround for setting ngrok URL
    }
}
