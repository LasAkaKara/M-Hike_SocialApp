package com.example.mhike.services;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.Task;

/**
 * LocationManager - Service for retrieving device location using FusedLocationProviderClient
 * Provides GPS coordinates for tagging observations with geolocation data
 */
public class LocationManager {
    
    private static final String TAG = "LocationManager";
    private final FusedLocationProviderClient fusedLocationClient;
    private final Context context;
    
    public interface LocationCallback {
        void onLocationReceived(Double latitude, Double longitude);
        void onLocationError(String errorMessage);
    }
    
    public LocationManager(Context context) {
        this.context = context;
        this.fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
    }
    
    /**
     * Get the last known location from device GPS
     * Uses cached location data for instant retrieval
     *
     * @param callback Callback to handle location result or error
     */
    public void getLastLocation(LocationCallback callback) {
        try {
            // Check if location permissions are granted
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
                    != PackageManager.PERMISSION_GRANTED
                    && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
                    != PackageManager.PERMISSION_GRANTED) {
                callback.onLocationError("Location permissions not granted");
                return;
            }
            
            // Get last location
            Task<Location> locationTask = fusedLocationClient.getLastLocation();
            
            locationTask.addOnSuccessListener(location -> {
                if (location != null) {
                    Log.d(TAG, "Location received: " + location.getLatitude() + ", " + location.getLongitude());
                    callback.onLocationReceived(location.getLatitude(), location.getLongitude());
                } else {
                    Log.w(TAG, "Last location is null - device may not have GPS enabled or no recent location");
                    callback.onLocationError("Unable to retrieve location. Ensure GPS is enabled and location has been accessed recently.");
                }
            });
            
            locationTask.addOnFailureListener(e -> {
                Log.e(TAG, "Failed to get location", e);
                callback.onLocationError("Failed to get location: " + e.getMessage());
            });
            
        } catch (Exception e) {
            Log.e(TAG, "Exception in getLastLocation", e);
            callback.onLocationError("Exception: " + e.getMessage());
        }
    }
}
