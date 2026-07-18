import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { InteractionManager } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { decryptEntriesInChunks, decryptNotesLazy } from '../utils/decryptBatch';
import { ensureDecryptCacheLoaded } from '../utils/decryptCache';
import { notesSignature } from '../utils/computeDashboardData';
import { prewarmDashboardCache, clearDashboardCache } from '../utils/dashboardCache';
import { prewarmChatSuggestions, clearChatSuggestionsCache } from '../utils/chatSuggestionsCache';
import { yieldToUI } from '../utils/yieldToUI';
import { perfLog, perfStart } from '../utils/perfLog';
import { useAppLock } from './AppLockContext';
import { PRO_DISPLAY_NAME } from '../constants/branding';

const NOTES_REFRESH_STALE_MS = 90_000;

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
  refreshNotes: (userId: string, options?: { force?: boolean }) => Promise<void>;
  removeNoteById: (userId: string, noteId: string) => void;
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
  const { isLocked, isLockEnabled } = useAppLock();
  const [data, setData] = useState<PreloadedData>(EMPTY_PRELOADED_DATA);
  const notesRefreshInFlightRef = useRef<Promise<void> | null>(null);
  const lastNotesRefreshAtRef = useRef(0);
  const notesRef = useRef<any[] | null>(null);
  const pendingBackgroundWorkRef = useRef<{ userId: string; notes: any[] } | null>(null);
  const backgroundWorkGenRef = useRef(0);
  const [backgroundWorkTick, setBackgroundWorkTick] = useState(0);
  notesRef.current = data.notes;

  const runBackgroundDecryptAndPrewarm = useCallback(async (userId: string, notes: any[]) => {
    const start = perfStart('Preload', `Background decrypt for ${notes.length} notes`);
    await yieldToUI();

    try {
      const { immediate, finishBackground } = await decryptNotesLazy(notes, userId);
      perfLog('Preload', `Priority decrypt done (${immediate.length} notes)`, start);
      setData((prev) => ({ ...prev, notes: immediate }));

      const processedNotes = await finishBackground();
      perfLog('Preload', `Decrypted ${processedNotes.length} notes`, start);
      setData((prev) => ({ ...prev, notes: processedNotes }));

      await yieldToUI();
      prewarmDashboardCache(userId, processedNotes);
      prewarmChatSuggestions(userId);
      perfLog('Preload', 'Prewarm scheduled', start);
    } catch (decryptError) {
      console.error('[PRELOAD] Background decrypt error:', decryptError);
    }
  }, []);

  // Never run CPU-heavy decrypt while the PIN lock screen is showing.
  useEffect(() => {
    if (isLockEnabled && isLocked) {
      perfLog('Preload', 'Deferring background decrypt — waiting for PIN unlock');
      return;
    }
    const pending = pendingBackgroundWorkRef.current;
    if (!pending) return;

    const taskId = ++backgroundWorkGenRef.current;
    pendingBackgroundWorkRef.current = null;

    const handle = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (taskId !== backgroundWorkGenRef.current) return;
        runBackgroundDecryptAndPrewarm(pending.userId, pending.notes);
      }, 350);
    });

    return () => handle.cancel();
  }, [isLocked, isLockEnabled, backgroundWorkTick, runBackgroundDecryptAndPrewarm]);

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
      subscriptionPlan: hasAnyActiveEntitlement ? PRO_DISPLAY_NAME : 'Free',
      entriesLimit: hasAnyActiveEntitlement ? 2 : 0,
      entriesCount: usageResult.error || usageResult.count === null ? 0 : usageResult.count,
    };
  }, []);

  const preloadForUser = useCallback(async (userId: string, email: string) => {
    console.log('[PRELOAD] Starting preload for user:', userId);

    await ensureDecryptCacheLoaded(userId);

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

      pendingBackgroundWorkRef.current = { userId, notes };
      setBackgroundWorkTick((t) => t + 1);

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

  const refreshNotes = useCallback(async (userId: string, options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const now = Date.now();
    if (!force && now - lastNotesRefreshAtRef.current < NOTES_REFRESH_STALE_MS) {
      return;
    }
    if (notesRefreshInFlightRef.current) {
      return notesRefreshInFlightRef.current;
    }

    const task = (async () => {
      const start = perfStart('RefreshNotes', force ? 'Force refresh' : 'Stale refresh');
      try {
        await yieldToUI();

        const { data: notes, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(40);

        if (error) throw error;

        const incomingSig = notesSignature(notes || []);
        const currentSig = notesSignature(notesRef.current);
        if (!force && incomingSig === currentSig && notesRef.current?.length) {
          lastNotesRefreshAtRef.current = Date.now();
          perfLog('RefreshNotes', 'Skipped — notes unchanged', start);
          return;
        }

        const { immediate, finishBackground } = await decryptNotesLazy(notes || [], userId);
        lastNotesRefreshAtRef.current = Date.now();
        perfLog('RefreshNotes', `Priority decrypt done (${immediate.length} notes)`, start);

        setData((prev) => ({ ...prev, notes: immediate }));

        const processedNotes = await finishBackground();
        perfLog('RefreshNotes', `Decrypted ${processedNotes.length} notes`, start);

        const newSig = notesSignature(processedNotes);
        if (newSig !== currentSig) {
          clearDashboardCache(userId);
          InteractionManager.runAfterInteractions(() => {
            prewarmDashboardCache(userId, processedNotes);
          });
        }

        setData((prev) => ({ ...prev, notes: processedNotes }));
        perfLog('RefreshNotes', 'State updated', start);
      } catch (error) {
        console.error('[PRELOAD] Refresh notes error:', error);
      } finally {
        notesRefreshInFlightRef.current = null;
      }
    })();

    notesRefreshInFlightRef.current = task;
    return task;
  }, []);

  const removeNoteById = useCallback((userId: string, noteId: string) => {
    const start = perfStart('Delete', `Optimistic remove ${noteId}`);
    let nextNotes: any[] = [];
    setData((prev) => {
      nextNotes = (prev.notes || []).filter((n) => n.id !== noteId);
      return { ...prev, notes: nextNotes };
    });
    notesRef.current = nextNotes;
    lastNotesRefreshAtRef.current = Date.now();

    InteractionManager.runAfterInteractions(() => {
      if (!nextNotes.length) {
        clearDashboardCache(userId);
        perfLog('Delete', 'Dashboard cache cleared (no notes)', start);
        return;
      }
      clearDashboardCache(userId);
      prewarmDashboardCache(userId, nextNotes);
      perfLog('Delete', 'Dashboard cache updated', start);
    });
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
    () => ({ data, preloadForUser, refreshNotes, removeNoteById, refreshProfile, refreshAccountStats, resetData }),
    [data, preloadForUser, refreshNotes, removeNoteById, refreshProfile, refreshAccountStats, resetData]
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
