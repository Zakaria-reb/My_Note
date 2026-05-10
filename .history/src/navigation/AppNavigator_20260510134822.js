import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
...
import HomeScreen from '../screens/HomeScreen';
import NoteFormScreen from '../screens/NoteFormScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import { Colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.yellow} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {currentUser ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}