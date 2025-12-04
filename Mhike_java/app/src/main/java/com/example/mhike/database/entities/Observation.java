package com.example.mhike.database.entities;

import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Ignore;
import androidx.room.Index;
import androidx.room.PrimaryKey;

/**
 * Observation entity for local SQLite storage.
 * Observations are timestamped observations attached to a Hike.
 * Schema aligns with cloud PostgreSQL Observation table.
 */
@Entity(
    tableName = "observations",
    foreignKeys = @ForeignKey(
        entity = Hike.class,
        parentColumns = "id",
        childColumns = "hikeId",
        onDelete = ForeignKey.CASCADE
    ),
    indices = @Index("hikeId")
)
public class Observation {
    
    @PrimaryKey(autoGenerate = true)
    public long id;
    
    // Cloud sync information
    public String cloudId;  // Reference to cloud database ID
    
    // Foreign key reference
    public long hikeId;  // Reference to parent Hike
    
    // Core observation information (Required)
    public String title;
    public String time;  // ISO format: HH:mm (auto-filled with current time)
    
    // Optional fields
    public String comments;
    public String imageUri;  // Local URI to image stored on device
    public String cloudImageUrl;  // Cloud URL if synced
    
    // Geo-tagging (Optional)
    public Float latitude;
    public Float longitude;
    
    // Status and sync
    public String status;  // "Open", "Verified", "Disputed", etc.
    public int confirmations;  // Number of confirmations from community
    public int disputes;  // Number of disputes from community
    public int syncStatus;  // 0 = local only, 1 = synced to cloud
    
    // Metadata
    public long createdAt;  // Timestamp in milliseconds
    public long updatedAt;  // Timestamp in milliseconds
    
    public Observation() {}
    
    @Ignore
    public Observation(long hikeId, String title, String time) {
        this.hikeId = hikeId;
        this.title = title;
        this.time = time;
        this.comments = "";
        this.status = "Open";
        this.confirmations = 0;
        this.disputes = 0;
        this.syncStatus = 0;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }
    
    @Override
    public String toString() {
        return "Observation{" +
                "id=" + id +
                ", hikeId=" + hikeId +
                ", title='" + title + '\'' +
                ", time='" + time + '\'' +
                '}';
    }
}
