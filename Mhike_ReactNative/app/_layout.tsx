import { AppNavigator } from '@/src/navigation/AppNavigator';
import { HikeProvider } from '@/src/store/HikeContext';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HikeProvider>
        <AppNavigator />
      </HikeProvider>
    </GestureHandlerRootView>
  );
}
