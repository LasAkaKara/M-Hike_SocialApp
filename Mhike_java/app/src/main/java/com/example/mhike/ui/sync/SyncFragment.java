package com.example.mhike.ui.sync;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.mhike.R;
import com.example.mhike.services.AuthService;
import com.example.mhike.services.SyncService;
import com.example.mhike.ui.viewmodels.HikeViewModel;
import com.google.android.material.snackbar.Snackbar;

import okhttp3.OkHttpClient;

/**
 * SyncFragment - UI for syncing offline hikes to the cloud
 * Displays sync progress, status, and provides sync controls
 */
public class SyncFragment extends Fragment {
    
    private static final String TAG = "SyncFragment";
    
    private HikeViewModel viewModel;
    private AuthService authService;
    
    // UI Components
    private Button syncButton;
    private Button checkStatusButton;
    private Button downloadButton;
    private ProgressBar syncProgress;
    private ProgressBar downloadProgress;
    private TextView statusText;
    private TextView progressText;
    private TextView syncResultText;
    private TextView downloadStatusText;
    private TextView downloadProgressText;
    private TextView downloadResultText;
    
    private View rootView;
    
    public SyncFragment() {
        // Required empty public constructor
    }
    
    public static SyncFragment newInstance() {
        return new SyncFragment();
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        authService = new AuthService(requireContext(), new OkHttpClient());
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.fragment_sync, container, false);
        
        // Initialize UI components for offline-to-cloud sync
        syncButton = rootView.findViewById(R.id.syncButton);
        checkStatusButton = rootView.findViewById(R.id.checkStatusButton);
        syncProgress = rootView.findViewById(R.id.syncProgress);
        statusText = rootView.findViewById(R.id.statusText);
        progressText = rootView.findViewById(R.id.progressText);
        syncResultText = rootView.findViewById(R.id.syncResultText);
        
        // Initialize UI components for cloud-to-offline sync
        downloadButton = rootView.findViewById(R.id.downloadButton);
        downloadProgress = rootView.findViewById(R.id.downloadProgress);
        downloadStatusText = rootView.findViewById(R.id.downloadStatusText);
        downloadProgressText = rootView.findViewById(R.id.downloadProgressText);
        downloadResultText = rootView.findViewById(R.id.downloadResultText);
        
        return rootView;
    }
    
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        // Initialize ViewModel
        viewModel = new ViewModelProvider(this).get(HikeViewModel.class);
        
        // Get auth token
        String authToken = authService.getToken();
        
        // Observe ViewModel state
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), isLoading -> {
            syncButton.setEnabled(!isLoading);
            checkStatusButton.setEnabled(!isLoading);
        });
        
        viewModel.getSuccessMessage().observe(getViewLifecycleOwner(), message -> {
            if (message != null && !message.isEmpty()) {
                showSnackbar(message, Snackbar.LENGTH_LONG);
            }
        });
        
        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null && !error.isEmpty()) {
                showSnackbar(error, Snackbar.LENGTH_LONG);
            }
        });
        
        // Setup click listeners
        syncButton.setOnClickListener(v -> performSync(authToken));
        checkStatusButton.setOnClickListener(v -> checkSyncStatus(authToken));
        downloadButton.setOnClickListener(v -> performCloudDownload(authToken));
        
        // Initialize UI state
        initializeUI(authToken);
    }
    
    /**
     * Initialize the UI with current sync status
     */
    private void initializeUI(String authToken) {
        if (authToken == null) {
            statusText.setText("User not authenticated. Please log in first.");
            syncButton.setEnabled(false);
            checkStatusButton.setEnabled(false);
            return;
        }
        
        checkSyncStatus(authToken);
    }
    
    /**
     * Perform sync operation (offline-to-cloud)
     */
    private void performSync(String authToken) {
        if (authToken == null) {
            showSnackbar("Authentication required", Snackbar.LENGTH_LONG);
            return;
        }
        
        syncProgress.setProgress(0);
        progressText.setText("");
        syncResultText.setText("");
        statusText.setText("Starting sync...");
        
        viewModel.syncOfflineHikesToCloud(authToken, new SyncService.SyncCallback() {
            @Override
            public void onSyncStart(int totalHikes) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        statusText.setText("Syncing " + totalHikes + " hikes...");
                        syncProgress.setMax(totalHikes);
                        syncProgress.setProgress(0);
                    });
                }
            }
            
            @Override
            public void onSyncProgress(int completed, int total) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        syncProgress.setProgress(completed);
                        progressText.setText(completed + " / " + total + " hikes synced");
                    });
                }
            }
            
            @Override
            public void onSyncSuccess(SyncService.SyncResult result) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        statusText.setText("Sync completed!");
                        
                        String resultMsg = "✓ Successful: " + result.successfulUploads + "\n" +
                                           "✗ Failed: " + result.failedUploads + "\n" +
                                           "⊘ Skipped: " + result.skippedHikes + "\n" +
                                           "⏱ Duration: " + result.syncDuration + "ms";
                        syncResultText.setText(resultMsg);
                        syncProgress.setProgress(result.totalHikes);
                    });
                }
            }
            
            @Override
            public void onSyncError(String errorMessage) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        statusText.setText("Sync failed");
                        syncResultText.setText("Error: " + errorMessage);
                        showSnackbar("Sync error: " + errorMessage, Snackbar.LENGTH_LONG);
                    });
                }
            }
        });
    }
    
    /**
     * Check the current sync status
     */
    private void checkSyncStatus(String authToken) {
        if (authToken == null) {
            statusText.setText("User not authenticated");
            return;
        }
        
        viewModel.getSyncStatus(authToken, new SyncService.StatusCallback() {
            @Override
            public void onStatusReady(SyncService.SyncStatus status) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        String statusMsg = "Total Hikes: " + status.totalHikes + "\n" +
                                           "Synced: " + status.syncedHikes + "\n" +
                                           "Offline: " + status.offlineHikes + "\n" +
                                           "Sync Progress: " + status.syncPercentage + "%";
                        statusText.setText(statusMsg);
                        
                        syncProgress.setMax(status.totalHikes);
                        syncProgress.setProgress(status.syncedHikes);
                        
                        // Enable/disable sync button based on offline hikes
                        syncButton.setEnabled(status.offlineHikes > 0);
                        
                        if (status.offlineHikes == 0) {
                            syncButton.setText("All Synced");
                        } else {
                            syncButton.setText("Sync " + status.offlineHikes + " Hikes");
                        }
                    });
                }
            }
            
            @Override
            public void onError(String errorMessage) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        statusText.setText("Error: " + errorMessage);
                        showSnackbar("Failed to check sync status", Snackbar.LENGTH_LONG);
                    });
                }
            }
        });
    }
    
    /**
     * Perform cloud-to-offline sync (download hikes from cloud)
     */
    private void performCloudDownload(String authToken) {
        if (authToken == null) {
            showSnackbar("Authentication required", Snackbar.LENGTH_LONG);
            return;
        }
        
        downloadProgress.setProgress(0);
        downloadProgressText.setText("");
        downloadResultText.setText("");
        downloadStatusText.setText("Downloading hikes from cloud...");
        
        viewModel.syncCloudToOffline(authToken, new SyncService.CloudSyncCallback() {
            @Override
            public void onCloudSyncStart() {
                // Post UI update to main thread
                if (rootView != null) {
                    rootView.post(() -> downloadStatusText.setText("Preparing download..."));
                }
            }
            
            @Override
            public void onCloudSyncProgress(int completed, int total) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        downloadProgress.setMax(total);
                        downloadProgress.setProgress(completed);
                        downloadProgressText.setText(completed + " / " + total + " hikes downloaded");
                    });
                }
            }
            
            @Override
            public void onCloudSyncSuccess(SyncService.CloudSyncResult result) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        downloadStatusText.setText("Download completed!");
                        
                        String resultMsg = "✓ Downloaded: " + result.successfulInserts + "\n" +
                                           "✗ Failed: " + result.failedInserts + "\n" +
                                           "⊘ Duplicates: " + result.skippedDuplicates + "\n" +
                                           "⏱ Duration: " + result.syncDuration + "ms";
                        downloadResultText.setText(resultMsg);
                        downloadProgress.setProgress(result.totalDownloaded);
                    });
                }
            }
            
            @Override
            public void onCloudSyncError(String errorMessage) {
                // Post UI updates to main thread
                if (rootView != null) {
                    rootView.post(() -> {
                        downloadStatusText.setText("Download failed");
                        downloadResultText.setText("Error: " + errorMessage);
                        showSnackbar("Download error: " + errorMessage, Snackbar.LENGTH_LONG);
                    });
                }
            }
        });
    }
    
    /**
     * Show a snackbar message
     */
    private void showSnackbar(String message, int duration) {
        if (rootView != null) {
            Snackbar.make(rootView, message, duration).show();
        }
    }
}
