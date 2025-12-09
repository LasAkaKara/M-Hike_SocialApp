package com.example.mhike.ui.viewmodels;

import android.app.Application;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.mhike.database.entities.Hike;
import com.example.mhike.database.entities.User;
import com.example.mhike.services.FeedService;

import okhttp3.OkHttpClient;

import java.util.List;

/**
 * ViewModel for Search and Feed functionality
 * Manages user search, feed retrieval, and follow operations
 */
public class SearchFeedViewModel extends AndroidViewModel {
    
    private static final String PREFS_NAME = "m_hike_auth";
    private static final String USER_ID_KEY = "user_id";
    
    private final FeedService feedService;
    private final long currentUserId;
    
    // Search Users LiveData
    private final MutableLiveData<List<User>> searchResults = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isSearching = new MutableLiveData<>(false);
    private final MutableLiveData<String> searchErrorMessage = new MutableLiveData<>();
    
    // Feed LiveData
    private final MutableLiveData<List<Hike>> feedHikes = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isFeedLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> feedErrorMessage = new MutableLiveData<>();
    
    // Nearby Hikes LiveData
    private final MutableLiveData<List<Hike>> nearbyHikes = new MutableLiveData<>();
    private final MutableLiveData<Boolean> nearbyHikesLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> nearbyHikesErrorMessage = new MutableLiveData<>();
    
    // Follow status LiveData
    private final MutableLiveData<Boolean> isFollowing = new MutableLiveData<>(false);
    private final MutableLiveData<String> followMessage = new MutableLiveData<>();
    
    public SearchFeedViewModel(@NonNull Application application) {
        super(application);
        
        SharedPreferences prefs = application.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE);
        this.currentUserId = prefs.getLong(USER_ID_KEY, -1);
        
        OkHttpClient httpClient = new OkHttpClient.Builder().build();
        this.feedService = new FeedService(application, httpClient);
    }
    
    // ======================== Search Methods ========================
    
    /**
     * Search users by username
     */
    public void searchUsers(String username) {
        if (username == null || username.trim().isEmpty()) {
            searchResults.postValue(null);
            return;
        }
        
        isSearching.postValue(true);
        feedService.searchUsers(username, 50, 0, new FeedService.UserSearchCallback() {
            @Override
            public void onSuccess(List<User> users) {
                searchResults.postValue(users);
                isSearching.postValue(false);
                searchErrorMessage.postValue(null);
            }
            
            @Override
            public void onError(String errorMessage) {
                searchResults.postValue(null);
                isSearching.postValue(false);
                searchErrorMessage.postValue(errorMessage);
            }
        });
    }
    
    public LiveData<List<User>> getSearchResults() {
        return searchResults;
    }
    
    public LiveData<Boolean> getIsSearching() {
        return isSearching;
    }
    
    public LiveData<String> getSearchErrorMessage() {
        return searchErrorMessage;
    }
    
    // ======================== Feed Methods ========================
    
    /**
     * Load feed of followed users' public hikes
     */
    public void loadFeed() {
        if (currentUserId <= 0) {
            feedErrorMessage.postValue("User not logged in");
            return;
        }
        
        isFeedLoading.postValue(true);
        feedService.getFeed(currentUserId, 50, 0, new FeedService.FeedCallback() {
            @Override
            public void onSuccess(List<Hike> hikes) {
                feedHikes.postValue(hikes);
                isFeedLoading.postValue(false);
                feedErrorMessage.postValue(null);
            }
            
            @Override
            public void onError(String errorMessage) {
                feedHikes.postValue(null);
                isFeedLoading.postValue(false);
                feedErrorMessage.postValue(errorMessage);
            }
        });
    }
    
    public LiveData<List<Hike>> getFeedHikes() {
        return feedHikes;
    }
    
    public LiveData<Boolean> getIsFeedLoading() {
        return isFeedLoading;
    }
    
    public LiveData<String> getFeedErrorMessage() {
        return feedErrorMessage;
    }
    
    // ======================== Follow Methods ========================
    
    /**
     * Follow a user
     */
    public void followUser(long followedId) {
        if (currentUserId <= 0) {
            followMessage.postValue("User not logged in");
            return;
        }
        
        feedService.followUser(currentUserId, followedId, new FeedService.FollowCallback() {
            @Override
            public void onSuccess(String message) {
                isFollowing.postValue(true);
                followMessage.postValue("Followed successfully");
            }
            
            @Override
            public void onError(String errorMessage) {
                followMessage.postValue("Error: " + errorMessage);
            }
        });
    }
    
    /**
     * Unfollow a user
     */
    public void unfollowUser(long followedId) {
        if (currentUserId <= 0) {
            followMessage.postValue("User not logged in");
            return;
        }
        
        feedService.unfollowUser(currentUserId, followedId, new FeedService.FollowCallback() {
            @Override
            public void onSuccess(String message) {
                isFollowing.postValue(false);
                followMessage.postValue("Unfollowed successfully");
            }
            
            @Override
            public void onError(String errorMessage) {
                followMessage.postValue("Error: " + errorMessage);
            }
        });
    }
    
    /**
     * Check if following a user
     */
    public void checkFollowStatus(long followedId) {
        if (currentUserId <= 0) {
            return;
        }
        
        feedService.checkFollowStatus(currentUserId, followedId, new FeedService.CheckFollowCallback() {
            @Override
            public void onSuccess(boolean following) {
                isFollowing.postValue(following);
            }
            
            @Override
            public void onError(String errorMessage) {
                isFollowing.postValue(false);
            }
        });
    }
    
    public LiveData<Boolean> getIsFollowing() {
        return isFollowing;
    }
    
    public LiveData<String> getFollowMessage() {
        return followMessage;
    }
    
    public long getCurrentUserId() {
        return currentUserId;
    }
    
    // ======================== Nearby Hikes Methods ========================
    
    /**
     * Load nearby public hikes based on location
     */
    public void loadNearbyHikes(double latitude, double longitude, double radiusKm) {
        nearbyHikesLoading.postValue(true);
        feedService.getNearbyHikes(latitude, longitude, radiusKm, 50, 0, new FeedService.FeedCallback() {
            @Override
            public void onSuccess(List<Hike> hikes) {
                nearbyHikes.postValue(hikes);
                nearbyHikesLoading.postValue(false);
                nearbyHikesErrorMessage.postValue(null);
            }
            
            @Override
            public void onError(String errorMessage) {
                nearbyHikes.postValue(null);
                nearbyHikesLoading.postValue(false);
                nearbyHikesErrorMessage.postValue(errorMessage);
            }
        });
    }
    
    public LiveData<List<Hike>> getNearbyHikes() {
        return nearbyHikes;
    }
    
    public LiveData<Boolean> getNearbyHikesLoading() {
        return nearbyHikesLoading;
    }
    
    public LiveData<String> getNearbyHikesErrorMessage() {
        return nearbyHikesErrorMessage;
    }
}
