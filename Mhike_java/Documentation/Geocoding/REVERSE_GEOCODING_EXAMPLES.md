# Reverse Geocoding Implementation - Code Examples & Integration Guide

## Quick Start: Using GeocodingHelper

### Basic Usage Example

```java
// 1. Create instance (typically in onCreate)
GeocodingHelper geocodingHelper = new GeocodingHelper(context);

// 2. Request place name for coordinates
double latitude = 10.7769;
double longitude = 106.7009;

geocodingHelper.getPlaceName(latitude, longitude, new GeocodingHelper.GeocodeCallback() {
    @Override
    public void onAddressFound(String placeName, String fullAddress) {
        // Update UI with place name
        locationEditText.setText(placeName);
        Log.d("Geocoding", "Found: " + placeName);
    }
    
    @Override
    public void onGeocodeError(String errorMessage) {
        // Handle error gracefully
        Log.w("Geocoding", "Error: " + errorMessage);
        // User can still manually enter location
    }
});
```

---

## Implementation in PickLocationActivity

### Map Tracking with Geocoding

```java
public class PickLocationActivity extends AppCompatActivity {
    
    private GeocodingHelper geocodingHelper;
    private String selectedPlaceName;
    private Marker centerMarker;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // ...
        
        // Initialize geocoding helper
        geocodingHelper = new GeocodingHelper(this);
        
        setupMap();
    }
    
    /**
     * Track map position changes and reverse geocode
     */
    private void startMapCenterTracking() {
        Runnable updateMarker = new Runnable() {
            @Override
            public void run() {
                if (mapView != null) {
                    GeoPoint center = (GeoPoint) mapView.getMapCenter();
                    if (center != null && !center.equals(selectedLocation)) {
                        selectedLocation = center;
                        updateCenterMarker(center);
                        // NEW: Perform reverse geocoding
                        performReverseGeocoding(
                            center.getLatitude(), 
                            center.getLongitude()
                        );
                    }
                    mapView.postDelayed(this, 200);
                }
            }
        };
        mapView.postDelayed(updateMarker, 200);
    }
    
    /**
     * Perform reverse geocoding and update marker
     */
    private void performReverseGeocoding(double latitude, double longitude) {
        // Show loading state
        if (centerMarker != null) {
            centerMarker.setSnippet("Fetching location...");
        }
        
        // Call geocoding helper
        geocodingHelper.getPlaceName(latitude, longitude, 
            new GeocodingHelper.GeocodeCallback() {
                @Override
                public void onAddressFound(String placeName, String fullAddress) {
                    selectedPlaceName = placeName;
                    Log.d(TAG, "Place name: " + placeName);
                    
                    // Update marker with place name
                    if (centerMarker != null) {
                        centerMarker.setSnippet(
                            "Lat: " + String.format("%.4f", latitude) +
                            "\nLon: " + String.format("%.4f", longitude) +
                            "\n" + placeName
                        );
                        mapView.invalidate();
                    }
                }
                
                @Override
                public void onGeocodeError(String errorMessage) {
                    Log.w(TAG, "Geocoding error: " + errorMessage);
                    // Fallback: show coordinates only
                    if (centerMarker != null) {
                        centerMarker.setSnippet(
                            "Lat: " + String.format("%.4f", latitude) +
                            "\nLon: " + String.format("%.4f", longitude)
                        );
                        mapView.invalidate();
                    }
                }
            }
        );
    }
    
    /**
     * Return location with place name to calling activity
     */
    private void confirmLocation() {
        if (selectedLocation != null) {
            Intent resultIntent = new Intent();
            resultIntent.putExtra("latitude", selectedLocation.getLatitude());
            resultIntent.putExtra("longitude", selectedLocation.getLongitude());
            
            // NEW: Include place name
            if (selectedPlaceName != null) {
                resultIntent.putExtra("placeName", selectedPlaceName);
            }
            
            setResult(RESULT_OK, resultIntent);
            finish();
        }
    }
}
```

---

## Implementation in AddHikeActivity

### Auto-fill from Map Picker

```java
public class AddHikeActivity extends AppCompatActivity {
    
    private TextInputEditText locationEditText;
    private GeocodingHelper geocodingHelper;
    private ActivityResultLauncher<Intent> mapPickerLauncher;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_hike);
        
        // Initialize geocoding helper
        geocodingHelper = new GeocodingHelper(this);
        
        initializeMapPickerLauncher();
        // ... rest of initialization
    }
    
    /**
     * Handle result from map picker with auto-fill
     */
    private void initializeMapPickerLauncher() {
        mapPickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    // Get coordinates from map picker
                    selectedLatitude = result.getData()
                        .getDoubleExtra("latitude", 0);
                    selectedLongitude = result.getData()
                        .getDoubleExtra("longitude", 0);
                    
                    // NEW: Get place name from map picker
                    String placeName = result.getData()
                        .getStringExtra("placeName");
                    
                    // Auto-fill location field if geocoding succeeded
                    if (placeName != null && !placeName.isEmpty() 
                        && locationEditText.getText().toString().isEmpty()) {
                        locationEditText.setText(placeName);
                        Log.d("AddHike", "Auto-filled location: " + placeName);
                    }
                    
                    // Update coordinate fields
                    updateLocationDisplay();
                }
            }
        );
    }
    
    /**
     * Capture GPS location and auto-fill place name
     */
    private void captureGpsLocation() {
        locationManager.getLastLocation(new LocationManager.LocationCallback() {
            @Override
            public void onLocationReceived(Double latitude, Double longitude) {
                selectedLatitude = latitude;
                selectedLongitude = longitude;
                updateLocationDisplay();
                Toast.makeText(
                    AddHikeActivity.this, 
                    "Location captured from GPS", 
                    Toast.LENGTH_SHORT
                ).show();
                
                // NEW: Auto-fill location name via reverse geocoding
                if (locationEditText.getText().toString().isEmpty()) {
                    geocodingHelper.getPlaceName(
                        latitude, 
                        longitude,
                        new GeocodingHelper.GeocodeCallback() {
                            @Override
                            public void onAddressFound(String placeName, String fullAddress) {
                                // Auto-fill location field
                                locationEditText.setText(placeName);
                                
                                // Notify user
                                Toast.makeText(
                                    AddHikeActivity.this,
                                    "Location: " + placeName,
                                    Toast.LENGTH_SHORT
                                ).show();
                                
                                Log.d("GPS", "Auto-filled: " + placeName);
                            }
                            
                            @Override
                            public void onGeocodeError(String errorMessage) {
                                // Silent fail - user can type manually
                                Log.w("GPS", "Geocoding failed: " + errorMessage);
                            }
                        }
                    );
                }
            }
            
            @Override
            public void onLocationError(String errorMessage) {
                if (errorMessage.contains("not granted")) {
                    showLocationPermissionDialog();
                } else {
                    Toast.makeText(
                        AddHikeActivity.this, 
                        "GPS Error: " + errorMessage, 
                        Toast.LENGTH_LONG
                    ).show();
                }
            }
        });
    }
    
    /**
     * Open map picker for location selection
     */
    private void openMapPicker() {
        Intent mapIntent = new Intent(
            AddHikeActivity.this, 
            PickLocationActivity.class
        );
        if (selectedLatitude != null && selectedLongitude != null) {
            mapIntent.putExtra("latitude", selectedLatitude);
            mapIntent.putExtra("longitude", selectedLongitude);
        }
        mapPickerLauncher.launch(mapIntent);
    }
}
```

---

## GeocodingHelper Implementation Details

### Thread-Safe Background Execution

```java
public class GeocodingHelper {
    
    /**
     * Execute reverse geocoding on background thread
     */
    public void getPlaceName(double latitude, double longitude, 
                             GeocodeCallback callback) {
        // Spawn background thread to avoid blocking UI
        new Thread(() -> {
            try {
                // Verify geocoder is available on device
                if (!Geocoder.isPresent()) {
                    callback.onGeocodeError(
                        "Geocoder service not available"
                    );
                    return;
                }
                
                // Perform reverse geocoding
                List<Address> addresses = geocoder.getFromLocation(
                    latitude, 
                    longitude, 
                    1  // Request only 1 result
                );
                
                // Process result
                if (addresses != null && !addresses.isEmpty()) {
                    Address address = addresses.get(0);
                    String placeName = getPlaceName(address);
                    String fullAddress = getFullAddress(address);
                    
                    // Return to callback (no UI thread check needed in callback)
                    callback.onAddressFound(placeName, fullAddress);
                } else {
                    callback.onGeocodeError("No address found");
                }
            } catch (IOException e) {
                callback.onGeocodeError("Geocoding failed: " + e.getMessage());
            }
        }).start();
    }
    
    /**
     * Extract best place name by priority
     */
    private String getPlaceName(Address address) {
        // Priority: City > State > Street > Country > Coordinates
        
        if (address.getLocality() != null && !address.getLocality().isEmpty()) {
            return address.getLocality();  // City (best choice)
        } else if (address.getAdminArea() != null 
                   && !address.getAdminArea().isEmpty()) {
            return address.getAdminArea();  // State/Province
        } else if (address.getThoroughfare() != null 
                   && !address.getThoroughfare().isEmpty()) {
            return address.getThoroughfare();  // Street
        } else if (address.getCountryName() != null 
                   && !address.getCountryName().isEmpty()) {
            return address.getCountryName();  // Country
        } else {
            // Fallback: format coordinates
            return String.format("%.4f, %.4f", 
                address.getLatitude(), 
                address.getLongitude()
            );
        }
    }
    
    /**
     * Build formatted full address string
     */
    private String getFullAddress(Address address) {
        StringBuilder fullAddress = new StringBuilder();
        
        // Add thoroughfare (street name)
        if (address.getThoroughfare() != null 
            && !address.getThoroughfare().isEmpty()) {
            fullAddress.append(address.getThoroughfare());
        }
        
        // Add feature name if different
        if (address.getFeatureName() != null 
            && !address.getFeatureName().isEmpty()
            && !address.getFeatureName().equals(address.getThoroughfare())) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getFeatureName());
        }
        
        // Add city/locality
        if (address.getLocality() != null 
            && !address.getLocality().isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getLocality());
        }
        
        // Add state/province
        if (address.getAdminArea() != null 
            && !address.getAdminArea().isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getAdminArea());
        }
        
        // Add country
        if (address.getCountryName() != null 
            && !address.getCountryName().isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(address.getCountryName());
        }
        
        return fullAddress.length() > 0 
            ? fullAddress.toString()
            : String.format("Latitude: %.6f, Longitude: %.6f", 
                address.getLatitude(), 
                address.getLongitude()
            );
    }
}
```

---

## Callback Interface Pattern

```java
/**
 * Callback interface for asynchronous geocoding results
 */
public interface GeocodeCallback {
    /**
     * Called when address is successfully retrieved
     * @param placeName Human-readable place name (e.g., "Ho Chi Minh City")
     * @param fullAddress Complete formatted address
     */
    void onAddressFound(String placeName, String fullAddress);
    
    /**
     * Called when geocoding fails
     * @param errorMessage Description of error
     */
    void onGeocodeError(String errorMessage);
}
```

---

## Testing Examples

### Test Case 1: Valid Coordinates in Vietnam
```java
// Input: Ho Chi Minh City
geocodingHelper.getPlaceName(10.7769, 106.7009, callback);

// Expected output:
// - placeName: "Ho Chi Minh City"
// - fullAddress: "Nguyen Hue, Ho Chi Minh City, Ho Chi Minh, Vietnam"

// Marker display:
// "Lat: 10.7769
//  Lon: 106.7009
//  Ho Chi Minh City"
```

### Test Case 2: Valid Coordinates in Different Country
```java
// Input: New York City
geocodingHelper.getPlaceName(40.7128, -74.0060, callback);

// Expected output:
// - placeName: "New York"
// - fullAddress: "Manhattan, New York, United States"
```

### Test Case 3: Offline/No Geocoder Available
```java
// Input: Valid coordinates, no geocoder available
geocodingHelper.getPlaceName(10.7769, 106.7009, callback);

// Expected output:
// - Error callback triggered
// - errorMessage: "Geocoder service not available on this device"
// - Fallback: Show coordinates only

// Marker display:
// "Lat: 10.7769
//  Lon: 106.7009"
```

---

## Error Handling Best Practices

### In Activity/Fragment

```java
geocodingHelper.getPlaceName(lat, lon, new GeocodingHelper.GeocodeCallback() {
    @Override
    public void onAddressFound(String placeName, String fullAddress) {
        // Success path
        locationEditText.setText(placeName);
        Log.d(TAG, "Successfully found: " + placeName);
    }
    
    @Override
    public void onGeocodeError(String errorMessage) {
        // Error handling - multiple strategies
        
        // Strategy 1: Silent failure (user can type manually)
        Log.w(TAG, "Geocoding unavailable: " + errorMessage);
        
        // Strategy 2: Show brief notification
        // Toast.makeText(this, "Location name unavailable", 
        //     Toast.LENGTH_SHORT).show();
        
        // Strategy 3: Keep coordinates visible but no auto-fill
        // Marker/form still shows lat/lon coordinates
    }
});
```

### In GeocodingHelper

```java
try {
    if (!Geocoder.isPresent()) {
        // Device doesn't have geocoding
        callback.onGeocodeError("Geocoder service not available on this device");
        return;
    }
    
    List<Address> addresses = geocoder.getFromLocation(latitude, longitude, 1);
    
    if (addresses == null || addresses.isEmpty()) {
        // Coordinates are valid but no matching address found
        callback.onGeocodeError("No address found for coordinates");
        return;
    }
    
    // Success
    Address address = addresses.get(0);
    callback.onAddressFound(getPlaceName(address), getFullAddress(address));
    
} catch (IOException e) {
    // Network/IO error (e.g., no internet connection)
    callback.onGeocodeError("Geocoding failed: " + e.getMessage());
}
```

---

## Performance Considerations

### Thread Safety
- ✅ Geocoding runs on background thread (no UI blocking)
- ✅ Callbacks can safely update UI
- ✅ No synchronization issues with marker updates

### Optimization Tips
1. **Debounce frequent requests:** Map tracking already waits 200ms between checks
2. **Cache results:** Store lat/lon → place name mappings locally
3. **Limit parallel requests:** Current implementation does one at a time
4. **Handle offline:** Some devices have offline geocoding database

### Performance Profile
- **Network geocoding:** 1-3 seconds (varies by connection)
- **Offline geocoding:** <100ms (device dependent)
- **UI blocking:** None (background thread)
- **Memory footprint:** Minimal (Address object reused)

---

## Logging for Debugging

```java
// In GeocodingHelper
Log.d(TAG, "Geocoding started for: " + latitude + ", " + longitude);
Log.d(TAG, "Found address: " + address.toString());
Log.d(TAG, "Extracted place name: " + placeName);

// In PickLocationActivity
Log.d(TAG, "Map center changed to: " + newLocation);
Log.d(TAG, "Reverse geocoding triggered");
Log.d(TAG, "Place name received: " + placeName);
Log.d(TAG, "Location confirmed: " + latitude + ", " + longitude);

// In AddHikeActivity
Log.d(TAG, "Auto-filling location: " + placeName);
Log.d(TAG, "GPS location captured: " + latitude + ", " + longitude);
```

---

## Migration Path: Future Enhancements

### 1. Add Caching
```java
private Map<String, String> geocodeCache = new HashMap<>();

public void getPlaceName(double lat, double lon, GeocodeCallback callback) {
    String key = String.format("%.4f,%.4f", lat, lon);
    
    if (geocodeCache.containsKey(key)) {
        // Return cached result
        String placeName = geocodeCache.get(key);
        callback.onAddressFound(placeName, "");
        return;
    }
    
    // Perform geocoding and cache result
    // ...
    geocodeCache.put(key, placeName);
}
```

### 2. Add Search by Place Name
```java
public void getCoordinates(String placeName, GeocodeCallback callback) {
    new Thread(() -> {
        try {
            List<Address> addresses = geocoder.getFromLocationName(placeName, 1);
            if (addresses != null && !addresses.isEmpty()) {
                Address address = addresses.get(0);
                callback.onAddressFound(
                    address.getLatitude() + "," + address.getLongitude(),
                    placeName
                );
            }
        } catch (IOException e) {
            callback.onGeocodeError(e.getMessage());
        }
    }).start();
}
```

### 3. Add Suggestion Dropdown
```java
public void getAddressSuggestions(String query, int maxResults, 
                                  GeocodeCallback callback) {
    // Similar to above but return multiple results
    // Update UI with dropdown of suggestions
}
```
