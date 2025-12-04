package com.example.mhike.ui;

import android.os.Bundle;
import android.view.MenuItem;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.example.mhike.R;
import com.example.mhike.ui.discovery.DiscoveryFragment;
import com.example.mhike.ui.home.HomeFragment;
import com.example.mhike.ui.profile.ProfileFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;

/**
 * MainActivity - Tab navigation container for app main features
 * Hosts HomeFragment, DiscoveryFragment, and ProfileFragment
 */
public class MainActivity extends AppCompatActivity {
    
    private BottomNavigationView bottomNavigationView;
    private HomeFragment homeFragment;
    private DiscoveryFragment discoveryFragment;
    private ProfileFragment profileFragment;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Initialize BottomNavigationView
        bottomNavigationView = findViewById(R.id.bottomNavigationView);
        bottomNavigationView.setOnItemSelectedListener(this::onNavigationItemSelected);
        
        // Create fragments
        if (savedInstanceState == null) {
            homeFragment = HomeFragment.newInstance();
            discoveryFragment = DiscoveryFragment.newInstance();
            profileFragment = ProfileFragment.newInstance();
            
            // Load home fragment by default
            loadFragment(homeFragment);
            bottomNavigationView.setSelectedItemId(R.id.navigation_home);
        }
    }
    
    private boolean onNavigationItemSelected(MenuItem item) {
        Fragment selectedFragment = null;
        
        if (item.getItemId() == R.id.navigation_home) {
            if (homeFragment == null) {
                homeFragment = HomeFragment.newInstance();
            }
            selectedFragment = homeFragment;
        } else if (item.getItemId() == R.id.navigation_discovery) {
            if (discoveryFragment == null) {
                discoveryFragment = DiscoveryFragment.newInstance();
            }
            selectedFragment = discoveryFragment;
        } else if (item.getItemId() == R.id.navigation_profile) {
            if (profileFragment == null) {
                profileFragment = ProfileFragment.newInstance();
            }
            selectedFragment = profileFragment;
        }
        
        if (selectedFragment != null) {
            loadFragment(selectedFragment);
            return true;
        }
        
        return false;
    }
    
    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager()
            .beginTransaction()
            .replace(R.id.fragmentContainerView, fragment)
            .commit();
    }
}
