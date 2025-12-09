package com.example.mhike.ui.details;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.MenuItem;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.database.entities.Observation;
import com.example.mhike.services.LocationManager;
import com.example.mhike.ui.adapters.ObservationAdapter;
import com.example.mhike.ui.location.PickLocationActivity;
import com.example.mhike.ui.viewmodels.HikeViewModel;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textview.MaterialTextView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Locale;

/**
 * Activity for displaying detailed feed hike information with observations
 * Similar to HikeDetailActivity but designed for viewing hikes from the feed
 * (read-only, cannot add/edit observations unless you're the author)
 */
public class FeedHikeDetailActivity extends AppCompatActivity implements ObservationAdapter.OnObservationClickListener {
    
    private HikeViewModel viewModel;
    private long hikeId;
    private Hike currentHike;
    
    // UI Components (reused from activity_hike_detail.xml)
    private MaterialTextView detailHikeName;
    private MaterialTextView detailHikeLocation;
    private MaterialTextView detailHikeDate;
    private MaterialTextView detailHikeTime;
    private MaterialTextView detailHikeLength;
    private MaterialTextView detailHikeDifficulty;
    private MaterialTextView detailHikeParking;
    private MaterialTextView detailHikePrivacy;
    private MaterialTextView detailHikeDescription;
    private RecyclerView observationRecyclerView;
    private MaterialButton addObservationButton;
    private android.view.View emptyObservationLayout;
    
    private ObservationAdapter observationAdapter;
    
    // For time picker and image upload
    private String selectedObservationTime;
    private Uri selectedImageUri;
    private Double selectedLatitude;
    private Double selectedLongitude;
    
    // Activity result launcher for image picker
    private ActivityResultLauncher<String> imagePickerLauncher;
    
    // Activity result launcher for map picker
    private ActivityResultLauncher<Intent> mapPickerLauncher;
    
    // Location manager
    private LocationManager locationManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hike_detail);
        
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
        locationManager = new LocationManager(this);
        
        // Initialize activity result launchers
        initializeImagePickerLauncher();
        initializeMapPickerLauncher();
        
        hikeId = getIntent().getLongExtra("hike_id", -1);
        if (hikeId == -1) {
            finish();
            return;
        }
        
        initializeUI();
        setupRecyclerView();
        setupListeners();
        
        // Try to display data from Intent extras first (faster)
        if (getIntent().hasExtra("hike_name")) {
            displayHikeFromExtras();
            loadObservations();
        } else {
            // Fallback: load from database if extras not available
            viewModel.getHikeById(hikeId).observe(this, hike -> {
                if (hike != null) {
                    currentHike = hike;
                    displayHikeDetails(hike);
                }
            });
            loadObservations();
        }
        
        observeMessages();
    }
    
    /**
     * Initialize the image picker launcher
     */
    private void initializeImagePickerLauncher() {
        imagePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    updateImagePreview();
                }
            }
        );
    }
    
    /**
     * Initialize the map picker launcher
     */
    private void initializeMapPickerLauncher() {
        mapPickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    selectedLatitude = result.getData().getDoubleExtra("latitude", 0);
                    selectedLongitude = result.getData().getDoubleExtra("longitude", 0);
                }
            }
        );
    }
    
    /**
     * Save image from URI to app's cache directory
     */
    private String saveImageToCache(Uri imageUri) {
        try {
            // Read bitmap from URI
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), imageUri);
            
            // Create cache directory if needed
            File cacheDir = getCacheDir();
            File imageFile = new File(cacheDir, "observation_" + System.currentTimeMillis() + ".jpg");
            
            // Write bitmap to file
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                bitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos);
                fos.flush();
            }
            
            return imageFile.getAbsolutePath();
        } catch (IOException e) {
            showSnackbar("Failed to save image: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Update image preview in dialog (called when image is selected)
     */
    private void updateImagePreview() {
        // This will be called from within the dialog context
        // The dialog will be updated with the preview
    }
    
    private void initializeUI() {
        detailHikeName = findViewById(R.id.detailHikeName);
        detailHikeLocation = findViewById(R.id.detailHikeLocation);
        detailHikeDate = findViewById(R.id.detailHikeDate);
        detailHikeTime = findViewById(R.id.detailHikeTime);
        detailHikeLength = findViewById(R.id.detailHikeLength);
        detailHikeDifficulty = findViewById(R.id.detailHikeDifficulty);
        detailHikeParking = findViewById(R.id.detailHikeParking);
        detailHikePrivacy = findViewById(R.id.detailHikePrivacy);
        detailHikeDescription = findViewById(R.id.detailHikeDescription);
        observationRecyclerView = findViewById(R.id.observationRecyclerView);
        addObservationButton = findViewById(R.id.addObservationButton);
        emptyObservationLayout = findViewById(R.id.emptyObservationLayout);
        
        // Set up toolbar with back button
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.detailTopAppBar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupRecyclerView() {
        observationAdapter = new ObservationAdapter(this, this);
        observationRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        observationRecyclerView.setAdapter(observationAdapter);
    }
    
    private void setupListeners() {
        // Hide add observation button for feed hikes (read-only view)
        addObservationButton.setVisibility(android.view.View.GONE);
    }
    
    /**
     * Display hike data from Intent extras
     */
    private void displayHikeFromExtras() {
        String name = getIntent().getStringExtra("hike_name");
        String location = getIntent().getStringExtra("hike_location");
        String date = getIntent().getStringExtra("hike_date");
        String time = getIntent().getStringExtra("hike_time");
        float length = getIntent().getFloatExtra("hike_length", 0);
        String difficulty = getIntent().getStringExtra("hike_difficulty");
        boolean parking = getIntent().getBooleanExtra("hike_parking", false);
        String privacy = getIntent().getStringExtra("hike_privacy");
        String description = getIntent().getStringExtra("hike_description");
        
        detailHikeName.setText(name);
        detailHikeLocation.setText(location);
        detailHikeDate.setText(date);
        detailHikeTime.setText(time);
        detailHikeLength.setText(String.format("%.1f km", length));
        detailHikeDifficulty.setText(difficulty);
        detailHikeParking.setText(parking ? getString(R.string.yes) : getString(R.string.no));
        detailHikePrivacy.setText(privacy);
        detailHikeDescription.setText(description != null && !description.isEmpty() ? 
            description : "No description provided");
        
        // Set difficulty color
        int difficultyColor;
        if (difficulty != null) {
            switch (difficulty.toLowerCase()) {
                case "easy":
                    difficultyColor = getColor(R.color.difficulty_easy);
                    break;
                case "medium":
                    difficultyColor = getColor(R.color.difficulty_medium);
                    break;
                case "hard":
                    difficultyColor = getColor(R.color.difficulty_hard);
                    break;
                default:
                    difficultyColor = getColor(R.color.gray_600);
            }
        } else {
            difficultyColor = getColor(R.color.gray_600);
        }
        detailHikeDifficulty.setTextColor(difficultyColor);
    }
    
    /**
     * Load only observations for the hike (without loading hike data from database)
     */
    private void loadObservations() {
        viewModel.getObservationsForHike(hikeId).observe(this, observations -> {
            if (observations != null && !observations.isEmpty()) {
                observationAdapter.setObservations(observations);
                observationRecyclerView.setVisibility(android.view.View.VISIBLE);
                emptyObservationLayout.setVisibility(android.view.View.GONE);
            } else {
                observationRecyclerView.setVisibility(android.view.View.GONE);
                emptyObservationLayout.setVisibility(android.view.View.VISIBLE);
            }
        });
    }
    
    private void displayHikeDetails(Hike hike) {
        detailHikeName.setText(hike.name);
        detailHikeLocation.setText(hike.location);
        detailHikeDate.setText(hike.date);
        detailHikeTime.setText(hike.time);
        detailHikeLength.setText(String.format("%.1f km", hike.length));
        detailHikeDifficulty.setText(hike.difficulty);
        detailHikeParking.setText(hike.parkingAvailable ? 
            getString(R.string.yes) : getString(R.string.no));
        detailHikePrivacy.setText(hike.privacy);
        detailHikeDescription.setText(hike.description != null && !hike.description.isEmpty() ? 
            hike.description : "No description provided");
        
        // Set difficulty color
        int difficultyColor;
        switch (hike.difficulty.toLowerCase()) {
            case "easy":
                difficultyColor = getColor(R.color.difficulty_easy);
                break;
            case "medium":
                difficultyColor = getColor(R.color.difficulty_medium);
                break;
            case "hard":
                difficultyColor = getColor(R.color.difficulty_hard);
                break;
            default:
                difficultyColor = getColor(R.color.gray_600);
        }
        detailHikeDifficulty.setTextColor(difficultyColor);
    }
    
    @Override
    public void onDeleteClick(Observation observation) {
        // Feed hikes are read-only - cannot delete observations from feed view
        showSnackbar("Cannot delete observations from feed view");
    }
    
    @Override
    public void onEditClick(Observation observation) {
        // Feed hikes are read-only - cannot edit observations from feed view
        showSnackbar("Cannot edit observations from feed view");
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void observeMessages() {
        viewModel.getSuccessMessage().observe(this, message -> {
            if (message != null) {
                showSnackbar(message);
            }
        });
        
        viewModel.getErrorMessage().observe(this, message -> {
            if (message != null) {
                showSnackbar(message);
            }
        });
    }
    
    private void showSnackbar(String message) {
        Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show();
    }
}
