package com.example.mhike.ui.location;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.mhike.R;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;

/**
 * PickLocationActivity - Map-based location picker using osmdroid
 * Allows users to select a location by tapping on the map or viewing default location
 */
public class PickLocationActivity extends AppCompatActivity {
    
    private static final String TAG = "PickLocationActivity";
    private static final double DEFAULT_LATITUDE = 10.803554430818393;  // Greenwich Vietnam
    private static final double DEFAULT_LONGITUDE =  106.65308589856022;
    private static final int DEFAULT_ZOOM = 13;
    
    private MapView mapView;
    private MaterialButton confirmButton;
    private MaterialButton cancelButton;
    private FloatingActionButton jumpToGpsButton;
    
    private GeoPoint selectedLocation;
    private Marker centerMarker;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pick_location);
        
        // Initialize osmdroid configuration
        Configuration.getInstance().setUserAgentValue(getString(R.string.app_name));
        
        initializeUI();
        setupMap();
        setupListeners();
    }
    
    private void initializeUI() {
        mapView = findViewById(R.id.mapView);
        confirmButton = findViewById(R.id.confirmLocationButton);
        cancelButton = findViewById(R.id.cancelLocationButton);
        jumpToGpsButton = findViewById(R.id.jumpToGpsButton);
        
        // Set up toolbar
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.locationPickerTopAppBar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupMap() {
        // Set map tile source (OpenStreetMap)
        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setMultiTouchControls(true);
        
        // Get map controller
        IMapController mapController = mapView.getController();
        mapController.setZoom(DEFAULT_ZOOM);
        
        // Check if location was passed from intent
        double latitude = getIntent().getDoubleExtra("latitude", DEFAULT_LATITUDE);
        double longitude = getIntent().getDoubleExtra("longitude", DEFAULT_LONGITUDE);
        
        GeoPoint startPoint = new GeoPoint(latitude, longitude);
        mapController.setCenter(startPoint);
        selectedLocation = startPoint;
        
        // Add center pin marker
        addCenterMarker();
        
        // Set up periodic marker updates to track map center changes
        startMapCenterTracking();
    }
    
    /**
     * Track map center changes and update marker position
     */
    private void startMapCenterTracking() {
        // Update marker position every 200ms when map is being interacted with
        Runnable updateMarker = new Runnable() {
            @Override
            public void run() {
                if (mapView != null) {
                    GeoPoint center = (GeoPoint) mapView.getMapCenter();
                    if (center != null && !center.equals(selectedLocation)) {
                        selectedLocation = center;
                        updateCenterMarker(center);
                    }
                    // Continue tracking
                    mapView.postDelayed(this, 200);
                }
            }
        };
        mapView.postDelayed(updateMarker, 200);
    }
    
    private void addCenterMarker() {
        // Create marker at initial location
        centerMarker = new Marker(mapView);
        centerMarker.setPosition(selectedLocation);
        centerMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER);
        centerMarker.setTitle("Selected Location");
        centerMarker.setSnippet("Lat: " + String.format("%.4f", selectedLocation.getLatitude()) 
            + "\nLon: " + String.format("%.4f", selectedLocation.getLongitude()));
        mapView.getOverlays().add(centerMarker);
    }
    
    private void updateCenterMarker(GeoPoint newLocation) {
        if (centerMarker != null) {
            centerMarker.setPosition(newLocation);
            centerMarker.setSnippet("Lat: " + String.format("%.4f", newLocation.getLatitude()) 
                + "\nLon: " + String.format("%.4f", newLocation.getLongitude()));
            mapView.invalidate();
        }
    }
    
    private void setupListeners() {
        confirmButton.setOnClickListener(v -> confirmLocation());
        cancelButton.setOnClickListener(v -> finish());
        jumpToGpsButton.setOnClickListener(v -> jumpToCurrentLocation());
    }
    
    /**
     * Jump to current GPS location
     */
    private void jumpToCurrentLocation() {
        // Get last known location and center map on it
        com.example.mhike.services.LocationManager locationManager = 
            new com.example.mhike.services.LocationManager(this);
        
        locationManager.getLastLocation(new com.example.mhike.services.LocationManager.LocationCallback() {
            @Override
            public void onLocationReceived(Double latitude, Double longitude) {
                GeoPoint currentLocation = new GeoPoint(latitude, longitude);
                IMapController mapController = mapView.getController();
                mapController.setCenter(currentLocation);
                selectedLocation = currentLocation;
                updateCenterMarker(currentLocation);
                Toast.makeText(PickLocationActivity.this, 
                    "Jumped to GPS location", Toast.LENGTH_SHORT).show();
            }
            
            @Override
            public void onLocationError(String errorMessage) {
                Toast.makeText(PickLocationActivity.this, 
                    "Error: " + errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }
    
    /**
     * Return selected location to calling activity
     */
    private void confirmLocation() {
        if (selectedLocation != null) {
            Intent resultIntent = new Intent();
            resultIntent.putExtra("latitude", selectedLocation.getLatitude());
            resultIntent.putExtra("longitude", selectedLocation.getLongitude());
            setResult(RESULT_OK, resultIntent);
            Log.d(TAG, "Location confirmed: " + selectedLocation.getLatitude() + ", " + selectedLocation.getLongitude());
            finish();
        } else {
            Toast.makeText(this, "No location selected", Toast.LENGTH_SHORT).show();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
    }
    
    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
