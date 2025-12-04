# Bottom Navigation Implementation Guide

## Overview

The main activity navigation has been refactored to use a bottom navigation bar with three tabs:
1. **My Hikes** - View, search, and manage your hikes
2. **Community Feed** - Discover hikes from other users (coming soon)
3. **Profile** - View user profile and logout

## File Structure

```
ui/
├── MainActivity.java (REFACTORED)
├── home/
│   └── HomeFragment.java (NEW)
├── discovery/
│   └── DiscoveryFragment.java (NEW)
└── profile/
    └── ProfileFragment.java (NEW)

res/
├── layout/
│   ├── activity_main.xml (REFACTORED)
│   ├── fragment_home.xml (NEW)
│   ├── fragment_discovery.xml (NEW)
│   └── fragment_profile.xml (NEW)
├── menu/
│   └── menu_bottom_navigation.xml (NEW)
└── drawable/
    └── selector_bottom_nav_color.xml (NEW)
```

## Key Components

### MainActivity.java
- **Purpose**: Tab navigation container
- **Responsibility**: Manages FragmentContainerView and BottomNavigationView
- **Key Methods**:
  - `onCreate()` - Initializes fragments and sets up bottom nav listener
  - `onNavigationItemSelected()` - Handles tab selection and fragment loading
  - `loadFragment()` - Replaces fragment in container

### HomeFragment.java
- **Purpose**: Displays user's hike list with CRUD operations
- **Moved From**: MainActivity
- **Features**:
  - Hike list with RecyclerView
  - Search functionality
  - Add new hike (FAB)
  - Edit/Delete hike context menu
  - Empty state message
  - Success/Error messages via Snackbar

### DiscoveryFragment.java
- **Purpose**: Community feed placeholder
- **Future Features**:
  - Trending hikes
  - Recent observations
  - Follow suggestions
  - Community activities

### ProfileFragment.java
- **Purpose**: User profile and account management
- **Features**:
  - User information display
  - Stats (hikes, followers, following)
  - Logout button
  - Profile card with avatar placeholder

## Layout Files

### activity_main.xml
```xml
<!-- Simple container with bottom nav -->
<LinearLayout>
    <FragmentContainerView id="fragmentContainerView" />
    <BottomNavigationView id="bottomNavigationView" />
</LinearLayout>
```

### fragment_home.xml
- Search bar with clear icon
- RecyclerView for hikes
- Empty state layout with icon and message
- FloatingActionButton for adding hikes

### fragment_discovery.xml
- Centered placeholder view
- Community icon
- "Coming Soon" message

### fragment_profile.xml
- Profile card with avatar, name, bio, region
- Stats section (hikes, followers, following)
- Logout button at bottom

## Navigation Flow

```
LoginActivity
    ↓
MainActivity (Authentication required)
    ├── HomeFragment (Default)
    │   ├── AddHikeActivity (FAB)
    │   └── HikeDetailActivity (Long click)
    ├── DiscoveryFragment (Coming soon)
    └── ProfileFragment
        └── LoginActivity (Logout)
```

## Implementation Details

### Bottom Navigation Menu
```xml
<menu>
    <item id="navigation_home" icon="@drawable/ic_home" title="My Hikes" />
    <item id="navigation_discovery" icon="@drawable/ic_community" title="Community Feed" />
    <item id="navigation_profile" icon="@drawable/ic_profile" title="Profile" />
</menu>
```

### Color Selector
- Selected: `colorPrimary`
- Unselected: `colorOnSurfaceVariant`

## String Resources Added

```xml
<string name="my_hikes">My Hikes</string>
<string name="community_feed">Community Feed</string>
<string name="coming_soon">Coming Soon</string>
<string name="user">User</string>
<string name="bio_coming_soon">Bio coming soon</string>
<string name="region_coming_soon">Region coming soon</string>
<string name="hikes">Hikes</string>
<string name="followers">Followers</string>
<string name="following">Following</string>
<string name="logout">Logout</string>
```

## Features Preserved

✅ **HomeFragment includes all original MainActivity features**:
- Hike list with RecyclerView
- Search with live filtering
- FAB to add new hike
- Long-click context menu for edit/delete
- Empty state layout
- Success/Error messages

✅ **Navigation preserved**:
- Add hike launches AddHikeActivity
- Hike click launches HikeDetailActivity
- All CRUD operations intact

## Future Enhancements

1. **DiscoveryFragment**:
   - Fetch trending hikes from backend
   - Display recent observations
   - Show follow suggestions
   - Community activity feed

2. **ProfileFragment**:
   - Fetch user data from backend
   - Edit profile information
   - View user statistics
   - View following/followers lists

3. **Cross-tab features**:
   - OkHttp interceptor for JWT injection
   - Shared ViewModel for user state
   - Cloud sync implementation

## Testing Checklist

- [ ] App launches to LoginActivity
- [ ] Login navigates to MainActivity with HomeFragment
- [ ] Bottom navigation tabs are visible
- [ ] Clicking tabs switches fragments
- [ ] My Hikes shows all hikes
- [ ] Search filtering works in My Hikes
- [ ] FAB launches AddHikeActivity
- [ ] Long-click opens context menu
- [ ] Edit hike works
- [ ] Delete hike works
- [ ] Community Feed shows placeholder
- [ ] Profile shows user info
- [ ] Logout returns to LoginActivity
- [ ] No threading errors in Logcat

## Dependencies

- AndroidX Fragment 1.6.0+
- Material Design 3
- Android support libraries
- OkHttpClient (for JWT token management)
- Room ORM (database)

## Notes

- Fragments use ViewModelProvider to maintain separate state
- LoginActivity remains entry point - MainActivity requires authentication
- All existing hike functionality preserved in HomeFragment
- AddHikeActivity and HikeDetailActivity remain unchanged
- ProfileFragment handles logout and navigation back to login
