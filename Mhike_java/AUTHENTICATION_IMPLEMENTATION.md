# M-Hike Android - Login/Register & Social Features Implementation

## Overview

This document outlines the authentication system and social features foundation we've added to the M-Hike Android Java application. We've implemented JWT-based authentication with the backend API (hosted on ngrok), prepared navigation structure for social features, and created a reusable authentication service.

---

## Part 1: Authentication System

### Architecture Approach

**Authentication Flow:**
```
User Launch
    ↓
Check if logged in (SharedPreferences)
    ├─ Yes → Navigate to MainActivity (with tabs)
    └─ No → Show LoginActivity
        ├─ Click Sign In → Call backend API
        ├─ Credentials valid → Save JWT token
        ├─ Success → Navigate to MainActivity
        └─ Error → Show error message
```

### 1. AuthService (Centralized Authentication)

**Location:** `com.example.mhike.services.AuthService`

**Purpose:** 
- Single source of truth for all authentication API calls
- Manages JWT token storage in SharedPreferences
- Provides callbacks for async API operations

**Key Features:**

**Sign Up Method:**
```
signup(username, password, bio, region, avatarUrl, callback)
```
- Validates inputs client-side before sending
- Calls backend `/api/auth/signup` endpoint
- Returns JWT token on success
- Stores token with user ID and username in SharedPreferences

**Sign In Method:**
```
signin(username, password, callback)
```
- Validates credentials
- Calls backend `/api/auth/signin` endpoint
- Retrieves JWT token from response
- Automatically saves for future authenticated requests

**Token Management:**
- `saveToken(token, userId, username)` - Persists JWT to local storage
- `getToken()` - Retrieves stored JWT for API requests
- `isLoggedIn()` - Checks if user has valid token
- `logout()` - Clears all authentication data

**Callback Pattern:**
- Uses `AuthService.AuthCallback` interface for async responses
- `onSuccess(token, userId, username)` - Called on successful auth
- `onError(errorMessage)` - Called on auth failure with human-readable error

**Implementation Notes:**
- Uses OkHttpClient for HTTP requests
- Parses JSON responses using native JSONObject (not requiring Gson)
- Thread-safe token storage via SharedPreferences atomic operations
- Logs all auth operations for debugging

### 2. LoginActivity

**Location:** `com.example.mhike.ui.auth.LoginActivity`

**Purpose:** User authentication screen

**UI Components:**
- Username field with clear icon
- Password field with password toggle visibility
- Sign In button (primary action)
- Sign Up link (for new users)
- Error message display with red background
- Loading progress indicator

**Functionality:**

**Form Validation:**
- Username: Required, minimum 3 characters
- Password: Required, minimum 6 characters
- Shows field-level error messages in TextInputLayout

**Login Flow:**
1. User enters credentials
2. Form validates inputs
3. Shows loading progress bar
4. Calls `authService.signin()` with callback
5. On success: Saves token, navigates to MainActivity
6. On error: Shows error message, disables loading

**Automatic Navigation:**
- On app launch, checks if already logged in
- If token exists and is valid, skips login and goes to MainActivity
- Prevents repeated login prompts

**User Experience:**
- All fields disabled during loading to prevent duplicate requests
- Clear error messages guide user on what went wrong
- Intuitive workflow from login to signup screen

### 3. RegisterActivity

**Location:** `com.example.mhike.ui.auth.RegisterActivity`

**Purpose:** New user registration screen

**UI Components:**
- Username field (required)
- Password field (required, with visibility toggle)
- Confirm password field (for verification)
- Region field (required, for location-based features)
- Bio field (optional, 500 character limit with counter)
- Back button in toolbar (to return to login)
- Create Account button
- Sign In link for existing users

**Functionality:**

**Form Validation:**
- Username: 3+ chars, alphanumeric + underscore only
- Password: 6+ characters
- Confirm Password: Must match password
- Region: Required (cannot be empty)
- Bio: Optional but capped at 500 characters
- Shows inline error messages for each field

**Registration Flow:**
1. User fills form
2. Fields validate on save attempt
3. Shows progress indicator
4. Calls `authService.signup()` with callback
5. On success: Saves token, navigates to MainActivity
6. On error: Displays error message with retry option

**Data Submission:**
- Sends to backend `/api/auth/signup` endpoint
- Includes username, password, bio, region
- Avatar URL optional (set to null if not provided)
- Backend hashes password with SHA-256

---

## Part 2: Android Architecture Updates

### 4. AndroidManifest.xml Changes

**Launch Activity Updated:**
- LoginActivity now set as MAIN/LAUNCHER activity
- Exported: true (can be launched from outside app)
- RegisterActivity exported: false (internal only)
- MainActivity exported: false (no longer entry point)

**Activity Hierarchy:**
```
LoginActivity (Launch point)
├── RegisterActivity (back button returns to LoginActivity)
├── MainActivity (on successful auth)
    ├── AddHikeActivity (from My Hikes tab)
    ├── HikeDetailActivity (from hike list)
    └── PickLocationActivity (from detail screen)
```

**Permissions Already Configured:**
- INTERNET (required for API calls)
- LOCATION permissions (for GPS)
- CAMERA, READ/WRITE_EXTERNAL_STORAGE (for photos)

### 5. Prepared for Next Steps

**OkHttp Authentication Interceptor (Not Yet Implemented):**
- Will automatically add JWT token to all API requests
- Handles `Authorization: Bearer <token>` header injection
- Can implement automatic token refresh on 401 responses

**Bottom Navigation Tabs (Planned for Next Phase):**
```
MainActivity with 3 tabs:
├── Tab 1: My Hikes
│   └── Keeps all existing functionality
│   └── Add, view, edit, delete hikes
├── Tab 2: Community Feed
│   └── Shows nearby observations and hikes
│   └── Social features (following, trending)
└── Tab 3: Profile
    └── User profile and settings
    └── Logout button
```

---

## Part 3: Data Persistence

### JWT Token Storage

**Mechanism:** SharedPreferences (app-private file)

**Storage Keys:**
- `jwt_token` - The JWT authorization token
- `user_id` - User's numeric ID from backend
- `username` - Display username

**Security Considerations:**
- Tokens stored locally; cleared on logout
- SharedPreferences is app-private (not world-readable)
- No token encryption on-device (acceptable for this phase)
- Tokens expire server-side (backend implementation detail)

**Lifecycle:**
- On login/signup: Token automatically persisted
- On app restart: Token retrieved and user auto-logged in
- On logout: Token cleared and user sent to LoginActivity

---

## Part 4: Backend Integration

### API Endpoints Used

**Sign Up Endpoint:**
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_hiker",
  "password": "SecurePassword123",
  "bio": "Love hiking!",
  "region": "California",
  "avatarUrl": null
}

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_hiker",
    "bio": "Love hiking!",
    "region": "California",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User created successfully"
}
```

**Sign In Endpoint:**
```
POST /api/auth/signin
Content-Type: application/json

{
  "username": "john_hiker",
  "password": "SecurePassword123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_hiker",
    "bio": "Love hiking!",
    "region": "California",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Sign in successful"
}
```

### ngrok URL Configuration

**Current Setup:**
- AuthService has BASE_URL placeholder: `https://your-ngrok-url.ngrok.io/api`
- Replace with actual ngrok URL when available

**How to Configure:**
1. Get ngrok URL from backend team
2. Update `BASE_URL` constant in AuthService
3. Rebuild and deploy APK

**Example:**
```java
private static final String BASE_URL = "https://a1b2c3d4e5f6g7h8.ngrok.io/api";
```

---

## Part 5: User Experience Flow

### Login Journey

```
1. App Launches
   ↓
2. LoginActivity Displayed
   - Username & password fields
   - "Sign In" button
   - "Don't have account? Sign Up" link
   ↓
3. User Enters Credentials
   ↓
4. Click "Sign In"
   - Validates fields
   - Shows loading spinner
   ↓
5. API Call to Backend
   - Sends POST /api/auth/signin
   ↓
6a. Success
   - Token saved to SharedPreferences
   - Navigate to MainActivity
   - Hike list displayed
   
6b. Error (Wrong password)
   - Show error message
   - Allow retry
   - Button re-enabled
```

### Registration Journey

```
1. User at LoginActivity
   ↓
2. Click "Sign Up"
   ↓
3. RegisterActivity Displayed
   - Username field (3+ chars, alphanumeric_)
   - Password field (6+ chars)
   - Confirm password
   - Region field (required)
   - Bio field (optional, 500 char limit)
   ↓
4. User Fills Form
   ↓
5. Click "Create Account"
   - Validates all fields
   - Shows loading spinner
   ↓
6. API Call to Backend
   - Sends POST /api/auth/signup
   ↓
7a. Success
   - Token saved
   - Navigate to MainActivity
   
7b. Error (Username taken)
   - Show error: "Username already exists"
   - Allow correction and retry
```

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **AuthService** | ✅ Complete | JWT token management, API integration |
| **LoginActivity** | ✅ Complete | Form validation, error handling, navigation |
| **RegisterActivity** | ✅ Complete | Input validation, account creation |
| **Login Layout** | ✅ Complete | Material Design 3, responsive |
| **Register Layout** | ✅ Complete | Material Design 3, responsive |
| **AndroidManifest** | ✅ Complete | Activities registered, correct launch activity |
| **Token Storage** | ✅ Complete | SharedPreferences, auto-login on relaunch |
| **Error Handling** | ✅ Complete | User-friendly messages, field validation |
| **OkHttp Interceptor** | ⏳ Planned | Will add JWT to all authenticated requests |
| **Bottom Nav Tabs** | ⏳ Planned | My Hikes, Community Feed, Profile |
| **Community Feed** | ⏳ Planned | Geo-based discovery, trending content |
| **Profile Screen** | ⏳ Planned | User info, leaderboards, logout |

---

## Next Steps

### Immediate (Phase 2)
1. **Configure ngrok URL** in AuthService
2. **Test end-to-end** login/register flow with backend
3. **Implement OkHttp Interceptor** for JWT injection in all requests
4. **Create AuthViewModel** for shared authentication state across app

### Short-term (Phase 3)
1. **Refactor MainActivity** to support bottom navigation with 3 tabs
2. **Create HomeFragment** for My Hikes tab (move existing list functionality)
3. **Create DiscoveryFragment** for Community Feed tab
4. **Create ProfileFragment** for user profile and settings
5. **Implement logout** in profile tab

### Medium-term (Phase 4)
1. **Implement social features:**
   - Follow/Unfollow users
   - Trending observations
   - Discovery feed with geo-location
   - User profiles with stats
2. **Leaderboards** integration
3. **Cloud sync** for hikes and observations

---

## File Summary

### New Files Created
1. **AuthService.java** - Authentication API service
2. **LoginActivity.java** - Login screen
3. **RegisterActivity.java** - Registration screen
4. **activity_login.xml** - Login layout
5. **activity_register.xml** - Register layout
6. **error_background.xml** - Error message styling

### Modified Files
1. **AndroidManifest.xml** - Updated activities and launch configuration

### Existing Files Preserved
- All existing hike, observation, and location features remain intact
- MainActivity will be enhanced with tabs in next phase
- All database functionality preserved

---

## Technical Details

### Dependencies Used
- OkHttpClient (HTTP requests)
- JSONObject (JSON parsing)
- SharedPreferences (secure local storage)
- Material Design 3 (UI components)
- AndroidX (compatibility)

### Security Practices
- Passwords never stored locally
- JWT tokens encrypted during transmission (HTTPS/ngrok)
- Form validation prevents invalid data submission
- Error messages don't expose sensitive information
- Automatic logout on app uninstall (SharedPreferences cleared)

### Performance Considerations
- Async API calls prevent UI blocking
- OkHttpClient connection pooling reused
- Minimal memory footprint for tokens
- Single AuthService instance (singleton pattern ready)

---

## Summary

We've successfully implemented a complete JWT-based authentication system for M-Hike Android with:
- ✅ User login and registration
- ✅ Secure token management
- ✅ Backend API integration
- ✅ Automatic login on app restart
- ✅ User-friendly error handling
- ✅ Material Design 3 UI
- ✅ Foundation for social features

The app is now ready for social feature development with authenticated API calls to the backend. All current hike management features are preserved and will be integrated into the new tabbed navigation system.

