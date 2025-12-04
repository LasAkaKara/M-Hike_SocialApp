package com.example.mhike.ui.discovery;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;
import androidx.viewpager2.widget.ViewPager2;

import com.example.mhike.R;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

/**
 * DiscoveryFragment - Main discovery tab container
 * Displays Search and Feed tabs using ViewPager2
 */
public class DiscoveryFragment extends Fragment {
    
    private ViewPager2 viewPager;
    private TabLayout tabLayout;
    private TabLayoutMediator tabLayoutMediator;
    
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
        
        viewPager = view.findViewById(R.id.viewPager);
        tabLayout = view.findViewById(R.id.tabLayout);
        
        // Setup ViewPager2 with adapter
        DiscoveryPagerAdapter adapter = new DiscoveryPagerAdapter(this);
        viewPager.setAdapter(adapter);
        
        // Connect TabLayout with ViewPager2
        tabLayoutMediator = new TabLayoutMediator(tabLayout, viewPager, (tab, position) -> {
            switch (position) {
                case 0:
                    tab.setText("Search");
                    break;
                case 1:
                    tab.setText("Feed");
                    break;
            }
        });
        tabLayoutMediator.attach();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        // Detach the mediator to prevent memory leaks
        if (tabLayoutMediator != null) {
            tabLayoutMediator.detach();
            tabLayoutMediator = null;
        }
    }
    
    /**
     * ViewPager2 adapter for discovery tabs
     */
    private static class DiscoveryPagerAdapter extends FragmentStateAdapter {
        
        private static final int NUM_TABS = 2;
        
        public DiscoveryPagerAdapter(@NonNull Fragment fragment) {
            super(fragment);
        }
        
        @NonNull
        @Override
        public Fragment createFragment(int position) {
            switch (position) {
                case 0:
                    return SearchUsersFragment.newInstance();
                case 1:
                    return FeedFragment.newInstance();
                default:
                    return SearchUsersFragment.newInstance();
            }
        }
        
        @Override
        public int getItemCount() {
            return NUM_TABS;
        }
    }
}
