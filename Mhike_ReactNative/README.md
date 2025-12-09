# M-Hike Social App

A React Native hiking tracking application built with Expo. Record, document, and share your hiking adventures with detailed hike information, observations, photos, and insights.

## Features

- **Hike Management**: Create, edit, and view detailed hiking records
- **Observations**: Add observations with photos and comments during hikes
- **Image Support**: Capture photos directly or select from gallery
- **SQLite Database**: Local persistent storage of all hikes and observations
- **Cross-Platform**: Works on Android, iOS, and Web (via Expo)

## Project Structure

```
src/
├── screens/           # Main application screens
│   ├── HomeScreen.tsx
│   ├── HikeDetailScreen.tsx
│   └── AddHikeScreen.tsx
├── components/        # Reusable UI components
│   ├── ObservationDialog.tsx
│   ├── ObservationList.tsx
│   └── SearchFilterDialog.tsx
├── services/          # Business logic and external services
│   ├── database.ts    # SQLite database operations
│   └── imageService.ts # Image handling and storage
├── store/             # State management
│   └── HikeContext.tsx # Global app state
├── navigation/        # Navigation setup
│   └── AppNavigator.tsx
├── utils/             # Utility functions
│   ├── colors.ts
│   ├── formatters.ts
│   └── validation.ts
└── types/             # TypeScript type definitions
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your device/emulator:
   - **Android**: Press `a` in the terminal or scan the QR code with Android device
   - **iOS**: Press `i` in the terminal or scan the QR code with iOS device
   - **Web**: Press `w` in the terminal

## Key Technologies

- **Framework**: React Native with Expo
- **Database**: SQLite (expo-sqlite)
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Image Handling**: expo-image-picker with local file system storage

## Database Schema

### Hikes Table
- `id`: Primary key
- `name`: Hike name
- `location`: Hiking location
- `date`: Date of hike
- `time`: Time of hike
- `length`: Distance in kilometers
- `difficulty`: Difficulty level (Easy, Moderate, Hard)
- `parkingAvailable`: Boolean flag
- `description`: Optional notes
- `latitude`/`longitude`: GPS coordinates
- `privacy`: Visibility setting (Public/Private)

### Observations Table
- `id`: Primary key
- `hikeId`: Foreign key to hikes
- `title`: Observation title
- `time`: Time observation was recorded
- `comments`: Optional detailed comments
- `imageUri`: Local file path to saved image
- `status`: Status (Open/Resolved/etc)
- `latitude`/`longitude`: GPS coordinates
- `confirmations`/`disputes`: Community feedback

## Common Tasks

### Adding a New Hike
1. Press the "+" button on HomeScreen
2. Fill in hike details (name, location, date, difficulty, etc)
3. Save to add to your hike list

### Recording Observations
1. Open a hike from the list
2. Tap "Add Observation"
3. Enter observation details
4. Take a photo or pick from gallery
5. Save observation

### Editing Hikes/Observations
1. Find the hike or observation in the list
2. Tap the edit button (pencil icon)
3. Modify details
4. Save changes

## Troubleshooting

**Images not displaying?**
- Ensure file permissions are granted for camera/gallery access
- Check that image files exist in the cache directory

**Database errors?**
- The database is initialized automatically on app start
- Check console logs for specific error messages
- Clear app data and reinstall if corruption is suspected

**App not starting?**
- Clear Expo cache: `expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Development Notes

- The app uses Expo Router for file-based routing
- State is managed through React Context for global hike/observation data
- Images are stored in app cache directory with file:// URIs
- Database operations are async and should be properly awaited

## Future Enhancements

- Cloud synchronization for hikes
- Social sharing features
- GPS tracking during hikes
- Weather data integration
- Advanced filtering and search

## License

This project is part of the COMP1786 coursework at the University.

## Support

For issues or questions, check the project logs or review the inline code comments throughout the codebase.
