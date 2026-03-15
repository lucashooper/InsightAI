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
      
      if (customerInfo.entitlements.active['InsightAI Pro'] || customerInfo.entitlements.active['pro'] || Object.keys(customerInfo.entitlements.active).length > 0) {
        tier = 'pro';
        console.log('[SUBSCRIPTION SYNC] ✨ Pro entitlement detected');
      }
      
      console.log('[SUBSCRIPTION SYNC] 📤 Updating Supabase with tier:', tier);
      
      // Update Supabase user_profiles table with timeout to prevent hanging
      const updatePromise = supabase
        .from('user_profiles')
        .update({ subscription_tier: tier })
        .eq('user_id', userId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Subscription sync timeout after 5s')), 5000)
      );
      
      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;
      
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
    // Get initial session - autoRefreshToken handles token refresh automatically
    console.log('[AUTH] Getting initial session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AUTH] getSession result:', !!session, error?.message || 'no error');
      if (error) {
        if (!error.message.includes('Refresh Token')) {
          console.error('Session error:', error);
        }
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session) {
        console.log('[AUTH] Session found for user:', session.user.id);
        setSession(session);
        setUser(session.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    }).catch((err) => {
      if (!err.message?.includes('Refresh Token')) {
        console.error('Failed to get session:', err);
      }
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Set up RevenueCat listener for subscription changes (non-blocking)
    const revenueCatListener = Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('[REVENUECAT LISTENER] Subscription status changed');
      if (user?.id) {
        syncSubscriptionToSupabase(user.id, customerInfo).catch(err =>
          console.log('[REVENUECAT] Subscription sync error (non-blocking):', err)
        );
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AUTH] onAuthStateChange:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // CRITICAL: Do NOT await Supabase queries inside onAuthStateChange
      // Awaiting here blocks the auth listener and deadlocks all subsequent queries
      if (session?.user) {
        // Fire-and-forget: RevenueCat + subscription sync + profile preload
        (async () => {
          try {
            await Purchases.logIn(session.user.id);
            await Purchases.setEmail(session.user.email || '');
            const customerInfo = await Purchases.getCustomerInfo();
            // Non-blocking subscription sync
            syncSubscriptionToSupabase(session.user.id, customerInfo).catch(err => 
              console.log('[AUTH] Subscription sync error (non-blocking):', err)
            );
            
            // Preload profile picture to prevent loading animation
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('profile_picture_url, username')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (profile?.profile_picture_url) {
              await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', profile.profile_picture_url);
            }
            if (profile?.username) {
              await AsyncStorage.setItem('CACHED_USERNAME', profile.username);
            }
          } catch (error) {
            console.log('RevenueCat user identification error:', error);
          }
        })();
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

      // Check if user has a profile, create one if missing
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!profile) {
          console.log('[Auth] No profile found, creating one for existing user');
          const username = data.user.email?.split('@')[0] || 'User';
          await supabase.from('user_profiles').insert({
            user_id: data.user.id,
            username: username,
            onboarding_completed_at: new Date().toISOString(),
            subscription_tier: 'free',
          });
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
          console.log('[Auth] Profile created for existing user');
        }
      } catch (profileError) {
        console.error('[Auth] Failed to check/create profile:', profileError);
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
      console.log('[AUTH] Starting Google sign-in flow...');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('[AUTH] Google SDK sign-in completed, got user info');
      
      // v12+ moved idToken to userInfo.data.idToken
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (idToken) {
        // Do NOT pass a nonce for Google Sign-In.
        // The native Google SDK auto-generates and hashes a nonce internally.
        // We cannot access the raw (unhashed) nonce, and Supabase expects the raw one.
        // Omitting the nonce lets Supabase skip nonce verification entirely.
        console.log('[AUTH] Signing in with Google ID token (no nonce - native SDK flow)');
        
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          });
          
          console.log('[AUTH] Supabase signInWithIdToken result:', {
            hasError: !!error,
            hasData: !!data,
            hasUser: !!data?.user,
            userEmail: data?.user?.email,
          });
          
          if (error) {
            console.error('[AUTH] Supabase signInWithIdToken error:', error.message);
            console.error('[AUTH] Full error:', error);
            return { error };
          }
          
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
              // Clear any old cached username first to prevent stale data
              await AsyncStorage.removeItem('CACHED_USERNAME');
              await AsyncStorage.removeItem('SKIP_NAME_STEP');
              
              // Always update username from Google on sign-in to prevent using stale cached names
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: data.user.id,
                  username: displayName,
                  email: data.user.email,
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'user_id',
                  ignoreDuplicates: false
                });
              
              if (profileError) {
                console.error('[AUTH] Failed to save Google profile:', profileError);
              } else {
                console.log('[AUTH] ✅ Google profile saved');
              }
              
              // Cache the NEW username and set flag for Google Sign-In
              await AsyncStorage.setItem('CACHED_USERNAME', displayName);
              await AsyncStorage.setItem('SKIP_NAME_STEP', 'true');
              console.log('[AUTH] ✅ Username cached for Google Sign-In:', displayName);
              
              // IMPORTANT: Do NOT set HAS_COMPLETED_ONBOARDING here
              // Google users still need to see paywall and onboarding questions
              // The username being saved will allow them to skip the name input screen
            } catch (err) {
              console.error('[AUTH] Error saving Google profile:', err);
            }
          }
          
          return { error: null };
        } catch (supabaseError: any) {
          console.error('[AUTH] Exception during Supabase sign-in:', supabaseError);
          return { error: supabaseError };
        }
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

      console.log('[AUTH] Apple credential received:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        givenName: credential.fullName?.givenName,
        familyName: credential.fullName?.familyName,
      });

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
        nonce,
      });

      console.log('[AUTH] Supabase sign-in result:', {
        success: !error,
        userId: data?.user?.id,
        email: data?.user?.email,
      });

      if (!error && data?.user) {
        // APPLE COMPLIANCE: Skip email/name input screens for Apple Sign-In
        // Apple provides name/email via Authentication Services framework
        // We must NOT ask users for this information again
        
        // Extract name from Apple credential (only provided on first sign-in)
        const fullName = credential.fullName;
        let displayName = '';
        let shouldSkipNameStep = false;
        
        console.log('[AUTH] Processing Apple name data:', {
          givenName: fullName?.givenName,
          familyName: fullName?.familyName,
          nickname: fullName?.nickname,
          middleName: fullName?.middleName,
        });
        
        if (fullName?.givenName && fullName?.familyName) {
          displayName = `${fullName.givenName} ${fullName.familyName}`;
          shouldSkipNameStep = true;
          console.log('[AUTH] Apple provided full name:', displayName);
        } else if (fullName?.givenName) {
          displayName = fullName.givenName;
          shouldSkipNameStep = true;
          console.log('[AUTH] Apple provided first name:', displayName);
        } else {
          // Apple didn't provide name (repeat sign-in or Hide My Email)
          // Do NOT skip name step - let user enter their name manually
          console.log('[AUTH] Apple did not provide name - user will be prompted for name in onboarding');
          console.log('[AUTH] This is expected for repeat sign-ins - Apple only provides name on first sign-in');
        }

        // Only save username and skip name step if Apple provided a name
        if (shouldSkipNameStep && displayName) {
          console.log('[AUTH] Apple Sign-In - saving username:', displayName);
          try {
            // Always update username from Apple on sign-in to prevent using stale cached names
            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert({
                user_id: data.user.id,
                username: displayName,
                email: data.user.email,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
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
    try {
      await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
      await AsyncStorage.removeItem('ONBOARDING_RESUME_SCREEN');
      await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
      // Clear old non-user-specific cache keys to prevent cross-user contamination
      await AsyncStorage.removeItem('CACHED_PROFILE_PICTURE');
      await AsyncStorage.removeItem('CACHED_USERNAME');
      console.log('[Auth] Onboarding flags and cache cleared');
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
