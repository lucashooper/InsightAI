import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Purchases from 'react-native-purchases';
// Temporarily disabled for Expo Go testing
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import * as AppleAuthentication from 'expo-apple-authentication';
// import * as Crypto from 'expo-crypto';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
   
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure Google Sign-In (disabled for Expo Go testing)
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  //     webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  //   });
  // }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Ignore refresh token errors - they're expected when no valid session exists
        if (!error.message.includes('Refresh Token')) {
          console.error('Session error:', error);
        }
        // Clear invalid session
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((err) => {
      // Ignore refresh token errors
      if (!err.message?.includes('Refresh Token')) {
        console.error('Failed to get session:', err);
      }
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Set RevenueCat user ID for analytics
      if (session?.user) {
        try {
          await Purchases.logIn(session.user.id);
          // Set user email for better analytics
          await Purchases.setEmail(session.user.email || '');
        } catch (error) {
          console.log('RevenueCat user identification error:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log('[AUTH] Starting signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      console.error('[AUTH] Signup error:', error);
      return { error };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.log('[AUTH] Signup successful - email confirmation required');
      console.log('[AUTH] User ID:', data.user.id);
      // This is SUCCESS - email confirmation is required
      // Don't return an error, return success
      return { error: null, requiresEmailConfirmation: true };
    }

    console.log('[AUTH] Signup successful - user logged in immediately');
    return { error: null, requiresEmailConfirmation: false };
  };

  const signInWithGoogle = async () => {
    // Disabled for Expo Go testing
    console.log('[AUTH] Google Sign-In not available in Expo Go');
    return { error: new Error('Google Sign-In requires a development build') };
  };

  const signInWithApple = async () => {
    // Disabled for Expo Go testing
    console.log('[AUTH] Apple Sign-In not available in Expo Go');
    return { error: new Error('Apple Sign-In requires a development build') };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
