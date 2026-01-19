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
import DashboardScreenNew from '../screens/DashboardScreenNew';
import DashboardScreen from '../screens/DashboardScreen';
import PlaybookScreen from '../screens/PlaybookScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import OnboardingQuestionScreen from '../screens/onboarding/OnboardingQuestionScreen';
import OnboardingSummaryScreen from '../screens/onboarding/OnboardingSummaryScreen';
import AnalyzingScreen from '../screens/onboarding/AnalyzingScreen';
import AnalysisCompleteScreen from '../screens/onboarding/AnalysisCompleteScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      initialRouteName="Dashboard"
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
        name="Dashboard"
        component={DashboardScreenNew}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notes"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" size={24} color={color} />
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
  const [isOnboardingCompleted, setIsOnboardingCompleted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
        setIsOnboardingCompleted(value === 'true');
      } catch (e) {
        setIsOnboardingCompleted(false);
      }
    };
    checkOnboarding();
  }, []);

  if (loading || (user && isOnboardingCompleted === null)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const darkTheme = {
    dark: true,
    colors: {
      primary: '#8b5cf6',
      background: '#000000',
      card: '#0a0a0a',
      text: '#ffffff',
      border: '#1a1a1a',
      notification: '#8b5cf6',
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as const,
      },
    },
  };

  return (
    <NavigationContainer theme={darkTheme}>
      {user ? (
        // Authenticated screens
        <Stack.Navigator
          initialRouteName={isOnboardingCompleted ? 'MainTabs' : 'Welcome'}
          screenOptions={{ headerShown: false }}
        >
          {/* Onboarding Flow */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />

          {/* Main App Flow */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
          <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
          <Stack.Screen name="Analytics" component={DashboardScreen} />
        </Stack.Navigator>
      ) : (
        // Auth screens
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
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
