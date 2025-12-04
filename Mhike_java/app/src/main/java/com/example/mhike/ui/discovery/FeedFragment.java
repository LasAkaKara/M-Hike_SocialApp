package com.example.mhike.ui.discovery;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.example.mhike.ui.adapters.FeedHikeAdapter;
import com.example.mhike.ui.details.FeedHikeDetailActivity;
import com.example.mhike.ui.viewmodels.SearchFeedViewModel;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.progressindicator.CircularProgressIndicator;
import com.google.android.material.textview.MaterialTextView;

/**
 * FeedFragment - Display public hikes from followed users
 * Shows a real-time feed of activities from people you follow
 */
public class FeedFragment extends Fragment {
    
    private static final String TAG = "FeedFragment";
    
    private SearchFeedViewModel viewModel;
    private FeedHikeAdapter feedAdapter;
    private RecyclerView recyclerView;
    private SwipeRefreshLayout swipeRefresh;
    private CircularProgressIndicator progressIndicator;
    private MaterialTextView emptyStateText;
    
    public FeedFragment() {
        // Required empty public constructor
    }
    
    public static FeedFragment newInstance() {
        return new FeedFragment();
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_feed, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        Log.d(TAG, "=== FeedFragment onViewCreated ===");
        
        viewModel = new ViewModelProvider(this).get(SearchFeedViewModel.class);
        Log.d(TAG, "Current user ID: " + viewModel.getCurrentUserId());
        
        // Initialize UI components
        recyclerView = view.findViewById(R.id.feedRecyclerView);
        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        progressIndicator = view.findViewById(R.id.progressIndicator);
        emptyStateText = view.findViewById(R.id.emptyStateText);
        
        // Setup RecyclerView
        feedAdapter = new FeedHikeAdapter(getContext(), new FeedHikeAdapter.OnHikeClickListener() {
            @Override
            public void onHikeClick(Hike hike) {
                Log.d(TAG, "Hike clicked: " + hike.name);
                // Launch FeedHikeDetailActivity
                Intent intent = new Intent(getActivity(), FeedHikeDetailActivity.class);
                intent.putExtra("hike_id", hike.id);
                intent.putExtra("hike_name", hike.name);
                intent.putExtra("hike_location", hike.location);
                intent.putExtra("hike_date", hike.date);
                intent.putExtra("hike_time", hike.time);
                intent.putExtra("hike_length", hike.length);
                intent.putExtra("hike_difficulty", hike.difficulty);
                intent.putExtra("hike_parking", hike.parkingAvailable);
                intent.putExtra("hike_privacy", hike.privacy);
                intent.putExtra("hike_description", hike.description);
                startActivity(intent);
            }
            
            @Override
            public void onAuthorClick(Hike hike) {
                Log.d(TAG, "Author clicked: " + hike.userName);
                // TODO: Navigate to user profile
                showSnackbar("View profile of " + hike.userName);
            }
        });
        
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(feedAdapter);
        
        // Setup SwipeRefresh
        swipeRefresh.setOnRefreshListener(() -> {
            Log.d(TAG, "Refresh triggered");
            viewModel.loadFeed();
        });
        
        // Observe LiveData
        viewModel.getFeedHikes().observe(getViewLifecycleOwner(), hikes -> {
            Log.d(TAG, "Feed hikes updated: " + (hikes != null ? hikes.size() : "null"));
            if (hikes != null) {
                for (int i = 0; i < hikes.size(); i++) {
                    Log.d(TAG, "  Hike " + i + ": " + hikes.get(i).name + " by " + hikes.get(i).userName);
                }
            }
            
            if (hikes != null && !hikes.isEmpty()) {
                Log.d(TAG, "Showing hikes in feed");
                feedAdapter.setHikes(hikes);
                recyclerView.setVisibility(View.VISIBLE);
                emptyStateText.setVisibility(View.GONE);
            } else {
                Log.d(TAG, "Showing empty state");
                recyclerView.setVisibility(View.GONE);
                emptyStateText.setVisibility(View.VISIBLE);
                emptyStateText.setText("No hikes in your feed. Start following users!");
            }
        });
        
        viewModel.getIsFeedLoading().observe(getViewLifecycleOwner(), isLoading -> {
            Log.d(TAG, "Feed loading: " + isLoading);
            progressIndicator.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            swipeRefresh.setRefreshing(isLoading);
        });
        
        viewModel.getFeedErrorMessage().observe(getViewLifecycleOwner(), errorMessage -> {
            Log.d(TAG, "Feed error: " + errorMessage);
            if (errorMessage != null) {
                showSnackbar(errorMessage);
            }
        });
        
        // Load feed on creation
        Log.d(TAG, "Loading feed...");
        viewModel.loadFeed();
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
