package com.example.mhike.ui;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.ui.add.AddHikeActivity;
import com.example.mhike.ui.adapters.HikeAdapter;
import com.example.mhike.ui.details.HikeDetailActivity;
import com.example.mhike.ui.viewmodels.HikeViewModel;
import com.google.android.material.appbar.AppBarLayout;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

/**
 * MainActivity - Home screen displaying list of hikes
 */
public class MainActivity extends AppCompatActivity implements HikeAdapter.OnHikeClickListener {
    
    private HikeViewModel viewModel;
    private HikeAdapter hikeAdapter;
    private RecyclerView hikeRecyclerView;
    private EditText searchBar;
    private FloatingActionButton addHikeFab;
    private LinearLayout emptyStateLayout;
    private View rootView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Initialize ViewModel
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
        
        // Initialize UI components
        initializeUI();
        
        // Set up RecyclerView
        setupRecyclerView();
        
        // Observe hikes
        observeHikes();
        
        // Set up listeners
        setupListeners();
        
        // Observe messages
        observeMessages();
    }
    
    @Override
    public boolean onCreateOptionsMenu(android.view.Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }
    
    private void initializeUI() {
        hikeRecyclerView = findViewById(R.id.hikeRecyclerView);
        searchBar = findViewById(R.id.searchBar);
        addHikeFab = findViewById(R.id.addHikeFab);
        emptyStateLayout = findViewById(R.id.emptyStateLayout);
        rootView = findViewById(android.R.id.content);
        
        // Set up toolbar with menu
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.topAppBar);
        setSupportActionBar(toolbar);
    }
    
    private void setupRecyclerView() {
        hikeAdapter = new HikeAdapter(this, this);
        hikeRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        hikeRecyclerView.setAdapter(hikeAdapter);
    }
    
    private void observeHikes() {
        viewModel.getAllHikes().observe(this, hikes -> {
            hikeAdapter.setHikes(hikes);
            
            // Update empty state visibility
            if (hikes == null || hikes.isEmpty()) {
                emptyStateLayout.setVisibility(View.VISIBLE);
                hikeRecyclerView.setVisibility(View.GONE);
            } else {
                emptyStateLayout.setVisibility(View.GONE);
                hikeRecyclerView.setVisibility(View.VISIBLE);
            }
        });
    }
    
    private void setupListeners() {
        // FAB click
        addHikeFab.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, AddHikeActivity.class);
            startActivity(intent);
        });
        
        // Search bar
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                viewModel.getSearchQuery().setValue(s.toString());
                performSearch(s.toString());
            }
            
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }
    
    private void performSearch(String query) {
        if (query.isEmpty()) {
            viewModel.getAllHikes().observe(this, hikes -> {
                hikeAdapter.setHikes(hikes);
            });
        } else {
            viewModel.searchHikes(query).observe(this, hikes -> {
                hikeAdapter.setHikes(hikes);
            });
        }
    }
    
    private void observeMessages() {
        viewModel.getSuccessMessage().observe(this, message -> {
            if (message != null) {
                showSnackbar(message, Snackbar.LENGTH_SHORT);
            }
        });
        
        viewModel.getErrorMessage().observe(this, message -> {
            if (message != null) {
                showSnackbar(message, Snackbar.LENGTH_LONG);
            }
        });
    }
    
    @Override
    public void onHikeClick(Hike hike) {
        Intent intent = new Intent(MainActivity.this, HikeDetailActivity.class);
        intent.putExtra("hike_id", hike.id);
        startActivity(intent);
    }
    
    @Override
    public void onHikeLongClick(Hike hike) {
        showHikeOptionsDialog(hike);
    }
    
    private void showHikeOptionsDialog(Hike hike) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(hike.name);
        builder.setItems(
            new String[]{"View", "Edit", "Delete"},
            (dialog, which) -> {
                switch (which) {
                    case 0:  // View
                        onHikeClick(hike);
                        break;
                    case 1:  // Edit
                        editHike(hike);
                        break;
                    case 2:  // Delete
                        deleteHike(hike);
                        break;
                }
            }
        );
        builder.show();
    }
    
    private void editHike(Hike hike) {
        Intent intent = new Intent(MainActivity.this, AddHikeActivity.class);
        intent.putExtra("hike_id", hike.id);
        startActivity(intent);
    }
    
    private void deleteHike(Hike hike) {
        new AlertDialog.Builder(this)
            .setTitle("Delete Hike")
            .setMessage(getString(R.string.confirm_delete_hike))
            .setPositiveButton("Delete", (dialog, which) -> {
                viewModel.deleteHike(hike);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.actionFilter) {
            showSearchFilterDialog();
            return true;
        } else if (item.getItemId() == R.id.actionSettings) {
            showSettingsDialog();
            return true;
        } else if (item.getItemId() == R.id.actionDeleteAll) {
            confirmDeleteAllHikes();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void showSettingsDialog() {
        new AlertDialog.Builder(this)
            .setTitle(R.string.settings)
            .setMessage("Manage database")
            .show();
    }
    
    private void showSearchFilterDialog() {
        // Create custom view from dialog_search_filter.xml
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_search_filter, null);
        
        // Get input fields
        TextInputEditText filterName = dialogView.findViewById(R.id.filterNameInput);
        TextInputEditText filterLocation = dialogView.findViewById(R.id.filterLocationInput);
        TextInputEditText filterLength = dialogView.findViewById(R.id.filterLengthInput);
        TextInputEditText filterDate = dialogView.findViewById(R.id.filterDateInput);
        
        // Create dialog
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(R.string.filter_hikes);
        builder.setView(dialogView);
        builder.setNegativeButton("Cancel", null);
        
        AlertDialog dialog = builder.create();
        
        // Handle Clear button
        View clearButton = dialogView.findViewById(R.id.clearButton);
        if (clearButton != null) {
            clearButton.setOnClickListener(v -> {
                filterName.setText("");
                filterLocation.setText("");
                filterLength.setText("");
                filterDate.setText("");
            });
        }
        
        // Handle Search button
        View searchButton = dialogView.findViewById(R.id.searchButton);
        if (searchButton != null) {
            searchButton.setOnClickListener(v -> {
                String name = filterName.getText().toString().trim();
                String location = filterLocation.getText().toString().trim();
                String lengthStr = filterLength.getText().toString().trim();
                String date = filterDate.getText().toString().trim();
                
                // Convert length to float
                Float length = null;
                if (!lengthStr.isEmpty()) {
                    try {
                        length = Float.parseFloat(lengthStr);
                    } catch (NumberFormatException e) {
                        showSnackbar("Invalid length value", Snackbar.LENGTH_SHORT);
                        return;
                    }
                }
                
                // Perform the combined search
                viewModel.searchHikesWithFilters(
                    name.isEmpty() ? null : name,
                    location.isEmpty() ? null : location,
                    length,
                    date.isEmpty() ? null : date,
                    results -> {
                        // Callback is now on main thread, safe to update UI
                        hikeAdapter.setHikes(results);
                        if (results.isEmpty()) {
                            emptyStateLayout.setVisibility(View.VISIBLE);
                            hikeRecyclerView.setVisibility(View.GONE);
                            showSnackbar("No hikes found matching the criteria", Snackbar.LENGTH_SHORT);
                        } else {
                            emptyStateLayout.setVisibility(View.GONE);
                            hikeRecyclerView.setVisibility(View.VISIBLE);
                            showSnackbar("Found " + results.size() + " hike(s)", Snackbar.LENGTH_SHORT);
                        }
                    }
                );
                dialog.dismiss();
            });
        }
        
        // Show date picker when date field is clicked
        if (filterDate != null) {
            filterDate.setOnClickListener(v -> showDatePickerDialog(filterDate));
        }
        
        dialog.show();
    }
    
    private void showDatePickerDialog(TextInputEditText dateField) {
        // Simple date picker using AlertDialog with date input
        // For production, use Android's DatePickerDialog
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Select Date");
        
        EditText dateInput = new EditText(this);
        dateInput.setHint("YYYY-MM-DD");
        builder.setView(dateInput);
        
        builder.setPositiveButton("OK", (dialog, which) -> {
            String date = dateInput.getText().toString().trim();
            if (!date.isEmpty()) {
                dateField.setText(date);
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
    
    private void confirmDeleteAllHikes() {
        new AlertDialog.Builder(this)
            .setTitle("Delete All Hikes")
            .setMessage("Are you sure you want to delete all hikes? This action cannot be undone.")
            .setPositiveButton("Delete All", (dialog, which) -> {
                viewModel.deleteAllData();
                showSnackbar("All hikes deleted", Snackbar.LENGTH_SHORT);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    private void showSnackbar(String message, int duration) {
        Snackbar.make(rootView, message, duration).show();
    }
}
