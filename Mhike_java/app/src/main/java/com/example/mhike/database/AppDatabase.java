package com.example.mhike.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import com.example.mhike.database.daos.HikeDao;
import com.example.mhike.database.daos.ObservationDao;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.database.entities.Observation;

/**
 * Room Database singleton for M-Hike application.
 * Manages all database operations with local SQLite.
 * 
 * Schema version management:
 * - Version 1: Initial schema with Hike and Observation tables
 * - Version 2: Added index on Observation.hikeId foreign key for query performance
 */
@Database(
    entities = {Hike.class, Observation.class},
    version = 2,
    exportSchema = false
)
public abstract class AppDatabase extends RoomDatabase {
    
    private static volatile AppDatabase INSTANCE;
    private static final String DATABASE_NAME = "mhike_database.db";
    
    /**
     * Abstract methods to get DAOs.
     */
    public abstract HikeDao hikeDao();
    public abstract ObservationDao observationDao();
    
    /**
     * Get singleton instance of AppDatabase.
     * Thread-safe using volatile and synchronized block.
     * 
     * @param context Application context
     * @return AppDatabase singleton instance
     */
    public static AppDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(
                            context.getApplicationContext(),
                            AppDatabase.class,
                            DATABASE_NAME
                        )
                        .fallbackToDestructiveMigration()  // For development only
                        .build();
                }
            }
        }
        return INSTANCE;
    }
    
    /**
     * Reset the database instance (for testing/development).
     */
    public static void resetInstance() {
        INSTANCE = null;
    }
    
    /**
     * Delete the entire database from device storage.
     * 
     * @param context Application context
     */
    public static void deleteDatabase(Context context) {
        context.deleteDatabase(DATABASE_NAME);
        resetInstance();
    }
}
