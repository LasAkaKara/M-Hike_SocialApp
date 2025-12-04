package com.example.mhike.ui.add;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
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
    
    private final Calendar calendar = Calendar.getInstance();
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_hike);
        
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
        
        initializeUI();
        setupDropdowns();
        setupDateTimeListeners();
        setupButtonListeners();
        observeMessages();
        
        // Check if editing existing hike
        long hikeId = getIntent().getLongExtra("hike_id", -1);
        if (hikeId != -1) {
            loadHikeForEditing(hikeId);
        }
    }
    
    private void initializeUI() {
        // TextInput EditTexts
        nameEditText = findViewById(R.id.nameEditText);
        locationEditText = findViewById(R.id.locationEditText);
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
            viewModel.updateHike(editingHike);
        } else {
            // Create new hike
            Hike newHike = new Hike(name, location, date, time, length, difficulty, parking);
            newHike.description = description;
            newHike.privacy = privacy;
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
