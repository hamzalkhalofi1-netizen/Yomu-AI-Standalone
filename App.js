import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MangaProvider } from './src/context/MangaContext';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DetailScreen from './src/screens/DetailScreen';
import AddMangaScreen from './src/screens/AddMangaScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Accueil:      ['🏠', '🏡'],
  Recherche:    ['🔍', '🔎'],
  'Bibliothèque': ['📚', '📖'],
  Profil:       ['👤', '🙂'],
};

function TabIcon({ routeName, focused, color }) {
  const [active, inactive] = TAB_ICONS[routeName] || ['●', '○'];
  return <Text style={{ fontSize: 20, color }}>{focused ? active : inactive}</Text>;
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#1e2a4a',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#4a4a6a',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => (
          <TabIcon routeName={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Recherche" component={SearchScreen} />
      <Tab.Screen name="Bibliothèque" component={LibraryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MangaProvider>
        <StatusBar style="light" backgroundColor="#0f0f1a" />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="AddManga"
              component={AddMangaScreen}
              options={{ presentation: 'card' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </MangaProvider>
    </SafeAreaProvider>
  );
}
