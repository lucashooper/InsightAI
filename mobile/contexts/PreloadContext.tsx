import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptionService } from '../services/encryptionService';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
}

interface PreloadedData {
  notes: any[] | null;
  userProfile: UserProfile | null;
  profilePicture: string | null;
  userName: string | null;
  isLoaded: boolean;
}

interface PreloadContextType {
  data: PreloadedData;
  preloadForUser: (userId: string, email: string) => Promise<void>;
  refreshNotes: (userId: string) => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined);

export const PreloadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PreloadedData>({
    notes: null,
    userProfile: null,
    profilePicture: null,
    userName: null,
    isLoaded: false,
  });

  const preloadForUser = async (userId: string, email: string) => {
    console.log('[PRELOAD] Starting full data preload for user:', userId);
    try {
      // Fetch notes and profile in parallel
      const [notesResult, profileResult] = await Promise.all([
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      let notes = notesResult.data || [];
      if (notesResult.error) {
        console.error('[PRELOAD] Notes error:', notesResult.error);
        notes = [];
      }

      // Decrypt notes if needed
      const encryptionKey = await EncryptionService.getKey();
      const processedNotes = await Promise.all(notes.map(async (entry: any) => {
        // Only attempt decryption if we have an encryption key
        if (encryptionKey && (entry.is_encrypted || (entry.content?.includes(':') && entry.content.length > 32)) && entry.content) {
          try {
            const decrypted = await EncryptionService.decrypt(entry.content, encryptionKey);
            return { ...entry, content: decrypted };
          } catch (e) {
            // Decryption failed, return as-is (likely plain text)
            return entry;
          }
        }
        // No encryption key or not encrypted - return as-is
        return entry;
      }));

      const profile = profileResult.data;
      const userProfile: UserProfile = {
        id: profile?.id || '',
        username: profile?.username || '',
        email: email,
        profile_picture_url: profile?.profile_picture_url || null,
      };

      // Cache profile picture and username in AsyncStorage for tab bar etc
      if (userProfile.profile_picture_url) {
        await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', userProfile.profile_picture_url).catch(() => {});
      }
      if (userProfile.username) {
        await AsyncStorage.setItem('CACHED_USERNAME', userProfile.username).catch(() => {});
      }

      console.log('[PRELOAD] ✅ Preloaded', processedNotes.length, 'notes, profile:', userProfile.username);

      setData({
        notes: processedNotes,
        userProfile,
        profilePicture: userProfile.profile_picture_url,
        userName: userProfile.username,
        isLoaded: true,
      });
    } catch (error) {
      console.error('[PRELOAD] Error:', error);
      // Still mark as loaded so app doesn't hang
      setData(prev => ({ ...prev, isLoaded: true }));
    }
  };

  const refreshNotes = async (userId: string) => {
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const encryptionKey = await EncryptionService.getKey();
      const processedNotes = await Promise.all((notes || []).map(async (entry: any) => {
        // Only attempt decryption if we have an encryption key
        if (encryptionKey && (entry.is_encrypted || (entry.content?.includes(':') && entry.content.length > 32)) && entry.content) {
          try {
            const decrypted = await EncryptionService.decrypt(entry.content, encryptionKey);
            return { ...entry, content: decrypted };
          } catch (e) {
            return entry;
          }
        }
        return entry;
      }));

      setData(prev => ({ ...prev, notes: processedNotes }));
    } catch (error) {
      console.error('[PRELOAD] Refresh notes error:', error);
    }
  };

  const refreshProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (profile) {
        const userProfile: UserProfile = {
          id: profile.id || '',
          username: profile.username || '',
          email: data.userProfile?.email || '',
          profile_picture_url: profile.profile_picture_url || null,
        };
        if (userProfile.profile_picture_url) {
          await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', userProfile.profile_picture_url).catch(() => {});
        }
        if (userProfile.username) {
          await AsyncStorage.setItem('CACHED_USERNAME', userProfile.username).catch(() => {});
        }
        setData(prev => ({
          ...prev,
          userProfile,
          profilePicture: userProfile.profile_picture_url,
          userName: userProfile.username,
        }));
      }
    } catch (error) {
      console.error('[PRELOAD] Refresh profile error:', error);
    }
  };

  return (
    <PreloadContext.Provider value={{ data, preloadForUser, refreshNotes, refreshProfile }}>
      {children}
    </PreloadContext.Provider>
  );
};

export const usePreloadedData = () => {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreloadedData must be used within PreloadProvider');
  }
  return context;
};
