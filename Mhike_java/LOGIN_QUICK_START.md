# Login/Register Quick Setup Guide

## What Was Just Added

### 1. Authentication System
- **AuthService**: Centralized service for auth API calls
- **LoginActivity**: User login screen with JWT authentication
- **RegisterActivity**: New user registration form
- **SharedPreferences**: Local token storage

### 2. UI Screens
- Login form with username/password
- Registration form with bio and region
- Automatic login on app restart
- Material Design 3 styling throughout

### 3. Backend Integration
- JWT token-based authentication
- ngrok URL support for backend API
- Automatic token storage and retrieval
- Error handling with user-friendly messages

---

## Configuration Steps

### Step 1: Update ngrok URL

**File:** `AuthService.java`

**Line ~45:**
```java
private static final String BASE_URL = "https://your-ngrok-url.ngrok.io/api";
```

**Action:** Replace `your-ngrok-url` with the actual ngrok URL from your backend deployment.

**Example:**
```java
private static final String BASE_URL = "https://1a2b3c4d5e6f7g8h.ngrok.io/api";
```

### Step 2: Test Login Flow

1. **Build and run the app**
   - LoginActivity will appear first
   - You won't see MainActivity until logged in

2. **Test Registration**
   - Click "Sign Up" on login screen
   - Fill in all required fields:
     - Username (3+ characters, letters/numbers/underscores only)
     - Password (6+ characters)
     - Confirm password
     - Region (required)
     - Bio (optional, 500 char max)
   - Click "Create Account"
   - Should navigate to MainActivity on success

3. **Test Login**
   - Kill the app completely
   - Restart the app
   - Should go straight to MainActivity (auto-login from saved token)
   - Or manually test by:
     - Logging out (not yet implemented, but code is ready)
     - Entering credentials
     - Clicking "Sign In"

### Step 3: Handle Errors

**Common Error Messages:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Network error" | Can't reach backend | Check ngrok URL, ensure backend is running |
| "Username already exists" | Username taken | Try different username |
| "Invalid response format" | Backend returned unexpected JSON | Check backend logs |
| "Authentication failed: 400" | Bad credentials | Check username/password format |

---

## Current State

### ✅ Implemented
- Login screen with validation
- Registration screen with validation
- AuthService with JWT token management
- SharedPreferences token storage
- Automatic login on app restart
- Error handling with user messages
- Material Design 3 forms

### ⏳ Not Yet Done
- OkHttp interceptor for JWT injection in API requests
- Bottom navigation tabs (My Hikes, Feed, Profile)
- Community feed screen
- Profile screen with logout
- Social features (follow, trending, etc.)

---

## Architecture

```
LoginActivity (Entry Point)
    ↓ Sign In/Register
AuthService ← (HTTP calls to backend)
    ↓ Save token
SharedPreferences (JWT storage)
    ↓ Auto-login
MainActivity (Hike list + tabs - coming soon)
```

---

## Testing Checklist

- [ ] App launches to LoginActivity (not MainActivity)
- [ ] Registration form validates all fields
- [ ] Can successfully register new account
- [ ] Login with registered credentials works
- [ ] Error message shows for wrong password
- [ ] Logging out and back in retrieves token
- [ ] App restarts and auto-logs-in
- [ ] All Material Design components render correctly
- [ ] Network errors handled gracefully

---

## File Locations

| File | Location |
|------|----------|
| AuthService | `services/AuthService.java` |
| LoginActivity | `ui/auth/LoginActivity.java` |
| RegisterActivity | `ui/auth/RegisterActivity.java` |
| Login Layout | `res/layout/activity_login.xml` |
| Register Layout | `res/layout/activity_register.xml` |
| Error Background | `res/drawable/error_background.xml` |
| AndroidManifest | `AndroidManifest.xml` |

---

## Next Implementation (Bottom Navigation)

After authentication is working, we'll:

1. **Create bottom navigation with 3 tabs:**
   - My Hikes (existing functionality)
   - Community Feed (new)
   - Profile (new)

2. **Move existing hike list to "My Hikes" tab**

3. **Add logout to Profile tab**

4. **Implement community features**

---

## Notes for Developers

- AuthService uses callbacks because OkHttp is async
- Tokens are cleared on logout (SharedPreferences.remove())
- ngrok URL changes with each backend restart - keep updated
- All API calls are non-blocking (background threads)
- Form validation happens before API calls (better UX)
- MaterialTextView and MaterialButton for consistency with Design 3

---

## Quick Commands

**Clean and rebuild:**
```bash
./gradlew clean build
```

**Run tests:**
```bash
./gradlew test
```

**Deploy to device/emulator:**
```bash
./gradlew installDebug
```

**View device logs:**
```bash
adb logcat | grep "AuthService"
```

