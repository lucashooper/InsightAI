import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (credential: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Enhanced logging for debugging email confirmation bug
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] === AUTH STATE CHANGE ===`);
      console.log('Event:', event);
      
      if (session) {
        console.table({
          'User ID': session.user.id,
          'Email': session.user.email,
          'Email Confirmed': session.user.email_confirmed_at ? 'Yes' : 'No',
          'Created At': session.user.created_at,
          'Username': session.user.user_metadata?.username || 'N/A'
        });
        
        // Store current user ID to detect account switches
        const storedUserId = localStorage.getItem('insight_ai_current_user');
        if (storedUserId && storedUserId !== session.user.id) {
          // User switched accounts - clear all localStorage data
          console.log('🔄 User switched accounts - clearing old data');
          const keysToKeep = ['insight_ai_current_user'];
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (key.startsWith('insight_ai_') && !keysToKeep.includes(key)) {
              localStorage.removeItem(key);
            }
          });
        }
        localStorage.setItem('insight_ai_current_user', session.user.id);
      } else {
        console.log('Session: null (user signed out)');
        // Clear current user on sign out
        localStorage.removeItem('insight_ai_current_user');
      }
      console.log('============================');
      
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { error };
    }

    // Check if user already exists (Supabase returns user object even if email is taken)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      console.warn('Email already registered:', email);
      return {
        error: {
          message: 'This email is already registered. Please sign in instead or use a different email.'
        } as any
      };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.log('✅ Email confirmation required for:', email);
      // Email confirmation required - user will receive an email
      // Return success (not error) so the UI can show the confirmation screen
      return { 
        error: null,
        data: data
      };
    }

    // If user is authenticated (no email confirmation), create profile
    if (data.user && data.session) {
      try {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          username,
          email: data.user.email || email,
          profile_picture_url: '/Ocean-Swirl.webp',
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't fail the signup if profile creation fails
          // It will be created on first login
        }
      } catch (profileErr) {
        console.error('Exception creating profile:', profileErr);
      }
    }

    return { error: null, data };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    // Check if input is an email or username
    const isEmail = emailOrUsername.includes('@');
    
    if (isEmail) {
      // Direct email login
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      return { error };
    } else {
      // Username login - first lookup the email from user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('username', emailOrUsername)
        .single();
      
      if (profileError || !profile) {
        return { 
          error: { 
            message: 'Username not found. Please check your username or use your email address.' 
          } as any 
        };
      }
      
      // Now sign in with the retrieved email
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      return { error };
    }
  };

  const signInWithGoogle = async (credential: string) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) {
        return { error };
      }

      // DON'T auto-create profile here - let AuthGate handle onboarding flow
      // This ensures new users see username creation and membership screens

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    // Clear all app data from localStorage before signing out
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('insight_ai_')) {
        localStorage.removeItem(key);
      }
    });
    
    await supabase.auth.signOut();
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      console.log('Attempting to delete account for user:', user.id);

      // Call the Supabase RPC function to delete everything
      const { data, error: rpcError } = await supabase.rpc('delete_user');

      console.log('Delete user RPC response:', data);

      if (rpcError) {
        console.error('Error calling delete_user RPC:', rpcError);
        return { 
          error: { 
            message: 'Failed to delete account. Make sure the delete_user function is set up in Supabase. See supabase_delete_user_function.sql' 
          } 
        };
      }

      // Check if deletion was successful
      if (data && !data.success) {
        console.error('Delete failed:', data.error);
        return { error: { message: data.error || 'Failed to delete account' } };
      }

      console.log('Account deleted successfully, clearing localStorage');

      // Clear all localStorage
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('insight_ai_')) {
          localStorage.removeItem(key);
        }
      });

      // Sign out
      await supabase.auth.signOut();

      return { error: null };
    } catch (err) {
      console.error('Delete account error:', err);
      return { error: { message: 'An unexpected error occurred while deleting your account' } };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
