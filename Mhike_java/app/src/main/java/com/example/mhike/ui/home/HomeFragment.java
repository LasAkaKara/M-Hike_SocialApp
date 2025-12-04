package com.example.mhike.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;

import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.ui.add.AddHikeActivity;
import com.example.mhike.ui.adapters.HikeAdapter;
import com.example.mhike.ui.details.HikeDetailActivity;
import com.example.mhike.ui.sync.SyncFragment;
import com.example.mhike.ui.viewmodels.HikeViewModel;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textfield.TextInputEditText;

/**
 * HomeFragment - Displays user's hike list with CRUD operations
 * Moved from MainActivity
 */
public class HomeFragment extends Fragment implements HikeAdapter.OnHikeClickListener {
    
    private HikeViewModel viewModel;
    private HikeAdapter hikeAdapter;
    private RecyclerView hikeRecyclerView;
    private EditText searchBar;
    private FloatingActionButton addHikeFab;
    private LinearLayout emptyStateLayout;
    private Button filterButton;
    private Button syncButton;
    private View rootView;
    
    public HomeFragment() {
        // Required empty public constructor
    }
    
    public static HomeFragment newInstance() {
        return new HomeFragment();
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);
        
        // Initialize ViewModel
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home, container, false);
    }
    
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        rootView = view;
        
        // Initialize UI components
        initializeUI(view);
        
        // Set up RecyclerView
        setupRecyclerView();
        
        // Observe hikes
        observeHikes();
        
        // Set up listeners
        setupListeners();
        
        // Observe messages
        observeMessages();
    }
    
    
    private void initializeUI(View view) {
        hikeRecyclerView = view.findViewById(R.id.hikeRecyclerView);
        searchBar = view.findViewById(R.id.searchBar);
        addHikeFab = view.findViewById(R.id.addHikeFab);
        emptyStateLayout = view.findViewById(R.id.emptyStateLayout);
        filterButton = view.findViewById(R.id.filterButton);
        syncButton = view.findViewById(R.id.syncButton);
    }
    
    private void setupRecyclerView() {
        hikeAdapter = new HikeAdapter(requireContext(), this);
        hikeRecyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
        hikeRecyclerView.setAdapter(hikeAdapter);
    }
    
    private void observeHikes() {
        viewModel.getAllHikes().observe(getViewLifecycleOwner(), hikes -> {
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
            Intent intent = new Intent(requireContext(), AddHikeActivity.class);
            startActivity(intent);
        });
        
        // Filter button click
        filterButton.setOnClickListener(v -> showFilterDialog());
        
        // Sync button click
        syncButton.setOnClickListener(v -> performSync());
        
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
            viewModel.getAllHikes().observe(getViewLifecycleOwner(), hikes -> {
                hikeAdapter.setHikes(hikes);
            });
        } else {
            viewModel.searchHikes(query).observe(getViewLifecycleOwner(), hikes -> {
                hikeAdapter.setHikes(hikes);
            });
        }
    }
    
    private void observeMessages() {
        viewModel.getSuccessMessage().observe(getViewLifecycleOwner(), message -> {
            if (message != null) {
                showSnackbar(message, Snackbar.LENGTH_SHORT);
            }
        });
        
        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), message -> {
            if (message != null) {
                showSnackbar(message, Snackbar.LENGTH_LONG);
            }
        });
    }
    
    @Override
    public void onHikeClick(Hike hike) {
        Intent intent = new Intent(requireContext(), HikeDetailActivity.class);
        intent.putExtra("hike_id", hike.id);
        startActivity(intent);
    }
    
    @Override
    public void onHikeLongClick(Hike hike) {
        showHikeOptionsDialog(hike);
    }
    
    private void showHikeOptionsDialog(Hike hike) {
        String[] options = {"View", "Edit", "Delete"};
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle(hike.name)
            .setItems(options, (dialog, which) -> {
                switch (which) {
                    case 0: // View
                        onHikeClick(hike);
                        break;
                    case 1: // Edit
                        editHike(hike);
                        break;
                    case 2: // Delete
                        deleteHike(hike);
                        break;
                }
            })
            .show();
    }
    
    private void editHike(Hike hike) {
        Intent intent = new Intent(requireContext(), AddHikeActivity.class);
        intent.putExtra("hike_id", hike.id);
        startActivity(intent);
    }
    
    private void deleteHike(Hike hike) {
        new AlertDialog.Builder(requireContext())
            .setTitle("Delete Hike")
            .setMessage("Are you sure you want to delete \"" + hike.name + "\"? This cannot be undone.")
            .setPositiveButton("Delete", (dialog, which) -> {
                viewModel.deleteHike(hike);
                showSnackbar("Hike deleted", Snackbar.LENGTH_SHORT);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    private void showFilterDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_search_filter, null);
        builder.setView(dialogView);
        
        // Get filter inputs
        TextInputEditText filterNameInput = dialogView.findViewById(R.id.filterNameInput);
        TextInputEditText filterLocationInput = dialogView.findViewById(R.id.filterLocationInput);
        TextInputEditText filterLengthInput = dialogView.findViewById(R.id.filterLengthInput);
        TextInputEditText filterDateInput = dialogView.findViewById(R.id.filterDateInput);
        android.widget.Button clearButton = dialogView.findViewById(R.id.clearButton);
        android.widget.Button searchButton = dialogView.findViewById(R.id.searchButton);
        
        AlertDialog dialog = builder.create();
        
        // Clear filters
        clearButton.setOnClickListener(v -> {
            filterNameInput.setText("");
            filterLocationInput.setText("");
            filterLengthInput.setText("");
            filterDateInput.setText("");
        });
        
        // Apply filters
        searchButton.setOnClickListener(v -> {
            String name = filterNameInput.getText().toString().trim();
            String location = filterLocationInput.getText().toString().trim();
            String lengthStr = filterLengthInput.getText().toString().trim();
            String date = filterDateInput.getText().toString().trim();
            
            // Convert length to float, null if empty
            Float length = null;
            if (!lengthStr.isEmpty()) {
                try {
                    length = Float.valueOf(lengthStr);
                } catch (NumberFormatException e) {
                    showSnackbar("Invalid length value", Snackbar.LENGTH_SHORT);
                    return;
                }
            }
            
            // Perform advanced search with all filters
            viewModel.searchHikesWithFilters(
                name.isEmpty() ? null : name,
                location.isEmpty() ? null : location,
                length,
                date.isEmpty() ? null : date,
                results -> {
                    hikeAdapter.setHikes(results);
                    showSnackbar("Found " + results.size() + " hikes", Snackbar.LENGTH_SHORT);
                }
            );
            
            dialog.dismiss();
        });
        
        dialog.show();
    }
    
    private void performSync() {
        // Navigate to SyncFragment
        SyncFragment syncFragment = SyncFragment.newInstance();
        requireActivity().getSupportFragmentManager()
            .beginTransaction()
            .replace(R.id.fragmentContainerView, syncFragment)
            .addToBackStack(null)
            .commit();
    }
    
    private void showSnackbar(String message, int duration) {
        Snackbar.make(rootView, message, duration).show();
    }
}
