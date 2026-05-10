import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NoteFormScreen from '../screens/NoteFormScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import { Colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.yellow,
          headerTitleStyle: {
            color: Colors.textPrimary,
            fontSize: 17,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Retour',
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NoteForm"
          component={NoteFormScreen}
          options={({ route }) => ({
            title: route.params?.note ? 'Modifier' : 'Nouvelle note',
            headerTitleStyle: {
              color: Colors.textPrimary,
              fontSize: 17,
              fontWeight: '600',
            },
          })}
        />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{ title: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}