import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "react-native-vector-icons";

import HomeScreen from "../screens/HomeScreen";
import HikeDetailScreen from "../screens/HikeDetailScreen";
import AddHikeScreen from "../screens/AddHikeScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type RootStackParamList = {
  Home: undefined;
  HikeDetail: { hikeId: number };
  AddHike: { hikeId?: number };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "My Hikes" }}
      />
      <Stack.Screen
        name="HikeDetail"
        component={HikeDetailScreen}
        options={{ title: "Hike Details" }}
      />
      <Stack.Screen
        name="AddHike"
        component={AddHikeScreen}
        options={({ route }) => ({
          title: route.params?.hikeId ? "Edit Hike" : "Add Hike",
        })}
      />
    </Stack.Navigator>
  );
};

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = "";

            if (route.name === "HomeTab") {
              iconName = "home";
            } else if (route.name === "Settings") {
              iconName = "cog";
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#999999",
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{ title: "Hikes" }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
