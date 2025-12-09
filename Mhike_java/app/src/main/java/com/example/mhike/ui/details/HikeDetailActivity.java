package com.example.mhike.ui.details;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.Menu;
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
import com.example.mhike.services.AuthService;
import com.example.mhike.services.SyncService;
import com.example.mhike.ui.add.AddHikeActivity;
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

import okhttp3.OkHttpClient;

/**
 * Activity for displaying detailed hike information with observations
 */
public class HikeDetailActivity extends AppCompatActivity implements ObservationAdapter.OnObservationClickListener {
    
    private HikeViewModel viewModel;
    private long hikeId;
    private Hike currentHike;
    
    // UI Components
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
    
    // Auth service
    private AuthService authService;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hike_detail);
        
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
        locationManager = new LocationManager(this);
        authService = new AuthService(this, new OkHttpClient());
        
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
        loadHikeDetails();
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
     * Save image from URI to app's files directory (persistent storage)
     */
    private String saveImageToCache(Uri imageUri) {
        try {
            // Read bitmap from URI
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), imageUri);
            
            // Create images directory in app's internal storage (persistent, not cleared by system)
            File imagesDir = new File(getFilesDir(), "observations");
            if (!imagesDir.exists()) {
                imagesDir.mkdirs();
            }
            
            File imageFile = new File(imagesDir, "observation_" + System.currentTimeMillis() + ".jpg");
            
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
        addObservationButton.setOnClickListener(v -> addObservation());
    }
    
    private void loadHikeDetails() {
        viewModel.getHikeById(hikeId).observe(this, hike -> {
            if (hike != null) {
                currentHike = hike;
                displayHikeDetails(hike);
            }
        });
        
        // Load observations
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
    
    private void addObservation() {
        // Create observation with current time
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
        String currentTime = timeFormat.format(System.currentTimeMillis());
        
        Observation observation = new Observation(hikeId, "", currentTime);
        showAddObservationDialog(observation, true);
    }
    
    private void showAddObservationDialog(Observation observation, boolean isNew) {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        
        // Reset selected image URI and location for new observations
        if (isNew) {
            selectedImageUri = null;
            selectedLatitude = null;
            selectedLongitude = null;
        } else {
            if (observation.imageUri != null) {
                selectedImageUri = Uri.parse(observation.imageUri);
            }
            if (observation.latitude != null) {
                selectedLatitude = observation.latitude.doubleValue();
            }
            if (observation.longitude != null) {
                selectedLongitude = observation.longitude.doubleValue();
            }
        }
        
        // Create dialog content layout
        android.widget.LinearLayout dialogLayout = new android.widget.LinearLayout(this);
        dialogLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
        dialogLayout.setPadding(32, 24, 32, 24);
        
        // Title input
        android.widget.EditText titleInput = new android.widget.EditText(this);
        titleInput.setHint("Observation Title");
        titleInput.setPadding(16, 12, 16, 12);
        if (!isNew) {
            titleInput.setText(observation.title);
        }
        dialogLayout.addView(titleInput);
        
        // Time input
        android.widget.EditText timeInput = new android.widget.EditText(this);
        timeInput.setHint("Time (HH:mm)");
        timeInput.setPadding(16, 12, 16, 12);
        timeInput.setText(observation.time);
        timeInput.setInputType(android.text.InputType.TYPE_CLASS_TEXT);
        dialogLayout.addView(timeInput);
        
        // Comment input
        android.widget.EditText commentInput = new android.widget.EditText(this);
        commentInput.setHint("Comment (optional)");
        commentInput.setPadding(16, 12, 16, 12);
        if (!isNew && observation.comments != null) {
            commentInput.setText(observation.comments);
        }
        dialogLayout.addView(commentInput);
        
        // Location display
        MaterialTextView locationDisplay = new MaterialTextView(this);
        locationDisplay.setPadding(16, 12, 16, 12);
        locationDisplay.setTextSize(14);
        if (selectedLatitude != null && selectedLongitude != null) {
            locationDisplay.setText(String.format("📍 Location: %.4f, %.4f", selectedLatitude, selectedLongitude));
        } else {
            locationDisplay.setText("📍 No location selected");
        }
        dialogLayout.addView(locationDisplay);
        
        // Location buttons layout
        android.widget.LinearLayout locationButtonsLayout = new android.widget.LinearLayout(this);
        locationButtonsLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
        locationButtonsLayout.setPadding(0, 12, 0, 12);
        locationButtonsLayout.setWeightSum(1);
        
        // Get GPS location button
        android.widget.Button getGpsButton = new android.widget.Button(this);
        getGpsButton.setText("Get GPS Location");
        getGpsButton.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
            0,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            0.5f
        ));
        getGpsButton.setOnClickListener(v -> {
            locationManager.getLastLocation(new LocationManager.LocationCallback() {
                @Override
                public void onLocationReceived(Double latitude, Double longitude) {
                    selectedLatitude = latitude;
                    selectedLongitude = longitude;
                    locationDisplay.setText(String.format("📍 Location: %.4f, %.4f", latitude, longitude));
                    Toast.makeText(HikeDetailActivity.this, "Location captured from GPS", Toast.LENGTH_SHORT).show();
                }
                
                @Override
                public void onLocationError(String errorMessage) {
                    if (errorMessage.contains("not granted")) {
                        showLocationPermissionDialog();
                    } else {
                        Toast.makeText(HikeDetailActivity.this, "GPS Error: " + errorMessage, Toast.LENGTH_LONG).show();
                    }
                }
            });
        });
        locationButtonsLayout.addView(getGpsButton);
        
        // Pick on map button
        android.widget.Button pickMapButton = new android.widget.Button(this);
        pickMapButton.setText("Pick on Map");
        pickMapButton.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
            0,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            0.5f
        ));
        pickMapButton.setOnClickListener(v -> {
            Intent mapIntent = new Intent(HikeDetailActivity.this, PickLocationActivity.class);
            if (selectedLatitude != null && selectedLongitude != null) {
                mapIntent.putExtra("latitude", selectedLatitude);
                mapIntent.putExtra("longitude", selectedLongitude);
            }
            mapPickerLauncher.launch(mapIntent);
        });
        locationButtonsLayout.addView(pickMapButton);
        
        dialogLayout.addView(locationButtonsLayout);
        
        // Image preview (if image exists)
        ImageView imagePreview = new ImageView(this);
        imagePreview.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            400
        ));
        imagePreview.setScaleType(ImageView.ScaleType.CENTER_CROP);
        imagePreview.setBackgroundColor(getColor(R.color.gray_200));
        imagePreview.setVisibility(android.view.View.GONE);
        
        // Load existing image if editing
        if (!isNew && observation.imageUri != null) {
            try {
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), selectedImageUri);
                imagePreview.setImageBitmap(bitmap);
                imagePreview.setVisibility(android.view.View.VISIBLE);
            } catch (IOException e) {
                // Image no longer exists or error loading
            }
        }
        
        dialogLayout.addView(imagePreview);
        
        // Image action buttons layout
        android.widget.LinearLayout imageButtonsLayout = new android.widget.LinearLayout(this);
        imageButtonsLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
        imageButtonsLayout.setPadding(0, 12, 0, 12);
        imageButtonsLayout.setWeightSum(1);
        
        // Pick image button
        android.widget.Button pickImageButton = new android.widget.Button(this);
        pickImageButton.setText("Pick Image");
        pickImageButton.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
            0,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            1
        ));
        pickImageButton.setOnClickListener(v -> {
            imagePickerLauncher.launch("image/*");
        });
        imageButtonsLayout.addView(pickImageButton);
        
        dialogLayout.addView(imageButtonsLayout);
        
        // Clear image button (only show if image is selected)
        android.widget.Button clearImageButton = new android.widget.Button(this);
        clearImageButton.setText("Clear Image");
        clearImageButton.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        ));
        clearImageButton.setVisibility(selectedImageUri != null ? android.view.View.VISIBLE : android.view.View.GONE);
        clearImageButton.setOnClickListener(v -> {
            selectedImageUri = null;
            imagePreview.setImageBitmap(null);
            imagePreview.setVisibility(android.view.View.GONE);
            clearImageButton.setVisibility(android.view.View.GONE);
        });
        dialogLayout.addView(clearImageButton);
        
        String dialogTitle = isNew ? "Add Observation" : "Edit Observation";
        
        builder.setTitle(dialogTitle)
            .setView(dialogLayout)
            .setPositiveButton("Save", (dialog, which) -> {
                String title = titleInput.getText().toString().trim();
                String comment = commentInput.getText().toString().trim();
                String time = timeInput.getText().toString().trim();
                
                if (!title.isEmpty()) {
                    observation.title = title;
                    observation.comments = comment;
                    if (!time.isEmpty()) {
                        observation.time = time;
                    }
                    
                    // Save location if selected
                    if (selectedLatitude != null && selectedLongitude != null) {
                        observation.latitude = selectedLatitude.floatValue();
                        observation.longitude = selectedLongitude.floatValue();
                    }
                    
                    // Save image if selected
                    if (selectedImageUri != null) {
                        String savedImagePath = saveImageToCache(selectedImageUri);
                        if (savedImagePath != null) {
                            observation.imageUri = savedImagePath;
                        }
                    }
                    
                    if (isNew) {
                        viewModel.insertObservation(observation);
                    } else {
                        viewModel.updateObservation(observation);
                    }
                } else {
                    showSnackbar("Title is required");
                }
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    @Override
    public void onDeleteClick(Observation observation) {
        new AlertDialog.Builder(this)
            .setTitle("Delete Observation")
            .setMessage("Are you sure you want to delete this observation?")
            .setPositiveButton("Delete", (dialog, which) -> {
                viewModel.deleteObservation(observation);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    @Override
    public void onEditClick(Observation observation) {
        showAddObservationDialog(observation, false);
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_detail, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.actionSyncObservations) {
            syncObservations();
            return true;
        } else if (item.getItemId() == R.id.actionEdit) {
            editHike();
            return true;
        } else if (item.getItemId() == R.id.actionDelete) {
            deleteHike();
            return true;
        } else if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void editHike() {
        Intent intent = new Intent(HikeDetailActivity.this, AddHikeActivity.class);
        intent.putExtra("hike_id", hikeId);
        startActivity(intent);
    }
    
    private void syncObservations() {
        // Trigger syncing of unsynced observations
        Toast.makeText(this, "Syncing observations...", Toast.LENGTH_SHORT).show();
        
        SyncService syncService = new SyncService(
            this, 
            new okhttp3.OkHttpClient(), 
            authService.getToken()
        );
        
        syncService.syncAllOfflineHikes(new SyncService.SyncCallback() {
            @Override
            public void onSyncStart(int totalHikes) {
            }
            
            @Override
            public void onSyncProgress(int completed, int total) {
            }
            
            @Override
            public void onSyncSuccess(SyncService.SyncResult result) {
                Toast.makeText(
                    HikeDetailActivity.this, 
                    "Observations synced successfully", 
                    Toast.LENGTH_SHORT
                ).show();
            }
            
            @Override
            public void onSyncError(String errorMessage) {
                Toast.makeText(
                    HikeDetailActivity.this, 
                    "Sync failed: " + errorMessage, 
                    Toast.LENGTH_SHORT
                ).show();
            }
        });
    }
    
    private void deleteHike() {
        if (currentHike != null) {
            new AlertDialog.Builder(this)
                .setTitle("Delete Hike")
                .setMessage(getString(R.string.confirm_delete_hike))
                .setPositiveButton("Delete", (dialog, which) -> {
                    viewModel.deleteHike(currentHike);
                    finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
        }
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
    
    /**
     * Show dialog to request location permission activation
     */
    private void showLocationPermissionDialog() {
        new android.app.AlertDialog.Builder(this)
            .setTitle("Location Permission Required")
            .setMessage("To capture GPS location, please enable location permissions in app settings.\n\n" +
                "Go to Settings → Apps → M-Hike → Permissions → Location → Allow")
            .setPositiveButton("Open Settings", (dialog, which) -> {
                Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(android.net.Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    private void showSnackbar(String message) {
        Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show();
    }
}
