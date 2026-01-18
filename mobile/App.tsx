import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';

const REVENUECAT_IOS_API_KEY = 'test_wuTAwQKYtsAjXmbyqtuVVRCMWGF';

export default function App() {
  useEffect(() => {
    Purchases.configure({
      apiKey: REVENUECAT_IOS_API_KEY,
    });
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
