package com.example.mhike.utils;

import android.content.Context;
import android.location.Address;
import android.location.Geocoder;
import android.util.Log;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

/**
 * GeocodingHelper - Utility class for reverse geocoding coordinates to place names
 * Uses Android's built-in Geocoder to convert latitude/longitude to human-readable addresses
 */
public class GeocodingHelper {
    
    private static final String TAG = "GeocodingHelper";
    private final Geocoder geocoder;
    
    /**
     * Callback interface for geocoding results
     */
    public interface GeocodeCallback {
        /**
         * Called when address is successfully retrieved
         * @param placeName Human-readable place name (city, locality, or address)
         * @param fullAddress Complete address details
         */
        void onAddressFound(String placeName, String fullAddress);
        
        /**
         * Called when geocoding fails or no address found
         * @param errorMessage Description of error
         */
        void onGeocodeError(String errorMessage);
    }
    
    public GeocodingHelper(Context context) {
        this.geocoder = new Geocoder(context, Locale.getDefault());
    }
    
    /**
     * Perform reverse geocoding on background thread
     * @param latitude Latitude coordinate
     * @param longitude Longitude coordinate
     * @param callback Callback with results
     */
    public void getPlaceName(double latitude, double longitude, GeocodeCallback callback) {
        // Run geocoding on background thread to avoid blocking UI
        new Thread(() -> {
            try {
                if (!Geocoder.isPresent()) {
                    callback.onGeocodeError("Geocoder service not available on this device");
                    Log.w(TAG, "Geocoder service not available");
                    return;
                }
                
                // Get addresses from coordinates
                List<Address> addresses = geocoder.getFromLocation(latitude, longitude, 1);
                
                if (addresses != null && !addresses.isEmpty()) {
                    Address address = addresses.get(0);
                    String placeName = getPlaceName(address);
                    String fullAddress = getFullAddress(address);
                    
                    Log.d(TAG, "Geocoded location: " + placeName);
                    callback.onAddressFound(placeName, fullAddress);
                } else {
                    callback.onGeocodeError("No address found for coordinates");
                    Log.w(TAG, "No addresses found for: " + latitude + ", " + longitude);
                }
            } catch (IOException e) {
                String errorMsg = "Geocoding failed: " + e.getMessage();
                callback.onGeocodeError(errorMsg);
                Log.e(TAG, errorMsg, e);
            }
        }).start();
    }
    
    /**
     * Extract best place name from address
     * Priority: city > locality > thoroughfare > country
     * @param address Android Address object
     * @return Human-readable place name
     */
    private String getPlaceName(Address address) {
        // Priority order for place name extraction
        if (address.getLocality() != null && !address.getLocality().isEmpty()) {
            // City/locality is most specific and readable
            return address.getLocality();
        } else if (address.getAdminArea() != null && !address.getAdminArea().isEmpty()) {
            // Province/state if city not available
            return address.getAdminArea();
        } else if (address.getThoroughfare() != null && !address.getThoroughfare().isEmpty()) {
            // Street name if province not available
            return address.getThoroughfare();
        } else if (address.getCountryName() != null && !address.getCountryName().isEmpty()) {
            // Country as fallback
            return address.getCountryName();
        } else {
            // Last resort: coordinates format
            return String.format("%.4f, %.4f", address.getLatitude(), address.getLongitude());
        }
    }
    
    /**
     * Build complete address string from address object
     * Format: Street, City, Province, Country
     * @param address Android Address object
     * @return Complete formatted address
     */
    private String getFullAddress(Address address) {
        StringBuilder fullAddress = new StringBuilder();
        
        // Add street address if available
        if (address.getThoroughfare() != null && !address.getThoroughfare().isEmpty()) {
            fullAddress.append(address.getThoroughfare());
        }
        
        // Add premise/building number if available
        if (address.getFeatureName() != null && !address.getFeatureName().isEmpty()
                && !address.getFeatureName().equals(address.getThoroughfare())) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getFeatureName());
        }
        
        // Add locality/city
        if (address.getLocality() != null && !address.getLocality().isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getLocality());
        }
        
        // Add admin area (province/state)
        if (address.getAdminArea() != null && !address.getAdminArea().isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getAdminArea());
        }
        
        // Add country
        if (address.getCountryName() != null && !address.getCountryName().isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getCountryName());
        }
        
        return fullAddress.toString().isEmpty() 
            ? String.format("Latitude: %.6f, Longitude: %.6f", address.getLatitude(), address.getLongitude())
            : fullAddress.toString();
    }
}
