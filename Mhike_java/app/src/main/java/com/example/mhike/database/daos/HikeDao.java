package com.example.mhike.database.daos;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.example.mhike.database.entities.Hike;

import java.util.List;

/**
 * Data Access Object for Hike entity.
 * Provides CRUD operations and queries for hikes.
 */
@Dao
public interface HikeDao {
    
    /**
     * Insert a single hike into the database.
     */
    @Insert
    long insert(Hike hike);
    
    /**
     * Insert multiple hikes into the database.
     */
    @Insert
    long[] insertAll(Hike... hikes);
    
    /**
     * Update an existing hike.
     */
    @Update
    int update(Hike hike);
    
    /**
     * Delete a hike from the database.
     */
    @Delete
    int delete(Hike hike);
    
    /**
     * Get all hikes as LiveData for real-time UI updates.
     */
    @Query("SELECT * FROM hikes ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> getAllHikes();
    
    /**
     * Get all hikes as a List (blocking call).
     */
    @Query("SELECT * FROM hikes ORDER BY date DESC, time DESC")
    List<Hike> getAllHikesSync();
    
    /**
     * Get a single hike by ID.
     */
    @Query("SELECT * FROM hikes WHERE id = :hikeId")
    Hike getHikeById(long hikeId);
    
    /**
     * Get a single hike by ID as LiveData.
     */
    @Query("SELECT * FROM hikes WHERE id = :hikeId")
    LiveData<Hike> getHikeByIdLive(long hikeId);
    
    /**
     * Search hikes by name (case-insensitive).
     */
    @Query("SELECT * FROM hikes WHERE LOWER(name) LIKE '%' || LOWER(:query) || '%' " +
           "ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> searchHikesByName(String query);
    
    /**
     * Search hikes by location (case-insensitive).
     */
    @Query("SELECT * FROM hikes WHERE LOWER(location) LIKE '%' || LOWER(:location) || '%' " +
           "ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> searchHikesByLocation(String location);
    
    /**
     * Search hikes by date.
     */
    @Query("SELECT * FROM hikes WHERE date = :date ORDER BY time DESC")
    LiveData<List<Hike>> searchHikesByDate(String date);
    
    /**
     * Filter hikes by minimum length.
     */
    @Query("SELECT * FROM hikes WHERE length >= :minLength ORDER BY length ASC")
    LiveData<List<Hike>> filterByMinLength(float minLength);
    
    /**
     * Filter hikes by difficulty.
     */
    @Query("SELECT * FROM hikes WHERE difficulty = :difficulty ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> filterByDifficulty(String difficulty);
    
    /**
     * Filter hikes by date range.
     */
    @Query("SELECT * FROM hikes WHERE date BETWEEN :startDate AND :endDate " +
           "ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> filterByDateRange(String startDate, String endDate);
    
    /**
     * Filter hikes by length range (in kilometers).
     */
    @Query("SELECT * FROM hikes WHERE length BETWEEN :minLength AND :maxLength " +
           "ORDER BY length ASC")
    LiveData<List<Hike>> filterByLength(float minLength, float maxLength);
    
    /**
     * Get hikes by privacy status.
     */
    @Query("SELECT * FROM hikes WHERE privacy = :privacy ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> getHikesByPrivacy(String privacy);
    
    /**
     * Get hikes by sync status (asynchronous - returns LiveData).
     */
    @Query("SELECT * FROM hikes WHERE syncStatus = :syncStatus ORDER BY date DESC, time DESC")
    LiveData<List<Hike>> getHikesBySyncStatus(int syncStatus);
    
    /**
     * Get hikes by sync status (synchronous - blocking call for background threads).
     */
    @Query("SELECT * FROM hikes WHERE syncStatus = :syncStatus ORDER BY date DESC, time DESC")
    List<Hike> getHikesBySyncStatusSync(int syncStatus);
    
    /**
     * Get total number of hikes.
     */
    @Query("SELECT COUNT(*) FROM hikes")
    LiveData<Integer> getTotalHikeCount();
    
    /**
     * Get total distance hiked.
     */
    @Query("SELECT SUM(length) FROM hikes")
    LiveData<Float> getTotalDistance();
    
    /**
     * Delete all hikes (for reset functionality).
     */
    @Query("DELETE FROM hikes")
    void deleteAllHikes();
}
