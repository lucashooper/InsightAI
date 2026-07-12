import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { InteractionManager } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { decryptEntries, decryptEntriesInChunks } from '../utils/decryptBatch';
import { prewarmDashboardCache, clearDashboardCache } from '../utils/dashboardCache';
import { prewarmChatSuggestions, clearChatSuggestionsCache } from '../utils/chatSuggestionsCache';
import { yieldToUI } from '../utils/yieldToUI';

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
  subscriptionPlan: string;
  entriesCount: number;
  entriesLimit: number;
  isLoaded: boolean;
  isStartupReady: boolean;
}

interface PreloadContextType {
  data: PreloadedData;
  preloadForUser: (userId: string, email: string) => Promise<void>;
  refreshNotes: (userId: string) => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
  refreshAccountStats: (userId: string) => Promise<void>;
  resetData: () => void;
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined);

const EMPTY_PRELOADED_DATA: PreloadedData = {
  notes: null,
  userProfile: null,
  profilePicture: null,
  userName: null,
  subscriptionPlan: 'Free',
  entriesCount: 0,
  entriesLimit: 2,
  isLoaded: false,
  isStartupReady: false,
};

export const PreloadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PreloadedData>(EMPTY_PRELOADED_DATA);

  const loadAccountStats = useCallback(async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];

    const [customerInfo, usageResult] = await Promise.all([
      Purchases.getCustomerInfo(),
      supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', 'ai_analysis')
        .gte('created_at', today),
    ]);

    const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

    return {
      subscriptionPlan: hasAnyActiveEntitlement ? 'Insight Pro' : 'Free',
      entriesLimit: hasAnyActiveEntitlement ? 2 : 0,
      entriesCount: usageResult.error || usageResult.count === null ? 0 : usageResult.count,
    };
  }, []);

  const preloadForUser = useCallback(async (userId: string, email: string) => {
    console.log('[PRELOAD] Starting preload for user:', userId);

    const cachedUsername = await AsyncStorage.getItem('CACHED_USERNAME').catch(() => null);
    // Reveal splash / PIN as soon as cached identity is ready — don't block on network or decrypt.
    setData((prev) => ({
      ...prev,
      userName: cachedUsername || prev.userName,
      isStartupReady: true,
    }));

    try {
      const [notesResult, profileResult] = await Promise.all([
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(40),
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

      const profile = profileResult.data;
      const userProfile: UserProfile = {
        id: profile?.id || '',
        username: profile?.username || '',
        email,
        profile_picture_url: profile?.profile_picture_url || null,
      };

      const resolvedPfp =
        userProfile.profile_picture_url &&
        (userProfile.profile_picture_url.startsWith('http://') ||
          userProfile.profile_picture_url.startsWith('https://'))
          ? userProfile.profile_picture_url
          : null;
      if (resolvedPfp) {
        await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', resolvedPfp).catch(() => {});
        await AsyncStorage.setItem(`CACHED_PROFILE_PICTURE_${userId}`, resolvedPfp).catch(() => {});
      }
      if (userProfile.username) {
        await AsyncStorage.setItem('CACHED_USERNAME', userProfile.username).catch(() => {});
      }

      // Initial fetch complete — notes arrive encrypted; decrypt deferred so PIN stays responsive.
      setData((prev) => ({
        ...prev,
        notes,
        userProfile,
        profilePicture: userProfile.profile_picture_url,
        userName: userProfile.username || prev.userName,
        isLoaded: true,
        isStartupReady: true,
      }));

      InteractionManager.runAfterInteractions(async () => {
        // Let splash fade + lock screen mount before any CPU-heavy work.
        await new Promise((resolve) => setTimeout(resolve, 500));
        await yieldToUI();
        await yieldToUI();

        try {
          const processedNotes = await decryptEntriesInChunks(notes, 2);
          console.log('[PRELOAD] ✅ Decrypted', processedNotes.length, 'notes in background');
          setData((prev) => ({ ...prev, notes: processedNotes }));

          await yieldToUI();
          prewarmDashboardCache(userId, processedNotes);
          prewarmChatSuggestions(userId);
        } catch (decryptError) {
          console.error('[PRELOAD] Background decrypt error:', decryptError);
        }
      });

      // Account stats — lowest priority
      loadAccountStats(userId)
        .then((accountStats) => {
          setData((prev) => ({
            ...prev,
            subscriptionPlan: accountStats.subscriptionPlan,
            entriesCount: accountStats.entriesCount,
            entriesLimit: accountStats.entriesLimit,
          }));
        })
        .catch((err) => console.error('[PRELOAD] Account stats error:', err));
    } catch (error) {
      console.error('[PRELOAD] Error:', error);
      setData((prev) => ({ ...prev, isLoaded: true, isStartupReady: true }));
    }
  }, [loadAccountStats]);

  const refreshNotes = useCallback(async (userId: string) => {
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedNotes = await decryptEntriesInChunks(notes || [], 5);

      setData(prev => ({ ...prev, notes: processedNotes }));
      prewarmDashboardCache(userId, processedNotes);
      prewarmChatSuggestions(userId);
    } catch (error) {
      console.error('[PRELOAD] Refresh notes error:', error);
    }
  }, []);

  const refreshProfile = useCallback(async (userId: string) => {
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
        const rp =
          userProfile.profile_picture_url &&
          (userProfile.profile_picture_url.startsWith('http://') ||
            userProfile.profile_picture_url.startsWith('https://'))
            ? userProfile.profile_picture_url
            : null;
        if (rp) {
          await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', rp).catch(() => {});
          await AsyncStorage.setItem(`CACHED_PROFILE_PICTURE_${userId}`, rp).catch(() => {});
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
  }, [data.userProfile?.email]);

  const refreshAccountStats = useCallback(async (userId: string) => {
    try {
      const accountStats = await loadAccountStats(userId);
      setData(prev => ({
        ...prev,
        subscriptionPlan: accountStats.subscriptionPlan,
        entriesCount: accountStats.entriesCount,
        entriesLimit: accountStats.entriesLimit,
      }));
    } catch (error) {
      console.error('[PRELOAD] Refresh account stats error:', error);
    }
  }, [loadAccountStats]);

  const resetData = useCallback(() => {
    clearDashboardCache();
    clearChatSuggestionsCache();
    setData(EMPTY_PRELOADED_DATA);
  }, []);

  const value = useMemo(
    () => ({ data, preloadForUser, refreshNotes, refreshProfile, refreshAccountStats, resetData }),
    [data, preloadForUser, refreshNotes, refreshProfile, refreshAccountStats, resetData]
  );

  return (
    <PreloadContext.Provider value={value}>
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
