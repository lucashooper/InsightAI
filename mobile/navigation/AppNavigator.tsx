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
import SignupUsernameScreen from '../screens/signup/SignupUsernameScreen';
import SignupEmailScreen from '../screens/signup/SignupEmailScreen';
import SignupPasswordScreen from '../screens/signup/SignupPasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import EmailVerifiedScreen from '../screens/EmailVerifiedScreen';
import HomeScreen from '../screens/HomeScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import CreateEntryScreen from '../screens/CreateEntryScreen';
import DashboardScreenNew from '../screens/DashboardScreenNew';
import DashboardScreen from '../screens/DashboardScreen';
import PlaybookScreen from '../screens/PlaybookScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ProductRevealScreen from '../screens/onboarding/ProductRevealScreen';
import AuthSelectionScreen from '../screens/onboarding/AuthSelectionScreen';
import OnboardingQuestionScreen from '../screens/onboarding/OnboardingQuestionScreen';
import NotificationPermissionScreen from '../screens/onboarding/NotificationPermissionScreen';
import OnboardingSummaryScreen from '../screens/onboarding/OnboardingSummaryScreen';
import AnalyzingScreen from '../screens/onboarding/AnalyzingScreen';
import AnalysisCompleteScreen from '../screens/onboarding/AnalysisCompleteScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import MeditationScreen from '../screens/MeditationScreen';
import GratitudeScreen from '../screens/GratitudeScreen';
import GratitudeHistoryScreen from '../screens/GratitudeHistoryScreen';
import EmotionDetailScreen from '../screens/EmotionDetailScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Center FAB Button Component
function CenterFabButton() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.centerFabButton}
      onPress={() => {
        console.log('[TabBar] + (FAB) pressed -> navigate to CreateEntry');
        navigation.navigate('CreateEntry');
      }}
      activeOpacity={0.85}
      accessibilityLabel="Create new journal entry"
      accessibilityRole="button"
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
      initialRouteName="Home"
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
      {/* Tab 1: Home (Dashboard) */}
      <Tab.Screen
        name="Home"
        component={DashboardScreenNew}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          tabBarAccessibilityLabel: "Home",
        }}
        listeners={{
          tabPress: () => {
            console.log('[TabBar] Home tab pressed');
          },
        }}
      />
      {/* Tab 2: Journal (Notes) */}
      <Tab.Screen
        name="Journal"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" size={24} color={color} />
          ),
          tabBarAccessibilityLabel: "Journal",
        }}
        listeners={{
          tabPress: () => {
            console.log('[TabBar] Journal tab pressed');
          },
        }}
      />
      {/* Tab 3: Center FAB (+) */}
      <Tab.Screen
        name="CreateEntryPlaceholder"
        component={View}
        options={{
          tabBarButton: () => <CenterFabButton />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            console.log('[TabBar] + (FAB) tab pressed -> navigate to CreateEntry');
            navigation.navigate('CreateEntry');
          },
        })}
      />
      {/* Tab 4: Dashboard (Playbook) */}
      <Tab.Screen
        name="Dashboard"
        component={PlaybookScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
          tabBarAccessibilityLabel: "Dashboard",
        }}
        listeners={{
          tabPress: () => {
            console.log('[TabBar] Dashboard tab pressed');
          },
        }}
      />
      {/* Tab 5: Settings */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
          tabBarAccessibilityLabel: "Settings",
        }}
        listeners={{
          tabPress: () => {
            console.log('[NAV] Tab -> Settings');
          },
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
        // First check AsyncStorage
        const value = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
        console.log('[NAV] HAS_COMPLETED_ONBOARDING from storage:', value);
        
        if (value === 'true') {
          setIsOnboardingCompleted(true);
          return;
        }

        // If user is logged in but no AsyncStorage flag, check if they have profile data
        // This handles existing users logging in on a new device or after reinstall
        if (user) {
          const { supabase } = await import('../lib/supabase');
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('username, created_at')
            .eq('user_id', user.id)
            .single();

          console.log('[NAV] Profile check result:', profile);
          console.log('[NAV] Profile error:', profileError);

          // If profile exists and has a username, they're an existing user
          if (profile && profile.username) {
            console.log('[NAV] Existing user detected, skipping onboarding');
            await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
            setIsOnboardingCompleted(true);
          } else {
            console.log('[NAV] New user detected, will show onboarding');
            // Clear intro overlay flag for new users
            console.log('[NAV] Clearing HAS_SEEN_DASHBOARD_INTRO flag');
            await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
            await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
            setIsOnboardingCompleted(false);
          }
        } else {
          setIsOnboardingCompleted(false);
        }
      } catch (e) {
        console.error('[NAV] Error checking onboarding:', e);
        setIsOnboardingCompleted(false);
      }
    };
    checkOnboarding();
  }, [user]);

  // Check if user has completed onboarding when they log in
  React.useEffect(() => {
    console.log('[NAV] Auth state - user:', !!user, 'onboarding completed:', isOnboardingCompleted);
  }, [user, isOnboardingCompleted]);

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
          key={`auth-${isOnboardingCompleted}`}
          initialRouteName={isOnboardingCompleted ? 'MainTabs' : 'Welcome'}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: true,
            animationDuration: 650,
          }}
        >
          {/* Onboarding Flow */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ProductReveal" component={ProductRevealScreen} />
          <Stack.Screen name="AuthSelection" component={AuthSelectionScreen} />
          <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />
          <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
          <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />

          {/* Main App Flow */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
          <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
          <Stack.Screen name="Analytics" component={DashboardScreen} />
          <Stack.Screen name="Meditation" component={MeditationScreen} />
          <Stack.Screen name="Gratitude" component={GratitudeScreen} />
          <Stack.Screen name="GratitudeHistory" component={GratitudeHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmotionDetail" component={EmotionDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      ) : (
        // Unauthenticated - show Welcome first, then Login/Signup
        <Stack.Navigator 
          initialRouteName={isOnboardingCompleted ? 'Login' : 'Welcome'}
          screenOptions={{ headerShown: false }}
        >
          {/* Onboarding Flow for new users */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ProductReveal" component={ProductRevealScreen} />
          <Stack.Screen name="AuthSelection" component={AuthSelectionScreen} />
          <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />
          <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
          <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          
          {/* Auth screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SignupUsername" component={SignupUsernameScreen} />
          <Stack.Screen name="SignupEmail" component={SignupEmailScreen} />
          <Stack.Screen name="SignupPassword" component={SignupPasswordScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen as any} />
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
