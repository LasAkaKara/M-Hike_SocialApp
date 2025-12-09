/**
 * App Navigation Setup
 */

import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AddHikeScreen } from '../screens/AddHikeScreen';
import { HikeDetailScreen } from '../screens/HikeDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ensureDatabaseInitialized } from '../store/HikeContext';
import { Colors } from '../utils/colors';

export type RootStackParamList = {
  Home: undefined;
  HikeDetail: { hikeId: number };
  AddHike: { hikeId?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await ensureDatabaseInitialized();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true); // Still show app even if initialization fails
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.surface,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'M-Hike',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="HikeDetail"
            component={HikeDetailScreen}
            options={{
              title: 'Hike Details',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="AddHike"
            component={AddHikeScreen}
            options={({ route }) => ({
              title: route.params?.hikeId ? 'Edit Hike' : 'Create Hike',
              headerShown: true,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};
