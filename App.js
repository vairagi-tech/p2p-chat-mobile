/**
 * P2P Chat Mobile App
 * Decentralized messaging for React Native
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SetupScreen from './src/screens/SetupScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Setup"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen}
          options={{
            title: 'P2P Chat Setup',
          }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{
            title: 'P2P Chat',
            gestureEnabled: false, // Prevent swipe back from chat
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
