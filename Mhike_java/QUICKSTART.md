# M-Hike Android - Quick Start Guide

## Overview

This is the Android Java implementation of M-Hike with local SQLite persistence (Tasks A & B). All hike data is stored locally on the device with offline-first design.

---

## Getting Started

### 1. Open Project in Android Studio

```bash
# Navigate to the project
cd Mhike_java

# Open in Android Studio (macOS/Linux)
open -a "Android Studio" .

# Or on Windows, open Android Studio and select "Open" -> navigate to Mhike_java folder
```

### 2. Sync Gradle

Once the project opens:
- Wait for Android Studio to sync Gradle files automatically
- If not automatic: **File → Sync Now**
- This will download all dependencies from `libs.versions.toml`

### 3. Build the Project

Option A: Using Android Studio
- **Build → Make Project** (or press Ctrl+F9 / Cmd+F9)

Option B: Using Terminal
```bash
./gradlew build
```

### 4. Create Virtual Device (Emulator)

If you don't have a device connected:
- **Tools → Device Manager → Create Device**
- Select a phone template (e.g., Pixel 6)
- Choose Android API 30 or higher
- Click Finish

### 5. Run the App

**Option A: From Android Studio**
- Press **Shift + F10** (Windows/Linux) or **Ctrl + R** (macOS)
- Or: **Run → Run 'app'**
- Select your emulator or device

**Option B: From Terminal**
```bash
./gradlew installDebug
```

---

## Features Available Now

### ✅ Task A: Hike Entry
Create new hikes with:
- Name, Location, Date, Time
- Length, Difficulty, Parking availability
- Optional description and privacy setting
- Real-time form validation

### ✅ Task B: Local CRUD
- **Create**: Add hikes via "Add Hike" button (FAB)
- **Read**: View hikes in list on home screen
- **Update**: Long-press hike → "Edit"
- **Delete**: Long-press hike → "Delete"
- **Search**: Use search bar to filter by name
- **Reset**: Settings menu → "Reset Database"

### ✅ Task C: Observations (Basic)
- Add observations to individual hikes
- View observations in hike details
- Delete observations
- See observation status badges

---

## App Navigation

### Home Screen (MainActivity)
```
[Material Toolbar - M-Hike]
┌─────────────────────────────────┐
│ 🔍 Search hikes...              │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Hike Name                   │ │
│ │ 📍 Location                 │ │
│ │ Date | Length | Difficulty │ │
│ └─────────────────────────────┘ │ ← Card for each hike
│ ┌─────────────────────────────┐ │
│ │ Another Hike                │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│                           ➕ Add │ ← FAB (Floating Action Button)
└─────────────────────────────────┘
```

**Interactions:**
- **Tap card**: View hike details
- **Long-press card**: Open options menu (View/Edit/Delete)
- **Search bar**: Filter hikes by name
- **FAB (+)**: Create new hike
- **Menu (⋯)**: Settings (Reset Database)

### Add Hike Screen (AddHikeActivity)
```
[Back] [Add Hike]
┌─────────────────────┐
│ Hike Name *         │
│ Location *          │
│ Date * [📅 picker]  │
│ Time [🕐 picker]    │
│ Length (km) * [7.5] │
│ Difficulty ▼ [Easy] │
│ Parking [Toggle]    │
│ Privacy ▼ [Private] │
│ Description         │
│ [Cancel]  [Save]    │
└─────────────────────┘
```

**Features:**
- All `*` marked fields are required
- Date/Time use system pickers
- Difficulty and Privacy are dropdowns
- Real-time validation with error messages
- Saves to local SQLite database

### Hike Details Screen (HikeDetailActivity)
```
[Back] [Edit/Delete]
┌──────────────────────────────────┐
│ Hike Name                        │
│ 📍 Location                      │
│ ┌──────────────────────────────┐ │
│ │ Date | Time | Length | Diff. │ │
│ │ 2024-01-15 | 09:30 | 7.5km  │ │
│ └──────────────────────────────┘ │
│ Description: [hike description]  │
│                                  │
│ Observations                 [+] │
│ ┌──────────────────────────────┐ │
│ │ Observation Title            │ │
│ │ 10:45 | Status: Open         │ │
│ │ Comment: [if exists]         │ │
│ │              [Delete]         │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Another Observation...       │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Interactions:**
- Edit/Delete buttons in menu
- Add observations button
- Long-form hike details
- Observation cards with delete buttons

---

## File Structure Quick Reference

```
Mhike_java/
├── app/src/main/
│   ├── java/com/example/mhike/
│   │   ├── database/             # Room database setup
│   │   ├── ui/                   # Activities, Fragments, Adapters
│   │   ├── ui/viewmodels/        # MVVM ViewModels
│   │   └── ...
│   └── res/
│       ├── layout/               # XML layouts (screens)
│       ├── values/strings.xml    # Text strings (edit here for UI text)
│       ├── values/colors.xml     # Colors (Material Design 3)
│       └── menu/                 # Menu definitions
└── DEVELOPMENT.md                # Detailed documentation
```

---

## Common Tasks

### 📝 Change App Text
Edit `app/src/main/res/values/strings.xml`

Example:
```xml
<string name="app_name">M-Hike</string>
<string name="add_hike">Add Hike</string>
```

### 🎨 Change Colors
Edit `app/src/main/res/values/colors.xml`

Example:
```xml
<color name="primary">#2E7D32</color>  <!-- Green for hiking theme -->
<color name="error">#D32F2F</color>    <!-- Red for delete -->
```

### ➕ Add New Field to Hike Form
1. Add field to `Hike.java` entity
2. Add UI element to `activity_add_hike.xml`
3. Update `AddHikeActivity.java` to handle the field
4. Update `HikeDetailActivity.java` to display it

### 🔍 Debug with Logcat
- **View → Tool Windows → Logcat** (or Alt+6)
- Filter by `mhike` package name
- Look for error messages and crashes

---

## Database Info

### Where Data is Stored
- **Device**: `/data/data/com.example.mhike/databases/mhike_database.db`
- **Emulator**: Can inspect via Android Studio Device Explorer

### Reset Database
- Open app
- Tap menu (⋯) → Settings → Reset Database
- Confirm deletion
- All hikes and observations will be deleted

### Export Database (for debugging)
1. In Android Studio: **View → Tool Windows → Device Manager**
2. Right-click device → **Device Explorer**
3. Navigate to `/data/data/com.example.mhike/databases/`
4. Right-click `mhike_database.db` → **Save As**

---

## Testing the App

### Test Scenario 1: Create & View Hike
1. Open app → Click **Add Hike** (+)
2. Fill in:
   - Name: "Mountain Peak"
   - Location: "Rockies"
   - Date: (select today)
   - Length: 8.5
   - Difficulty: Medium
3. Tap **Save**
4. See hike in list on home screen
5. Tap hike card → See details

### Test Scenario 2: Edit Hike
1. Long-press hike on home screen
2. Select **Edit**
3. Change name to "Mountain Peak - Updated"
4. Tap **Save**
5. Verify change in list

### Test Scenario 3: Search
1. Create 3+ hikes with different names
2. Use search bar to type part of name
3. List filters in real-time

### Test Scenario 4: Observations
1. Open hike details
2. Tap **Add Observation**
3. Enter title: "Trail was slippery"
4. Tap **Save**
5. See observation card below
6. Tap **Delete** on observation to remove

### Test Scenario 5: Reset Database
1. Tap menu (⋯)
2. Select **Settings** → **Reset Database**
3. Confirm deletion
4. App returns to empty state

---

## Troubleshooting

### Problem: "Build failed - package R does not exist"
**Solution:**
```bash
./gradlew clean build
```
Then rebuild in Android Studio.

### Problem: "No emulator showing up"
**Solution:**
1. Go to **Tools → Device Manager**
2. Click **Create Device**
3. Select Pixel 6 (or any phone)
4. Click through and select API 30+
5. Click **Finish** and let it download
6. When done, click play ▶ to start it

### Problem: "App crashes on startup"
**Solution:**
1. Check **Logcat** for error messages
2. Common causes:
   - Room database migration needed: `./gradlew clean build`
   - Missing dependency: Check `build.gradle.kts` has all Room libraries
   - Database corruption: Use Settings → Reset Database

### Problem: "Can't edit hike"
**Solution:**
- Make sure you're using long-press on card (not regular tap)
- Or open hike details first, then use Edit button

---

## Next Phase: Cloud Sync (Task D onwards)

Once happy with Tasks A-B, next steps are:
1. **Task D**: Search & filtering (done in UI, just needs backend API)
2. **Task E**: Hike review modal (UI enhancement)
3. **Task F**: Cloud sync with Node.js backend
4. **Task G**: Social features (following, feeds, leaderboards)

See `DEVELOPMENT.md` for detailed next steps.

---

## Need Help?

- Check `DEVELOPMENT.md` for detailed architecture
- Review code comments in Java files
- Check Android Studio Logcat for runtime errors
- Refer to Android Room documentation: https://developer.android.com/training/data-storage/room

---

## Summary

✅ **What's Built:**
- Local SQLite database with Room ORM
- Add/Edit/Delete hikes
- Search hikes by name
- View hike details
- Add/Delete observations
- Material Design 3 UI
- MVVM architecture

📅 **What's Next:**
- Cloud synchronization
- Social features
- Photo upload
- Maps integration
- Advanced filtering

Happy coding! 🥾📱
