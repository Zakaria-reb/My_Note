import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen       from '../screens/HomeScreen';
import NoteFormScreen   from '../screens/NoteFormScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import LoginScreen      from '../screens/LoginScreen';
import RegisterScreen   from '../screens/RegisterScreen';
import { useAuth }      from '../context/AuthContext';
import { Colors }       from '../theme';

const Stack = createNativeStackNavigator();

const commonScreenOptions = {
  headerStyle:        { backgroundColor: Colors.background },
  headerTintColor:    Colors.yellow,
  headerTitleStyle:   { color: Colors.textPrimary, fontSize: 17, fontWeight: '600' },
  headerShadowVisible: false,
  headerBackTitle:    'Retour',
  contentStyle:       { backgroundColor: Colors.background },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...commonScreenOptions, headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen}    />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={commonScreenOptions}>
      <Stack.Screen name="Home"       component={HomeScreen}       options={{ headerShown: false }} />
      <Stack.Screen name="NoteForm"   component={NoteFormScreen}   options={({ route }) => ({ title: route.params?.note ? 'Modifier' : 'Nouvelle note' })} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

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