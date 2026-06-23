import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { startTimeoutChecker } from './services/timeoutChecker';

export default function App() {
  // Start the global timeout checker when the app mounts
  useEffect(() => {
    const stopChecker = startTimeoutChecker();
    return stopChecker; // cleanup on unmount
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
