import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import CreateEntryScreen from '../screens/CreateEntryScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PlaybookScreen from '../screens/PlaybookScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Center FAB Button Component
function CenterFabButton() {
  const navigation = useNavigation<any>();
  
  return (
    <TouchableOpacity
      style={styles.centerFabButton}
      onPress={() => navigation.navigate('CreateEntry')}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
        style={styles.centerFabGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Bottom Tab Navigator for main app screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Hide all labels
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Notes"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={24} color={color} />
          ),
        }}
      />
      {/* Center FAB Placeholder */}
      <Tab.Screen
        name="CreateEntryPlaceholder"
        component={View}
        options={{
          tabBarButton: () => <CenterFabButton />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateEntry');
          },
        })}
      />
      <Tab.Screen
        name="Playbook"
        component={PlaybookScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // Authenticated screens with bottom tabs
        <Stack.Navigator>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false as boolean }}
          />
          <Stack.Screen 
            name="EntryDetail" 
            component={EntryDetailScreen}
            options={{ headerShown: false as boolean }}
          />
          <Stack.Screen 
            name="CreateEntry" 
            component={CreateEntryScreen}
            options={{ headerShown: false as boolean }}
          />
        </Stack.Navigator>
      ) : (
        // Auth screens
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false as boolean }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{ headerShown: false as boolean }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  centerFabButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerFabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
});
