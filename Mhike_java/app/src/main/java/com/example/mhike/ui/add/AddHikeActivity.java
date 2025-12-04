package com.example.mhike.ui.add;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.services.LocationManager;
import com.example.mhike.ui.location.PickLocationActivity;
import com.example.mhike.ui.viewmodels.HikeViewModel;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/**
 * Activity for adding or editing a hike
 */
public class AddHikeActivity extends AppCompatActivity {
    
    private HikeViewModel viewModel;
    private Hike editingHike;
    
    // UI Components
    private TextInputEditText nameEditText;
    private TextInputEditText locationEditText;
    private TextInputEditText latitudeEditText;
    private TextInputEditText longitudeEditText;
    private TextInputEditText dateEditText;
    private TextInputEditText timeEditText;
    private TextInputEditText lengthEditText;
    private AutoCompleteTextView difficultyAutoComplete;
    private SwitchMaterial parkingSwitch;
    private AutoCompleteTextView privacyAutoComplete;
    private TextInputEditText descriptionEditText;
    private MaterialButton saveButton;
    private MaterialButton cancelButton;
    
    // Layout inputs
    private TextInputLayout nameInputLayout;
    private TextInputLayout locationInputLayout;
    private TextInputLayout dateInputLayout;
    private TextInputLayout timeInputLayout;
    private TextInputLayout lengthInputLayout;
    private TextInputLayout difficultyInputLayout;
    private TextInputLayout privacyInputLayout;
    private TextInputLayout descriptionInputLayout;
    
    private MaterialButton getGpsButton;
    private MaterialButton pickMapButton;
    
    private Double selectedLatitude;
    private Double selectedLongitude;
    private LocationManager locationManager;
    
    // Activity result launcher for map picker
    private ActivityResultLauncher<Intent> mapPickerLauncher;
    
    private final Calendar calendar = Calendar.getInstance();
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_hike);
        
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
        locationManager = new LocationManager(this);
        
        // Initialize map picker launcher
        initializeMapPickerLauncher();
        
        initializeUI();
        setupDropdowns();
        setupDateTimeListeners();
        setupButtonListeners();
        setupLocationListeners();
        observeMessages();
        
        // Check if editing existing hike
        long hikeId = getIntent().getLongExtra("hike_id", -1);
        if (hikeId != -1) {
            loadHikeForEditing(hikeId);
        }
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
                    updateLocationDisplay();
                }
            }
        );
    }
    
    private void initializeUI() {
        // TextInput EditTexts
        nameEditText = findViewById(R.id.nameEditText);
        locationEditText = findViewById(R.id.locationEditText);
        latitudeEditText = findViewById(R.id.latitudeEditText);
        longitudeEditText = findViewById(R.id.longitudeEditText);
        dateEditText = findViewById(R.id.dateEditText);
        timeEditText = findViewById(R.id.timeEditText);
        lengthEditText = findViewById(R.id.lengthEditText);
        descriptionEditText = findViewById(R.id.descriptionEditText);
        
        // AutoComplete
        difficultyAutoComplete = findViewById(R.id.difficultyAutoComplete);
        privacyAutoComplete = findViewById(R.id.privacyAutoComplete);
        
        // Switch
        parkingSwitch = findViewById(R.id.parkingSwitch);
        
        // Buttons
        saveButton = findViewById(R.id.saveButton);
        cancelButton = findViewById(R.id.cancelButton);
        getGpsButton = findViewById(R.id.getGpsButton);
        pickMapButton = findViewById(R.id.pickMapButton);
        
        // Layout inputs
        nameInputLayout = findViewById(R.id.nameInputLayout);
        locationInputLayout = findViewById(R.id.locationInputLayout);
        dateInputLayout = findViewById(R.id.dateInputLayout);
        timeInputLayout = findViewById(R.id.timeInputLayout);
        lengthInputLayout = findViewById(R.id.lengthInputLayout);
        difficultyInputLayout = findViewById(R.id.difficultyInputLayout);
        privacyInputLayout = findViewById(R.id.privacyInputLayout);
        descriptionInputLayout = findViewById(R.id.descriptionInputLayout);
        
        // Set up toolbar with back button
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.addHikeTopAppBar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupDropdowns() {
        // Difficulty options
        String[] difficultyOptions = {
            getString(R.string.difficulty_easy),
            getString(R.string.difficulty_medium),
            getString(R.string.difficulty_hard)
        };
        ArrayAdapter<String> difficultyAdapter = new ArrayAdapter<>(
            this, 
            android.R.layout.simple_dropdown_item_1line, 
            difficultyOptions
        );
        difficultyAutoComplete.setAdapter(difficultyAdapter);
        difficultyAutoComplete.setText(difficultyOptions[0], false);
        
        // Privacy options
        String[] privacyOptions = {
            getString(R.string.privacy_private),
            getString(R.string.privacy_public)
        };
        ArrayAdapter<String> privacyAdapter = new ArrayAdapter<>(
            this,
            android.R.layout.simple_dropdown_item_1line,
            privacyOptions
        );
        privacyAutoComplete.setAdapter(privacyAdapter);
        privacyAutoComplete.setText(privacyOptions[0], false);
    }
    
    private void setupDateTimeListeners() {
        // Date picker
        dateEditText.setOnClickListener(v -> showDatePicker());
        
        // Time picker
        timeEditText.setOnClickListener(v -> showTimePicker());
        
        // Set current date/time as default
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        dateEditText.setText(dateFormat.format(calendar.getTime()));
        
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
        timeEditText.setText(timeFormat.format(calendar.getTime()));
    }
    
    private void showDatePicker() {
        DatePickerDialog datePickerDialog = new DatePickerDialog(
            this,
            (view, year, month, dayOfMonth) -> {
                calendar.set(year, month, dayOfMonth);
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                dateEditText.setText(dateFormat.format(calendar.getTime()));
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        );
        datePickerDialog.show();
    }
    
    private void showTimePicker() {
        TimePickerDialog timePickerDialog = new TimePickerDialog(
            this,
            (view, hourOfDay, minute) -> {
                calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                calendar.set(Calendar.MINUTE, minute);
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
                timeEditText.setText(timeFormat.format(calendar.getTime()));
            },
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE),
            true
        );
        timePickerDialog.show();
    }
    
    private void setupButtonListeners() {
        saveButton.setOnClickListener(v -> saveHike());
        cancelButton.setOnClickListener(v -> finish());
    }
    
    private void setupLocationListeners() {
        getGpsButton.setOnClickListener(v -> captureGpsLocation());
        pickMapButton.setOnClickListener(v -> openMapPicker());
    }
    
    /**
     * Capture location from device GPS
     */
    private void captureGpsLocation() {
        locationManager.getLastLocation(new LocationManager.LocationCallback() {
            @Override
            public void onLocationReceived(Double latitude, Double longitude) {
                selectedLatitude = latitude;
                selectedLongitude = longitude;
                updateLocationDisplay();
                Toast.makeText(AddHikeActivity.this, "Location captured from GPS", Toast.LENGTH_SHORT).show();
            }
            
            @Override
            public void onLocationError(String errorMessage) {
                if (errorMessage.contains("not granted")) {
                    showLocationPermissionDialog();
                } else {
                    Toast.makeText(AddHikeActivity.this, "GPS Error: " + errorMessage, Toast.LENGTH_LONG).show();
                }
            }
        });
    }
    
    /**
     * Open map picker for manual location selection
     */
    private void openMapPicker() {
        Intent mapIntent = new Intent(AddHikeActivity.this, PickLocationActivity.class);
        if (selectedLatitude != null && selectedLongitude != null) {
            mapIntent.putExtra("latitude", selectedLatitude);
            mapIntent.putExtra("longitude", selectedLongitude);
        }
        mapPickerLauncher.launch(mapIntent);
    }
    
    /**
     * Update location display in UI (latitude and longitude fields)
     */
    private void updateLocationDisplay() {
        if (selectedLatitude != null && selectedLongitude != null) {
            latitudeEditText.setText(String.format("%.6f", selectedLatitude));
            longitudeEditText.setText(String.format("%.6f", selectedLongitude));
        }
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
    
    private void saveHike() {
        // Clear previous errors
        clearErrors();
        
        // Validate inputs
        if (!validateInputs()) {
            return;
        }
        
        // Create or update hike
        String name = nameEditText.getText().toString().trim();
        String location = locationEditText.getText().toString().trim();
        String date = dateEditText.getText().toString().trim();
        String time = timeEditText.getText().toString().trim();
        float length = Float.parseFloat(lengthEditText.getText().toString().trim());
        String difficulty = difficultyAutoComplete.getText().toString();
        boolean parking = parkingSwitch.isChecked();
        String privacy = privacyAutoComplete.getText().toString();
        String description = descriptionEditText.getText().toString().trim();
        
        if (editingHike != null) {
            // Update existing hike
            editingHike.name = name;
            editingHike.location = location;
            editingHike.date = date;
            editingHike.time = time;
            editingHike.length = length;
            editingHike.difficulty = difficulty;
            editingHike.parkingAvailable = parking;
            editingHike.privacy = privacy;
            editingHike.description = description;
            // Update location if captured
            if (selectedLatitude != null && selectedLongitude != null) {
                editingHike.latitude = selectedLatitude.floatValue();
                editingHike.longitude = selectedLongitude.floatValue();
            }
            viewModel.updateHike(editingHike);
        } else {
            // Create new hike
            Hike newHike = new Hike(name, location, date, time, length, difficulty, parking);
            newHike.description = description;
            newHike.privacy = privacy;
            // Add location if captured
            if (selectedLatitude != null && selectedLongitude != null) {
                newHike.latitude = selectedLatitude.floatValue();
                newHike.longitude = selectedLongitude.floatValue();
            }
            viewModel.insertHike(newHike);
        }
    }
    
    private boolean validateInputs() {
        boolean isValid = true;
        
        // Name validation
        if (TextUtils.isEmpty(nameEditText.getText())) {
            nameInputLayout.setError("Name is required");
            isValid = false;
        }
        
        // Location validation
        if (TextUtils.isEmpty(locationEditText.getText())) {
            locationInputLayout.setError("Location is required");
            isValid = false;
        }
        
        // Date validation
        if (TextUtils.isEmpty(dateEditText.getText())) {
            dateInputLayout.setError("Date is required");
            isValid = false;
        }
        
        // Length validation
        if (TextUtils.isEmpty(lengthEditText.getText())) {
            lengthInputLayout.setError("Length is required");
            isValid = false;
        } else {
            try {
                float length = Float.parseFloat(lengthEditText.getText().toString());
                if (length <= 0) {
                    lengthInputLayout.setError("Length must be greater than 0");
                    isValid = false;
                }
            } catch (NumberFormatException e) {
                lengthInputLayout.setError("Invalid length");
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    private void clearErrors() {
        nameInputLayout.setError(null);
        locationInputLayout.setError(null);
        dateInputLayout.setError(null);
        lengthInputLayout.setError(null);
    }
    
    private void loadHikeForEditing(long hikeId) {
        viewModel.getHikeById(hikeId).observe(this, hike -> {
            if (hike != null) {
                editingHike = hike;
                populateFields(hike);
            }
        });
    }
    
    private void populateFields(Hike hike) {
        nameEditText.setText(hike.name);
        locationEditText.setText(hike.location);
        dateEditText.setText(hike.date);
        timeEditText.setText(hike.time);
        lengthEditText.setText(String.valueOf(hike.length));
        difficultyAutoComplete.setText(hike.difficulty, false);
        parkingSwitch.setChecked(hike.parkingAvailable);
        privacyAutoComplete.setText(hike.privacy, false);
        descriptionEditText.setText(hike.description);
        
        // Load location if available
        if (hike.latitude != 0 && hike.longitude != 0) {
            selectedLatitude = (double) hike.latitude;
            selectedLongitude = (double) hike.longitude;
            latitudeEditText.setText(String.format("%.6f", selectedLatitude));
            longitudeEditText.setText(String.format("%.6f", selectedLongitude));
        }
    }
    
    private void observeMessages() {
        viewModel.getSuccessMessage().observe(this, message -> {
            if (message != null) {
                showSnackbar(message);
                finish();
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
