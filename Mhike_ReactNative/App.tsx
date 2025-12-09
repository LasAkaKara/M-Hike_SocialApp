/**
 * M-Hike Social App
 * Main application entry point
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { HikeProvider } from './src/store/HikeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HikeProvider>
        <AppNavigator />
      </HikeProvider>
    </GestureHandlerRootView>
  );
}
