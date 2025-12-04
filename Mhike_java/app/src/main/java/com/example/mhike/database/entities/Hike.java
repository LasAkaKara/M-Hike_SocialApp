package com.example.mhike.database.entities;

import androidx.room.Entity;
import androidx.room.Ignore;
import androidx.room.PrimaryKey;

/**
 * Hike entity for local SQLite storage.
 * Schema aligns with cloud PostgreSQL Hike table.
 */
@Entity(tableName = "hikes")
public class Hike {
    
    @PrimaryKey(autoGenerate = true)
    public long id;
    
    // Cloud sync information
    public String cloudId;  // Reference to cloud database ID
    
    // Core hike information (Required)
    public String name;
    public String location;
    public String date;  // ISO format: YYYY-MM-DD
    public String time;  // ISO format: HH:mm
    public float length;  // In kilometers
    public String difficulty;  // "Easy", "Medium", "Hard"
    public boolean parkingAvailable;
    
    // Optional fields
    public String description;
    
    // Privacy and status
    public String privacy;  // "Public" or "Private"
    public int syncStatus;  // 0 = local only, 1 = synced to cloud
    public boolean isDeleted;  // 0 = active, 1 = deleted (marked for deletion sync)
    
    // User information (for feed display)
    @Ignore
    public String userName;  // Author's username
    @Ignore
    public String userAvatarUrl;  // Author's avatar URL
    
    // Metadata
    public long createdAt;  // Timestamp in milliseconds
    public long updatedAt;  // Timestamp in milliseconds
    public float latitude;  // Optional geo-tagging
    public float longitude;  // Optional geo-tagging
    
    public Hike() {}
    
    @Ignore
    public Hike(String name, String location, String date, String time, 
                float length, String difficulty, boolean parkingAvailable) {
        this.name = name;
        this.location = location;
        this.date = date;
        this.time = time;
        this.length = length;
        this.difficulty = difficulty;
        this.parkingAvailable = parkingAvailable;
        this.description = "";
        this.privacy = "Private";
        this.syncStatus = 0;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }
    
    @Override
    public String toString() {
        return "Hike{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", location='" + location + '\'' +
                ", date='" + date + '\'' +
                ", length=" + length +
                ", difficulty='" + difficulty + '\'' +
                '}';
    }
}
