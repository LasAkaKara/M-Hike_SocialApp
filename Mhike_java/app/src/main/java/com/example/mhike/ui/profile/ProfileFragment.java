package com.example.mhike.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.fragment.app.Fragment;

import com.example.mhike.R;
import com.example.mhike.services.AuthService;
import com.example.mhike.services.DatabaseCleaner;
import com.example.mhike.ui.auth.LoginActivity;

/**
 * ProfileFragment - Displays user profile and settings
 * Shows user information and provides logout functionality
 */
public class ProfileFragment extends Fragment {
    
    private TextView userNameTextView;
    private TextView userBioTextView;
    private TextView userRegionTextView;
    private Button logoutButton;
    private AuthService authService;
    
    public ProfileFragment() {
        // Required empty public constructor
    }
    
    public static ProfileFragment newInstance() {
        return new ProfileFragment();
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        authService = new AuthService(requireContext(), new okhttp3.OkHttpClient());
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }
    
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        // Initialize UI components
        initializeUI(view);
        
        // Load user profile
        loadUserProfile();
        
        // Set up listeners
        setupListeners();
    }
    
    private void initializeUI(View view) {
        userNameTextView = view.findViewById(R.id.userNameTextView);
        userBioTextView = view.findViewById(R.id.userBioTextView);
        userRegionTextView = view.findViewById(R.id.userRegionTextView);
        logoutButton = view.findViewById(R.id.logoutButton);
    }
    
    private void loadUserProfile() {
        // TODO: Fetch user profile from backend or local storage
        // For now, show placeholder data
        String username = authService.getUsername();
        
        if (username != null) {
            userNameTextView.setText(username);
            userBioTextView.setText("Bio coming soon");
            userRegionTextView.setText("Region coming soon");
        } else {
            userNameTextView.setText("User");
            userBioTextView.setText("Not logged in");
            userRegionTextView.setText("-");
        }
    }
    
    private void setupListeners() {
        logoutButton.setOnClickListener(v -> {
            // Clear all local data when logging out
            DatabaseCleaner cleaner = new DatabaseCleaner(requireContext());
            cleaner.clearAllLocalData();
            
            // Clear authentication data
            authService.logout();
            
            // Navigate to login screen
            navigateToLogin();
        });
    }
    
    private void navigateToLogin() {
        Intent intent = new Intent(requireContext(), LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        requireActivity().finish();
    }
}
