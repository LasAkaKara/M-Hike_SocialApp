package com.example.mhike.database.daos;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.example.mhike.database.entities.Observation;

import java.util.List;

/**
 * Data Access Object for Observation entity.
 * Provides CRUD operations and queries for observations.
 */
@Dao
public interface ObservationDao {
    
    /**
     * Insert a single observation into the database.
     */
    @Insert
    long insert(Observation observation);
    
    /**
     * Insert multiple observations into the database.
     */
    @Insert
    long[] insertAll(Observation... observations);
    
    /**
     * Update an existing observation.
     */
    @Update
    int update(Observation observation);
    
    /**
     * Delete an observation from the database.
     */
    @Delete
    int delete(Observation observation);
    
    /**
     * Get all observations for a specific hike, ordered by time.
     */
    @Query("SELECT * FROM observations WHERE hikeId = :hikeId ORDER BY time DESC")
    LiveData<List<Observation>> getObservationsForHike(long hikeId);
    
    /**
     * Get all observations for a specific hike (blocking call).
     */
    @Query("SELECT * FROM observations WHERE hikeId = :hikeId ORDER BY time DESC")
    List<Observation> getObservationsForHikeSync(long hikeId);
    
    /**
     * Get a single observation by ID.
     */
    @Query("SELECT * FROM observations WHERE id = :observationId")
    Observation getObservationById(long observationId);
    
    /**
     * Get a single observation by ID as LiveData.
     */
    @Query("SELECT * FROM observations WHERE id = :observationId")
    LiveData<Observation> getObservationByIdLive(long observationId);
    
    /**
     * Get all observations.
     */
    @Query("SELECT * FROM observations ORDER BY time DESC")
    LiveData<List<Observation>> getAllObservations();
    
    /**
     * Search observations by title.
     */
    @Query("SELECT * FROM observations WHERE LOWER(title) LIKE '%' || LOWER(:query) || '%' " +
           "ORDER BY time DESC")
    LiveData<List<Observation>> searchObservationsByTitle(String query);
    
    /**
     * Get observations with specific status.
     */
    @Query("SELECT * FROM observations WHERE status = :status ORDER BY time DESC")
    LiveData<List<Observation>> getObservationsByStatus(String status);
    
    /**
     * Get observations by sync status.
     */
    @Query("SELECT * FROM observations WHERE syncStatus = :syncStatus ORDER BY time DESC")
    LiveData<List<Observation>> getObservationsBySyncStatus(int syncStatus);
    
    /**
     * Get observations with photos for a hike.
     */
    @Query("SELECT * FROM observations WHERE hikeId = :hikeId AND imageUri IS NOT NULL " +
           "ORDER BY time DESC")
    LiveData<List<Observation>> getObservationsWithPhotos(long hikeId);
    
    /**
     * Get observations within a geographic radius.
     * Uses simple distance calculation (Haversine would be better in production).
     */
    @Query("SELECT * FROM observations WHERE hikeId = :hikeId AND " +
           "latitude IS NOT NULL AND longitude IS NOT NULL ORDER BY time DESC")
    LiveData<List<Observation>> getObservationsWithLocation(long hikeId);
    
    /**
     * Get observation count for a specific hike.
     */
    @Query("SELECT COUNT(*) FROM observations WHERE hikeId = :hikeId")
    LiveData<Integer> getObservationCountForHike(long hikeId);
    
    /**
     * Delete all observations for a specific hike.
     */
    @Query("DELETE FROM observations WHERE hikeId = :hikeId")
    void deleteObservationsForHike(long hikeId);
    
    /**
     * Delete all observations (for reset functionality).
     */
    @Query("DELETE FROM observations")
    void deleteAllObservations();
    
    /**
     * Get observations by sync status (blocking call for background threads).
     */
    @Query("SELECT * FROM observations WHERE syncStatus = :syncStatus ORDER BY createdAt DESC")
    List<Observation> getObservationsBySyncStatusSync(int syncStatus);
    
    /**
     * Get observation by cloud ID.
     */
    @Query("SELECT * FROM observations WHERE cloudId = :cloudId LIMIT 1")
    Observation getObservationByCloudIdSync(String cloudId);
    
    /**
     * Get all observations (blocking call for background threads).
     */
    @Query("SELECT * FROM observations ORDER BY createdAt DESC")
    List<Observation> getAllObservationsSync();
    
    /**
     * Permanently delete an observation from the database (for deletion sync).
     */
    @Query("DELETE FROM observations WHERE id = :observationId")
    void permanentlyDelete(long observationId);
}
