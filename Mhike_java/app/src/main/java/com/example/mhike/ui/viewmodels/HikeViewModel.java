package com.example.mhike.ui.viewmodels;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.mhike.database.AppDatabase;
import com.example.mhike.database.daos.HikeDao;
import com.example.mhike.database.daos.ObservationDao;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.database.entities.Observation;

import java.util.List;

/**
 * ViewModel for managing hike-related data and UI logic.
 * Handles database operations and exposes LiveData for observing changes.
 */
public class HikeViewModel extends AndroidViewModel {
    
    private final HikeDao hikeDao;
    private final ObservationDao observationDao;
    
    // LiveData
    private final LiveData<List<Hike>> allHikes;
    private final MutableLiveData<String> searchQuery = new MutableLiveData<>("");
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<String> successMessage = new MutableLiveData<>();
    
    public HikeViewModel(@NonNull Application application) {
        super(application);
        
        AppDatabase database = AppDatabase.getInstance(application);
        hikeDao = database.hikeDao();
        observationDao = database.observationDao();
        
        allHikes = hikeDao.getAllHikes();
    }
    
    /**
     * Get all hikes as LiveData
     */
    public LiveData<List<Hike>> getAllHikes() {
        return allHikes;
    }
    
    /**
     * Insert a new hike
     */
    public void insertHike(Hike hike) {
        new Thread(() -> {
            try {
                hikeDao.insert(hike);
                postSuccessMessage("Hike saved successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to save hike: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Update an existing hike
     */
    public void updateHike(Hike hike) {
        new Thread(() -> {
            try {
                hike.updatedAt = System.currentTimeMillis();
                hikeDao.update(hike);
                postSuccessMessage("Hike updated successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to update hike: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Delete a hike
     */
    public void deleteHike(Hike hike) {
        new Thread(() -> {
            try {
                // Delete observations first (due to foreign key constraint)
                observationDao.deleteObservationsForHike(hike.id);
                hikeDao.delete(hike);
                postSuccessMessage("Hike deleted successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to delete hike: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Get a specific hike by ID
     */
    public LiveData<Hike> getHikeById(long hikeId) {
        return hikeDao.getHikeByIdLive(hikeId);
    }
    
    /**
     * Search hikes by name
     */
    public LiveData<List<Hike>> searchHikes(String query) {
        if (query == null || query.trim().isEmpty()) {
            return allHikes;
        }
        return hikeDao.searchHikesByName(query);
    }
    
    /**
     * Search hikes by location
     */
    public LiveData<List<Hike>> searchHikesByLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            return allHikes;
        }
        return hikeDao.searchHikesByLocation(location);
    }
    
    /**
     * Search hikes by minimum length
     */
    public LiveData<List<Hike>> searchHikesByLength(float minLength) {
        return hikeDao.filterByMinLength(minLength);
    }
    
    /**
     * Search hikes by date
     */
    public LiveData<List<Hike>> searchHikesByDate(String date) {
        if (date == null || date.trim().isEmpty()) {
            return allHikes;
        }
        return hikeDao.searchHikesByDate(date);
    }
    
    /**
     * Search hikes with multiple filters (client-side filtering)
     * This method filters results based on all provided criteria
     */
    public void searchHikesWithFilters(String name, String location, 
                                       Float length, String date,
                                       FilterCallback callback) {
        new Thread(() -> {
            try {
                List<Hike> results = hikeDao.getAllHikesSync();
                
                // Apply name filter
                if (name != null && !name.trim().isEmpty()) {
                    results.removeIf(h -> !h.name.toLowerCase().contains(name.toLowerCase()));
                }
                
                // Apply location filter
                if (location != null && !location.trim().isEmpty()) {
                    results.removeIf(h -> !h.location.toLowerCase().contains(location.toLowerCase()));
                }
                
                // Apply length filter
                if (length != null && length > 0) {
                    results.removeIf(h -> h.length < length);
                }
                
                // Apply date filter
                if (date != null && !date.trim().isEmpty()) {
                    results.removeIf(h -> !h.date.equals(date));
                }
                
                // Post callback to main thread
                final List<Hike> finalResults = results;
                new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
                    callback.onFilterComplete(finalResults);
                });
            } catch (Exception e) {
                postErrorMessage("Search failed: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Callback interface for filter results
     */
    public interface FilterCallback {
        void onFilterComplete(List<Hike> results);
    }
    
    /**
     * Insert a new observation
     */
    public void insertObservation(Observation observation) {
        new Thread(() -> {
            try {
                observationDao.insert(observation);
                postSuccessMessage("Observation added successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to add observation: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Update an existing observation
     */
    public void updateObservation(Observation observation) {
        new Thread(() -> {
            try {
                observation.updatedAt = System.currentTimeMillis();
                observationDao.update(observation);
                postSuccessMessage("Observation updated successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to update observation: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Delete an observation
     */
    public void deleteObservation(Observation observation) {
        new Thread(() -> {
            try {
                observationDao.delete(observation);
                postSuccessMessage("Observation deleted successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to delete observation: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Get observations for a specific hike
     */
    public LiveData<List<Observation>> getObservationsForHike(long hikeId) {
        return observationDao.getObservationsForHike(hikeId);
    }
    
    /**
     * Get a specific observation by ID
     */
    public LiveData<Observation> getObservationById(long observationId) {
        return observationDao.getObservationByIdLive(observationId);
    }
    
    /**
     * Delete all hikes and observations (reset database)
     */
    public void deleteAllData() {
        new Thread(() -> {
            try {
                hikeDao.deleteAllHikes();
                observationDao.deleteAllObservations();
                postSuccessMessage("Database reset successfully");
            } catch (Exception e) {
                postErrorMessage("Failed to reset database: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Get total hike count
     */
    public LiveData<Integer> getTotalHikeCount() {
        return hikeDao.getTotalHikeCount();
    }
    
    /**
     * Get total distance hiked
     */
    public LiveData<Float> getTotalDistance() {
        return hikeDao.getTotalDistance();
    }
    
    /**
     * Get search query MutableLiveData
     */
    public MutableLiveData<String> getSearchQuery() {
        return searchQuery;
    }
    
    /**
     * Get loading state
     */
    public MutableLiveData<Boolean> getIsLoading() {
        return isLoading;
    }
    
    /**
     * Get error message
     */
    public MutableLiveData<String> getErrorMessage() {
        return errorMessage;
    }
    
    /**
     * Get success message
     */
    public MutableLiveData<String> getSuccessMessage() {
        return successMessage;
    }
    
    /**
     * Post error message to UI
     */
    private void postErrorMessage(String message) {
        errorMessage.postValue(message);
    }
    
    /**
     * Post success message to UI
     */
    private void postSuccessMessage(String message) {
        successMessage.postValue(message);
    }
}
