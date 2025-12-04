package com.example.mhike.database.entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import com.google.gson.annotations.SerializedName;

/**
 * User entity - Represents a user in the application
 * Used for displaying user profiles, search results, and follower information
 */
@Entity(tableName = "users")
public class User {
    @PrimaryKey
    public long id;
    
    public String username;
    
    @SerializedName("avatarurl")
    public String avatarUrl;
    
    public String bio;
    public String region;
    
    @SerializedName("followercount")
    public int followerCount = 0;
    
    @SerializedName("followingcount")
    public int followingCount = 0;
    
    @SerializedName("hikecount")
    public int hikeCount = 0;
    
    @SerializedName("totaldistance")
    public double totalDistance = 0;
    
    public long createdAt;
    public long updatedAt;
    
    public User() {
    }
    
    public User(long id, String username, String avatarUrl, String bio, String region) {
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
        this.region = region;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", followerCount=" + followerCount +
                ", followingCount=" + followingCount +
                ", hikeCount=" + hikeCount +
                '}';
    }
}
