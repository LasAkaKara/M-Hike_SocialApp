# Architecture Diagram - Reverse Geocoding Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AddHikeActivity                        │
│                    (Hike Creation Form)                    │
│                                                             │
│  ┌──────────────────────┐          ┌────────────────────┐  │
│  │ Location Field       │          │ GPS Button         │  │
│  │ (auto-filled)        │◄─────────│ Map Picker Button  │  │
│  └──────────────────────┘          └────────────────────┘  │
│                ▲                              │              │
│                │                              │              │
│                │ placeName result            │ launches     │
│                │                              ▼              │
│  ┌─────────────┴──────────────────────────────────────────┐ │
│  │        GeocodingHelper (Utility)                       │ │
│  │  • getPlaceName(lat, lon, callback)                   │ │
│  │  • Background threading                               │ │
│  │  • Priority-based name extraction                     │ │
│  └─────────────┬──────────────────────────────────────────┘ │
│                │ (shared instance)                          │
└────────────────┼──────────────────────────────────────────┘
                 │
                 │ uses
                 ▼
         ┌──────────────────┐
         │  PickLocation    │
         │  Activity        │
         │                  │
         │ • Map display    │
         │ • Marker updates │
         │ • Geocoding      │
         │                  │
         └────────┬─────────┘
                  │
                  │ reverse geocoding
                  ▼
         ┌──────────────────────┐
         │  Android Geocoder    │
         │                      │
         │ • Location Services  │
         │ • Address lookup     │
         │ • (online/offline)   │
         └──────────────────────┘
```

## Data Flow - Map Picker Workflow

```
User Action                    AddHikeActivity              PickLocationActivity        GeocodingHelper
    │                                │                            │                         │
    ├─ Tap "Pick on Map"────────────>│                            │                         │
    │                                ├────── startActivity────────>│                         │
    │                                │                            │                         │
    │                                │                      User drags map                  │
    │                                │                    (every 200ms update)              │
    │                                │                            │                         │
    │                                │◄─── performReverseGeocoding request ───────────────>│
    │                                │                            │ (background thread)     │
    │                                │                            │                         │
    │                                │                            │◄─ address + placeName──┤
    │                                │                    Update marker snippet            │
    │                                │                            │                         │
    │                          User taps confirm                  │                         │
    │                                │◄────── Return result────────┤                         │
    │                                │ (lat, lon, placeName)       │                         │
    │                                │                                                      │
    │                    Auto-fill location field                 │                         │
    │◄────────────── Show updated form ─────────────             │                         │
    │
```

## Data Flow - GPS Workflow

```
User Action                  AddHikeActivity        LocationManager        GeocodingHelper       Android Location
    │                              │                      │                      │                    │
    ├─ Tap "Get GPS Location"──────>│                      │                      │                    │
    │                              ├─ getLastLocation────>│                      │                    │
    │                              │                      ├──────── Request location ──────────────>│
    │                              │                      │                      │                    │
    │                              │                      │◄────── GPS coordinates ─────────────────┤
    │                              │◄─ onLocationReceived ┤                      │                    │
    │                              │                      │                      │                    │
    │         Update lat/lon fields & show GPS toast      │                      │                    │
    │                              │                      │                      │                    │
    │                              ├─ getPlaceName(lat,lon)──────────────────────>│                    │
    │                              │ (background thread)  │                      │                    │
    │                              │                      │                      │                    │
    │                              │◄─ onAddressFound ────┤◄──── reverse geocode ──────────┐         │
    │                              │                      │        (online/offline)         │         │
    │         Auto-fill location field with place name    │                                │         │
    │◄────────── Show updated form + location name toast ─                                │         │
    │
```

## Address Extraction Priority

```
Raw Address Object
    │
    ├─ Locality? (e.g., "Ho Chi Minh City")
    │   YES → Use this ✓
    │   NO  ↓
    │
    ├─ Admin Area? (e.g., "Ho Chi Minh")
    │   YES → Use this ✓
    │   NO  ↓
    │
    ├─ Thoroughfare? (e.g., "Nguyen Hue Blvd")
    │   YES → Use this ✓
    │   NO  ↓
    │
    ├─ Country Name? (e.g., "Vietnam")
    │   YES → Use this ✓
    │   NO  ↓
    │
    └─ Fallback: Coordinates (e.g., "10.7769, 106.7009")
```

## Threading Model

```
┌──────────────────────────────────────┐
│        UI Thread (Main)              │
│                                      │
│  • User interactions                 │
│  • UI updates                        │
│  • Activity lifecycle                │
│                                      │
└──────────┬───────────────────────────┘
           │
           │ spawns (new Thread())
           ▼
┌──────────────────────────────────────┐
│    Background Thread (Geocoding)     │
│                                      │
│  • Geocoder.getFromLocation()        │
│  • Address parsing                   │
│  • No blocking on UI                 │
│                                      │
└──────────┬───────────────────────────┘
           │
           │ runOnUiThread() callback
           ▼
┌──────────────────────────────────────┐
│        UI Thread Updates             │
│                                      │
│  • Marker snippets                   │
│  • Toast notifications               │
│  • Text field auto-fill              │
│                                      │
└──────────────────────────────────────┘
```

## Component Dependencies

```
┌─────────────────────────┐
│   GeocodingHelper       │ ◄─── NEW UTILITY
│                         │
│ • Geocoder instance     │
│ • Background threading  │
│ • Callback pattern      │
│ • Address hierarchy     │
└────────────┬────────────┘
             │
             │ used by
             │
    ┌────────┴──────────┐
    │                   │
    ▼                   ▼
┌──────────────┐  ┌──────────────────┐
│PickLocation  │  │ AddHikeActivity  │
│ Activity     │  │ (GPS & map)      │
│              │  │                  │
│ • Map UI     │  │ • Form           │
│ • Geocoding  │  │ • GPS capture    │
│   trigger    │  │ • Map launch     │
└──────────────┘  └──────────────────┘
```

## Request/Response Pattern

```
Interface: GeocodeCallback

┌─────────────────────────────────────────┐
│        GeocodeCallback                  │
├─────────────────────────────────────────┤
│ void onAddressFound(                    │
│     String placeName,                   │
│     String fullAddress                  │
│ )                                       │
├─────────────────────────────────────────┤
│ void onGeocodeError(                    │
│     String errorMessage                 │
│ )                                       │
└─────────────────────────────────────────┘
```

## State Diagram - Geocoding Process

```
                    ┌─────────────────┐
                    │  START          │
                    │  (User selects  │
                    │   location)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  FETCHING       │
                    │  Geocoder       │
                    │  performing     │
                    │  reverse lookup │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │                         │
                ▼                         ▼
       ┌──────────────────┐     ┌──────────────────┐
       │  SUCCESS         │     │  ERROR/FAILURE   │
       │  Address found   │     │  No address or   │
       │  Place name      │     │  geocoder        │
       │  extracted       │     │  unavailable     │
       │                  │     │  Fallback to     │
       └────────┬─────────┘     │  coordinates     │
                │               └────────┬─────────┘
                │                        │
                └────────────┬───────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  COMPLETE       │
                    │  Callback       │
                    │  executed       │
                    │  UI updated     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  END            │
                    │  Location field │
                    │  auto-filled    │
                    └─────────────────┘
```

## Example: Ho Chi Minh City Detection

```
GPS Coordinates: (10.7769, 106.7009)
                    │
                    ▼
             GeocodingHelper
             (reverse geocoding)
                    │
                    ▼
        Android Geocoder Response:
        ┌─────────────────────────────────┐
        │ Address                         │
        │ - thoroughfare: "Nguyen Hue"    │
        │ - locality: "Ho Chi Minh City"  │
        │ - adminArea: "Ho Chi Minh"      │
        │ - countryName: "Vietnam"        │
        └─────────────────────────────────┘
                    │
                    ▼
         Priority-based Extraction:
         1. Locality found? YES ✓
         
         RESULT: "Ho Chi Minh City"
                    │
                    ▼
        UI Updates:
        ├─ Marker: "Lat: 10.7769\nLon: 106.7009\nHo Chi Minh City"
        └─ Form: locationEditText.setText("Ho Chi Minh City")
```
