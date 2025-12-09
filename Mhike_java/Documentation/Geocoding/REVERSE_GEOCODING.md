# Reverse Geocoding Implementation - Location Auto-Fill Feature

## Overview

Implemented automatic place name detection using reverse geocoding. When users pick a location on the map or capture via GPS, the app now automatically fetches and displays the human-readable place name (city, locality, or address), eliminating the need for manual entry.

## Changes Made

### 1. New Utility Class: `GeocodingHelper.java`

**Location:** `app/src/main/java/com/example/mhike/utils/GeocodingHelper.java`

**Purpose:** Encapsulates reverse geocoding logic using Android's built-in `Geocoder` class.

**Key Features:**
- **Threaded Operation:** Performs geocoding on background thread to avoid UI blocking
- **Callback Pattern:** Uses `GeocodeCallback` interface for asynchronous results
- **Smart Fallback:** Returns coordinates if address lookup fails
- **Address Hierarchy:** Extracts place names by priority:
  1. **Locality/City** (most specific and readable)
  2. **State/Province** (if city unavailable)
  3. **Street/Thoroughfare** (street names)
  4. **Country** (least specific)
  5. **Coordinates** (fallback if nothing else)
- **Full Address Construction:** Builds complete formatted address (Street, City, Province, Country)

**Key Methods:**
```java
public void getPlaceName(double latitude, double longitude, GeocodeCallback callback)
// Performs reverse geocoding and calls callback with results

private String getPlaceName(Address address)
// Extracts best place name by priority

private String getFullAddress(Address address)
// Builds complete address string
```

**Callback Interface:**
```java
public interface GeocodeCallback {
    void onAddressFound(String placeName, String fullAddress);
    void onGeocodeError(String errorMessage);
}
```

---

### 2. Updated: `PickLocationActivity.java`

**Changes:**
1. **Added GeocodingHelper field** - Initialized in `onCreate()`
2. **Real-time geocoding** - Automatically performs reverse geocoding when map position changes
3. **Marker updates** - Shows place name in marker snippet along with coordinates
4. **Result intent** - Now passes `placeName` back to calling activity
5. **Loading state** - Shows "Fetching location..." while geocoding is in progress

**Modified Methods:**
```java
// New: Initialize geocoding helper
@Override
protected void onCreate(Bundle savedInstanceState) {
    geocodingHelper = new GeocodingHelper(this);
    // ... rest of initialization
}

// Updated: Track map changes and trigger geocoding
private void startMapCenterTracking() {
    // ... when position changes:
    performReverseGeocoding(center.getLatitude(), center.getLongitude());
}

// New: Perform reverse geocoding on location change
private void performReverseGeocoding(double latitude, double longitude)

// Updated: Include place name in marker snippet
private void updateCenterMarker(GeoPoint newLocation)

// Updated: Return place name in intent result
private void confirmLocation()
```

**User Feedback:**
- Marker snippet shows: "Lat: X.XXXX\nLon: X.XXXX\n[Place Name]"
- Loading state displays: "Fetching location..."
- Falls back to coordinates if geocoding unavailable

---

### 3. Updated: `AddHikeActivity.java`

**Changes:**
1. **Added GeocodingHelper field** - Initialized in `onCreate()`
2. **Auto-fill from map picker** - Receives `placeName` from `PickLocationActivity` and auto-fills location field if empty
3. **Auto-fill from GPS** - When GPS location captured, performs reverse geocoding to auto-fill location name
4. **User notifications** - Toast message shows detected place name

**Modified Methods:**
```java
// Updated: Initialize geocoding helper
@Override
protected void onCreate(Bundle savedInstanceState) {
    geocodingHelper = new GeocodingHelper(this);
    // ... rest of initialization
}

// Updated: Map picker result handler
private void initializeMapPickerLauncher() {
    // Receive placeName from PickLocationActivity
    String placeName = result.getData().getStringExtra("placeName");
    if (placeName != null && !placeName.isEmpty()) {
        locationEditText.setText(placeName);  // Auto-fill if empty
    }
}

// Updated: GPS capture with reverse geocoding
private void captureGpsLocation() {
    // After getting GPS coordinates, performs reverse geocoding
    geocodingHelper.getPlaceName(latitude, longitude, callback);
    // Shows toast: "Location name: [city]"
}
```

**User Experience:**
1. User taps "Get GPS Location" button
2. App captures coordinates and shows toast "Location captured from GPS"
3. App performs reverse geocoding in background
4. Location name field auto-fills with detected place name
5. Shows secondary toast "Location name: [City Name]"

---

## User Flow Examples

### Scenario 1: Map Picker
```
User taps "Pick on Map"
  ↓
PickLocationActivity opens with default location
  ↓
User drags map to new location
  ↓
Marker updates showing coordinates + "Fetching location..."
  ↓
Geocoding completes, marker shows: "Lat: 10.7769\nLon: 106.7009\nHo Chi Minh City"
  ↓
User taps Confirm
  ↓
AddHikeActivity receives:
  - latitude: 10.7769
  - longitude: 106.7009
  - placeName: "Ho Chi Minh City"
  ↓
Location field auto-fills with "Ho Chi Minh City"
```

### Scenario 2: GPS Location
```
User taps "Get GPS Location"
  ↓
Toast: "Location captured from GPS"
  ↓
App starts reverse geocoding in background
  ↓
Latitude/Longitude fields update with GPS coordinates
  ↓
Toast: "Location name: Da Lat" (after ~1-2 seconds)
  ↓
Location field auto-fills with "Da Lat"
```

---

## Technical Details

### Geocoder Service
- **Provider:** Android's built-in `android.location.Geocoder` class
- **Permissions:** Uses existing `android.permission.ACCESS_FINE_LOCATION` (already declared)
- **Backend:** Uses device's location services (Google/offline database depending on device)
- **Threading:** Safe background thread operation

### Address Priority Logic
The `getPlaceName()` method prioritizes address components:
```
Priority 1: Locality (e.g., "Ho Chi Minh City")
Priority 2: Admin Area (e.g., "Ho Chi Minh")
Priority 3: Thoroughfare (e.g., "Nguyen Hue Boulevard")
Priority 4: Country (e.g., "Vietnam")
Priority 5: Fallback coordinates (e.g., "10.7769, 106.7009")
```

### Error Handling
- **No geocoder available:** Shows only coordinates (device-dependent)
- **Network unavailable:** Uses offline geocoder (varies by device)
- **Invalid coordinates:** Callback notifies with error message
- **User cancels:** Gracefully handles with continue/cancel options

---

## Files Modified

| File | Changes |
|------|---------|
| `GeocodingHelper.java` | **NEW** - Core reverse geocoding utility |
| `PickLocationActivity.java` | Added geocoding on map position change, place name in result |
| `AddHikeActivity.java` | Added auto-fill from geocoding results (both GPS and map picker) |

---

## Testing Checklist

- [x] Geocoding utility created and compiles
- [x] PickLocationActivity receives geocoding helper
- [x] Map position changes trigger reverse geocoding
- [x] Marker snippet updates with place name
- [x] Place name returned in result intent
- [x] AddHikeActivity receives and auto-fills place name
- [x] GPS location capture triggers geocoding
- [x] Location field auto-fills when previously empty
- [x] Toast notifications show place names
- [x] Error handling works gracefully

---

## Benefits

1. **User Convenience:** No manual location name entry required
2. **Data Quality:** Reduces typos and inconsistent location naming
3. **Time Saving:** Faster form completion
4. **Flexibility:** Still allows manual override if needed
5. **Offline Capable:** Works on devices with offline geocoding
6. **Non-Blocking:** Background threading prevents UI freezes
7. **Graceful Fallback:** Shows coordinates if geocoding unavailable

---

## Future Enhancements

1. **Search Suggestions:** Add autocomplete for location names based on user input
2. **Recent Locations:** Cache frequently used locations
3. **Geocoding Cache:** Store coordinates→name mappings locally
4. **Multiple Results:** Show top 3 geocoding results as suggestions
5. **Offline Database:** Bundle offline geocoding database for completely offline support
6. **Reverse Address:** Allow searching by place name to find coordinates
7. **Favorites:** Save favorite hiking locations for quick access

---

## Dependencies

- **Android Location Services** (already included)
- **Java Thread API** (built-in)
- **No new external dependencies required**

All functionality uses Android framework's built-in `Geocoder` class, requiring no additional library additions to `build.gradle.kts`.
