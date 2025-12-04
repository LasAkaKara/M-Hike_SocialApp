package com.example.mhike.ui.discovery;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import com.example.mhike.R;

/**
 * DiscoveryFragment - Displays community feed and trending hikes
 * Placeholder for future community feed implementation
 */
public class DiscoveryFragment extends Fragment {
    
    public DiscoveryFragment() {
        // Required empty public constructor
    }
    
    public static DiscoveryFragment newInstance() {
        return new DiscoveryFragment();
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_discovery, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        // TODO: Implement community feed
        // - Display trending hikes
        // - Show recent observations
        // - Display follows suggestions
        // - Show community activities
    }
}
