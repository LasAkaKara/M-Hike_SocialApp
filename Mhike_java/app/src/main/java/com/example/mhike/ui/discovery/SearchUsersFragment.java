package com.example.mhike.ui.discovery;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.User;
import com.example.mhike.ui.adapters.UserAdapter;
import com.example.mhike.ui.viewmodels.SearchFeedViewModel;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.progressindicator.CircularProgressIndicator;
import com.google.android.material.textview.MaterialTextView;

/**
 * SearchUsersFragment - Search and discover users to follow
 * Displays search results with follow/unfollow buttons
 * Uses TextWatcher with debounce delay for efficient searching
 */
public class SearchUsersFragment extends Fragment {
    
    private static final String TAG = "SearchUsersFragment";
    
    private SearchFeedViewModel viewModel;
    private UserAdapter userAdapter;
    private RecyclerView recyclerView;
    private TextInputEditText searchInput;
    private CircularProgressIndicator progressIndicator;
    private MaterialTextView emptyStateText;
    
    // Debounce settings
    private static final long SEARCH_DELAY_MS = 500;  // 500ms delay
    private Handler searchHandler;
    private Runnable searchRunnable;
    
    public SearchUsersFragment() {
        // Required empty public constructor
    }
    
    public static SearchUsersFragment newInstance() {
        return new SearchUsersFragment();
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initialize handler for debouncing
        searchHandler = new Handler(Looper.getMainLooper());
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_search_users, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        Log.d(TAG, "=== SearchUsersFragment onViewCreated ===");
        
        viewModel = new ViewModelProvider(this).get(SearchFeedViewModel.class);
        
        // Initialize UI components
        searchInput = view.findViewById(R.id.searchInput);
        recyclerView = view.findViewById(R.id.usersRecyclerView);
        progressIndicator = view.findViewById(R.id.progressIndicator);
        emptyStateText = view.findViewById(R.id.emptyStateText);
        
        // Setup RecyclerView
        userAdapter = new UserAdapter(getContext(), new UserAdapter.OnUserActionListener() {
            @Override
            public void onUserClick(User user) {
                Log.d(TAG, "User clicked: " + user.username);
                // TODO: Navigate to user profile
            }
            
            @Override
            public void onFollowClick(User user) {
                Log.d(TAG, "Following user: " + user.username);
                viewModel.followUser(user.id);
                showSnackbar("Following " + user.username);
            }
            
            @Override
            public void onUnfollowClick(User user) {
                Log.d(TAG, "Unfollowing user: " + user.username);
                viewModel.unfollowUser(user.id);
                showSnackbar("Unfollowed " + user.username);
            }
        });
        
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(userAdapter);
        
        // Setup TextWatcher for real-time search with debounce
        searchInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // Not needed
            }
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                Log.d(TAG, "Text changed: " + s.toString());
                // Cancel previous search if still pending
                if (searchRunnable != null) {
                    searchHandler.removeCallbacks(searchRunnable);
                }
                
                // Schedule new search with delay
                searchRunnable = () -> performSearch();
                searchHandler.postDelayed(searchRunnable, SEARCH_DELAY_MS);
            }
            
            @Override
            public void afterTextChanged(Editable s) {
                // Not needed
            }
        });
        
        // Observe LiveData
        viewModel.getSearchResults().observe(getViewLifecycleOwner(), users -> {
            Log.d(TAG, "Search results updated: " + (users != null ? users.size() : "null"));
            if (users != null) {
                for (int i = 0; i < users.size(); i++) {
                    Log.d(TAG, "  User " + i + ": " + users.get(i).username + " followers=" + users.get(i).followerCount);
                }
            }
            
            if (users != null && !users.isEmpty()) {
                userAdapter.setUsers(users);
                recyclerView.setVisibility(View.VISIBLE);
                emptyStateText.setVisibility(View.GONE);
            } else {
                recyclerView.setVisibility(View.GONE);
                emptyStateText.setVisibility(View.VISIBLE);
                emptyStateText.setText("No users found");
            }
        });
        
        viewModel.getIsSearching().observe(getViewLifecycleOwner(), isSearching -> {
            Log.d(TAG, "Searching: " + isSearching);
            progressIndicator.setVisibility(isSearching ? View.VISIBLE : View.GONE);
        });
        
        viewModel.getSearchErrorMessage().observe(getViewLifecycleOwner(), errorMessage -> {
            Log.d(TAG, "Search error: " + errorMessage);
            if (errorMessage != null) {
                showSnackbar(errorMessage);
            }
        });
        
        viewModel.getFollowMessage().observe(getViewLifecycleOwner(), message -> {
            Log.d(TAG, "Follow message: " + message);
            if (message != null) {
                showSnackbar(message);
            }
        });
    }
    
    /**
     * Perform search based on input
     */
    private void performSearch() {
        String query = searchInput.getText().toString().trim();
        Log.d(TAG, "Performing search for: '" + query + "'");
        if (!query.isEmpty() && query.length() >= 1) {
            viewModel.searchUsers(query);
        } else {
            // Clear results if search is empty
            userAdapter.setUsers(null);
            recyclerView.setVisibility(View.GONE);
            emptyStateText.setVisibility(View.VISIBLE);
            emptyStateText.setText("Start typing to search for users");
        }
    }
    
    @Override
    public void onDestroyView() {
        super.onDestroyView();
        // Clean up pending search callbacks
        if (searchHandler != null && searchRunnable != null) {
            searchHandler.removeCallbacks(searchRunnable);
        }
    }
    
    /**
     * Show snackbar message
     */
    private void showSnackbar(String message) {
        if (getView() != null) {
            Snackbar.make(getView(), message, Snackbar.LENGTH_SHORT).show();
        }
    }
}