package com.example.mhike.services;

import android.content.Context;
import android.util.Log;

import com.example.mhike.database.AppDatabase;
import com.example.mhike.database.daos.HikeDao;
import com.example.mhike.database.daos.ObservationDao;

import java.io.File;

/**
 * DatabaseCleaner - Utility to clear all local data
 * Used during logout to remove all cached hikes and observations
 * Allows users to re-sync from cloud after logging back in
 */
public class DatabaseCleaner {
    
    private static final String TAG = "DatabaseCleaner";
    private final Context context;
    private final HikeDao hikeDao;
    private final ObservationDao observationDao;
    
    public DatabaseCleaner(Context context) {
        this.context = context.getApplicationContext();
        AppDatabase database = AppDatabase.getInstance(context);
        this.hikeDao = database.hikeDao();
        this.observationDao = database.observationDao();
    }
    
    /**
     * Clear all local data including database and image files
     * This is called when user logs out
     */
    public void clearAllLocalData() {
        new Thread(() -> {
            try {
                Log.d(TAG, "Clearing all local data...");
                
                // Clear all observations first (due to foreign key constraints)
                observationDao.deleteAllObservations();
                Log.d(TAG, "Cleared all observations from database");
                
                // Clear all hikes
                hikeDao.deleteAllHikes();
                Log.d(TAG, "Cleared all hikes from database");
                
                // Delete image files directory
                deleteImageFiles();
                
                Log.d(TAG, "All local data cleared successfully");
            } catch (Exception e) {
                Log.e(TAG, "Error clearing local data: " + e.getMessage(), e);
            }
        }).start();
    }
    
    /**
     * Delete all cached image files
     */
    private void deleteImageFiles() {
        try {
            File imagesDir = new File(context.getFilesDir(), "observations");
            if (imagesDir.exists()) {
                File[] files = imagesDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isFile()) {
                            boolean deleted = file.delete();
                            Log.d(TAG, "Image file " + file.getName() + " deleted: " + deleted);
                        }
                    }
                }
                // Delete the directory itself
                boolean dirDeleted = imagesDir.delete();
                Log.d(TAG, "Images directory deleted: " + dirDeleted);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error deleting image files: " + e.getMessage(), e);
        }
    }
}
