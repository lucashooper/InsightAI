import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Purchases from 'react-native-purchases';
import { EncryptionService } from '../services/encryptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Conditionally import Google Sign-In to avoid Expo Go errors
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.log('[AUTH] Google Sign-In module not available (Expo Go)');
}

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

  // Configure Google Sign-In
  useEffect(() => {
    if (GoogleSignin) {
      try {
        const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
        const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        
        console.log('[AUTH] Configuring Google Sign-In with:', { iosClientId: iosClientId ? 'present' : 'missing', webClientId: webClientId ? 'present' : 'missing' });
        
        GoogleSignin.configure({
          iosClientId,
          webClientId,
          scopes: ['openid', 'profile', 'email'],
        });
        console.log('[AUTH] Google Sign-In configured successfully');
      } catch (error) {
        console.log('[AUTH] Google Sign-In configuration error:', error);
      }
    }
  }, []);

  // Helper function to sync subscription status to Supabase
  const syncSubscriptionToSupabase = async (userId: string, customerInfo: any) => {
    try {
      // Determine subscription tier based on active entitlements
      let tier = 'free';
      
      console.log('[SUBSCRIPTION SYNC] 🔍 Checking entitlements:', customerInfo.entitlements.active);
      
      if (customerInfo.entitlements.active['pro']) {
        tier = 'pro';
        console.log('[SUBSCRIPTION SYNC] ✨ Pro entitlement detected');
      }
      
      console.log('[SUBSCRIPTION SYNC] 📤 Updating Supabase with tier:', tier);
      
      // Update Supabase user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_tier: tier })
        .eq('user_id', userId);
      
      if (error) {
        console.error('[SUBSCRIPTION SYNC] ❌ Failed to update Supabase:', error);
      } else {
        console.log('[SUBSCRIPTION SYNC] ✅ Successfully synced to Supabase - tier:', tier);
      }
    } catch (error) {
      console.error('[SUBSCRIPTION SYNC] ❌ Error:', error);
    }
  };

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

    // Set up RevenueCat listener for subscription changes
    const revenueCatListener = Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      console.log('[REVENUECAT LISTENER] Subscription status changed');
      if (user?.id) {
        await syncSubscriptionToSupabase(user.id, customerInfo);
      }
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
          
          // Sync initial subscription status to Supabase
          const customerInfo = await Purchases.getCustomerInfo();
          await syncSubscriptionToSupabase(session.user.id, customerInfo);
        } catch (error) {
          console.log('RevenueCat user identification error:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Initialize encryption key on successful login
    if (!error && data.user) {
      try {
        await EncryptionService.initializeKey(password, data.user.id);
        console.log('[Auth] Encryption key initialized on login');
      } catch (encError) {
        console.error('[Auth] Failed to initialize encryption key:', encError);
      }
    }
    
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

    // Initialize encryption key on successful signup
    if (data.user) {
      try {
        await EncryptionService.initializeKey(password, data.user.id);
        console.log('[Auth] Encryption key initialized on signup');
      } catch (encError) {
        console.error('[Auth] Failed to initialize encryption key:', encError);
      }

      // Clear onboarding flags for new account (prevents skip on re-signup)
      // BUT preserve them if user is in post-purchase flow (already completed onboarding)
      try {
        const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
        if (needsEmailSignup === 'true') {
          // Post-purchase flow: user already completed onboarding, preserve the flag
          // so EmailVerified navigates to MainTabs instead of OnboardingQuestion
          console.log('[Auth] Post-purchase signup - preserving onboarding flags');
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
        } else {
          await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
          await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
          console.log('[Auth] Cleared onboarding flags for new account');
        }
      } catch (storageError) {
        console.error('[Auth] Failed to handle onboarding flags:', storageError);
      }
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
    if (!GoogleSignin) {
      return { error: new Error('Google Sign-In not available in Expo Go. Please use a development build.') };
    }
    
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // v12+ moved idToken to userInfo.data.idToken
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (idToken) {
        // Do NOT pass a nonce for Google Sign-In.
        // The native Google SDK auto-generates and hashes a nonce internally.
        // We cannot access the raw (unhashed) nonce, and Supabase expects the raw one.
        // Omitting the nonce lets Supabase skip nonce verification entirely.
        console.log('[AUTH] Signing in with Google ID token (no nonce - native SDK flow)');
        
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        
        if (error) {
          console.error('[AUTH] Supabase signInWithIdToken error:', error.message);
        } else {
          console.log('[AUTH] Google Sign-In successful, user:', data.user?.email);
          
          // Handle Google Sign-In profile setup (similar to Apple)
          if (data?.user) {
            const googleName = userInfo.data?.user?.name || userInfo.user?.name || '';
            const email = data.user.email || '';
            
            // Generate username from Google name or email
            let displayName = googleName;
            if (!displayName && email) {
              displayName = email.split('@')[0].replace(/[._]/g, ' ');
              displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            } else if (!displayName) {
              displayName = 'Insight User';
            }
            
            console.log('[AUTH] Google Sign-In - saving username:', displayName);
            try {
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: data.user.id,
                  username: displayName,
                  email: data.user.email,
                  updated_at: new Date().toISOString(),
                });
              
              if (profileError) {
                console.error('[AUTH] Failed to save Google profile:', profileError);
              } else {
                console.log('[AUTH] ✅ Google profile saved');
              }
              
              // Cache the username and set flag for Google Sign-In
              await AsyncStorage.setItem('CACHED_USERNAME', displayName);
              await AsyncStorage.setItem('SKIP_NAME_STEP', 'true');
              console.log('[AUTH] ✅ Username cached for Google Sign-In');
              
              // IMPORTANT: Do NOT set HAS_COMPLETED_ONBOARDING here
              // Google users still need to see paywall and onboarding questions
              // The username being saved will allow them to skip the name input screen
            } catch (err) {
              console.error('[AUTH] Error saving Google profile:', err);
            }
          }
        }
        
        return { error };
      } else {
        console.error('[AUTH] Google Sign-In response:', JSON.stringify(userInfo));
        return { error: new Error('No ID token present') };
      }
    } catch (error: any) {
      console.error('[AUTH] Google Sign-In error:', error);
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
        nonce,
      });

      if (!error && data?.user) {
        // APPLE COMPLIANCE: Skip email/name input screens for Apple Sign-In
        // Apple provides name/email via Authentication Services framework
        // We must NOT ask users for this information again
        
        // Extract name from Apple credential (only provided on first sign-in)
        const fullName = credential.fullName;
        let displayName = '';
        
        if (fullName?.givenName && fullName?.familyName) {
          displayName = `${fullName.givenName} ${fullName.familyName}`;
        } else if (fullName?.givenName) {
          displayName = fullName.givenName;
        } else {
          // Apple didn't provide name (repeat sign-in)
          // Generate default username from email to comply with Apple guidelines
          const email = data.user.email || '';
          if (email) {
            // Use email prefix as username (e.g., "john.doe@example.com" -> "john.doe")
            displayName = email.split('@')[0].replace(/[._]/g, ' ');
            // Capitalize first letter
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          } else {
            // Fallback to generic name if no email
            displayName = 'Insight User';
          }
          console.log('[AUTH] Apple did not provide name, generated default:', displayName);
        }

        // Save username and cache it for Apple users
        console.log('[AUTH] Apple Sign-In - saving username:', displayName);
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: data.user.id,
              username: displayName,
              email: data.user.email,
              updated_at: new Date().toISOString(),
            });
          
          if (profileError) {
            console.error('[AUTH] Failed to save Apple profile:', profileError);
          } else {
            console.log('[AUTH] ✅ Apple profile saved');
          }
          
          // Cache the username and set flag for Apple Sign-In
          await AsyncStorage.setItem('CACHED_USERNAME', displayName);
          await AsyncStorage.setItem('SKIP_NAME_STEP', 'true');
          console.log('[AUTH] ✅ Username cached for Apple Sign-In');
          
          // IMPORTANT: Do NOT set HAS_COMPLETED_ONBOARDING here
          // Apple/Google users still need to see paywall and onboarding questions
          // The username being saved will allow them to skip the name input screen
        } catch (err) {
          console.error('[AUTH] Error saving Apple profile:', err);
        }
      }

      return { error };
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { error: null };
      }
      console.error('[AUTH] Apple Sign-In error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    // Clear encryption key from keychain on logout
    try {
      await EncryptionService.clearKey();
      console.log('[Auth] Encryption key cleared on logout');
    } catch (error) {
      console.error('[Auth] Failed to clear encryption key:', error);
    }
    
    // CRITICAL FIX: Invalidate RevenueCat cache and log out when user signs out
    // This ensures the next user sees their own subscription status, not cached data
    try {
      console.log('[Auth] Invalidating RevenueCat cache on sign out...');
      await Purchases.invalidateCustomerInfoCache();
      await Purchases.logOut();
      console.log('[Auth] RevenueCat cache cleared and logged out');
    } catch (error) {
      console.error('[Auth] Failed to clear RevenueCat cache:', error);
    }
    
    // Clear onboarding flow flags but NOT the intro overlay flag
    // HAS_SEEN_DASHBOARD_INTRO should persist so the welcome overlay only shows once
    try {
      await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
      await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
      console.log('[Auth] Cleared onboarding flags on sign out');
    } catch (error) {
      console.error('[Auth] Failed to clear onboarding flags:', error);
    }
    
    // Clear state immediately before calling Supabase signOut
    setUser(null);
    setSession(null);
    
    await supabase.auth.signOut();
    console.log('[Auth] User signed out successfully');
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
