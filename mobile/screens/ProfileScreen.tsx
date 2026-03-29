import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { usePreloadedData } from '../contexts/PreloadContext';
import { supabase } from '../lib/supabase';
import { sf } from '../utils/responsive';

function resolveProfilePictureUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  if (t.startsWith('/')) {
    // Ignore desktop default profile pictures (Ocean-Swirl, Sunset-Swirl, etc.)
    const desktopDefaults = ['Ocean-Swirl', 'Sunset-Swirl', 'Vibrant-Swirl', 'Midnight-Swirl', 'Forest-Swirl'];
    if (desktopDefaults.some(def => t.includes(def))) return null;
    
    const base =
      Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      '';
    if (!base) return null;
    return `${base.replace(/\/$/, '')}/storage/v1/object/public/profile-pictures${t}`;
  }
  return null;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
}

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { theme, themeName } = useTheme();
  const { data: preloaded, refreshProfile, refreshAccountStats } = usePreloadedData();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');
  const [entriesCount, setEntriesCount] = useState(0);
  const [entriesLimit, setEntriesLimit] = useState(2);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Preload + user-scoped AsyncStorage (tab bar / Edit Profile); cache wins over stale preload for pfp
  useEffect(() => {
    if (!user) return;

    if (!preloaded.isLoaded) {
      loadUserProfile();
      return;
    }

    setSubscriptionPlan(preloaded.subscriptionPlan || 'Free');
    setEntriesCount(preloaded.entriesCount ?? 0);
    setEntriesLimit(preloaded.entriesLimit ?? 2);

    if (preloaded.userName) {
      (async () => {
        const cachedRaw = await AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`);
        const cached = resolveProfilePictureUrl(cachedRaw);
        const preloadedPfp = resolveProfilePictureUrl(preloaded.profilePicture ?? null);
        const pfp = cached || preloadedPfp || null;
        setUserProfile({
          id: '',
          username: preloaded.userName!,
          email: user.email || '',
          profile_picture_url: pfp,
        });
        if (pfp) setImageLoadError(false);
      })();
    } else {
      loadUserProfile();
    }
  }, [user?.id, preloaded.isLoaded, preloaded.userName, preloaded.profilePicture]);

  // Refresh on focus — sync pfp from cache and Supabase (handles return from Edit Profile)
  useFocusEffect(
    React.useCallback(() => {
      if (!user?.id) return;
      refreshProfile(user.id);
      refreshAccountStats(user.id);

      const syncPfp = async () => {
        const cachedRaw = await AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`);
        const cached = resolveProfilePictureUrl(cachedRaw);
        setUserProfile(prev => {
          if (!prev) {
            if (!cached) return prev;
            return {
              id: user.id,
              username: preloaded.userName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              profile_picture_url: cached,
            };
          }
          if (!cached || prev.profile_picture_url === cached) return prev;
          return { ...prev, profile_picture_url: cached };
        });
        if (cached) setImageLoadError(false);
      };
      syncPfp();
    }, [user?.id, refreshProfile, refreshAccountStats, preloaded.userName])
  );

  const loadUserProfile = async () => {
    if (!user) {
      console.log('[ProfileScreen] No user found, cannot load profile');
      return;
    }
    
    try {
      console.log('[ProfileScreen] Fetching profile from network for user:', user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[ProfileScreen] Profile query result:', { data, error });

      if (error) {
        console.error('[ProfileScreen] Error from Supabase:', error);
        throw error;
      }

      if (data) {
        console.log('[ProfileScreen] Profile data found:', data);
        const resolved = resolveProfilePictureUrl(data.profile_picture_url);
        const cachedRaw = await AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`);
        const cached = resolveProfilePictureUrl(cachedRaw);
        const profilePictureUrl = cached || resolved;
        if (profilePictureUrl) {
          await AsyncStorage.setItem(`CACHED_PROFILE_PICTURE_${user.id}`, profilePictureUrl);
        }
        setUserProfile({
          id: data.id,
          username: data.username || '',
          email: user.email || '',
          profile_picture_url: profilePictureUrl,
        });
        setImageLoadError(false);
      } else {
        console.log('[ProfileScreen] No profile data found, using fallback');
        const cachedUsername = await AsyncStorage.getItem('CACHED_USERNAME');
        const metadataUsername =
          typeof user.user_metadata?.username === 'string'
            ? user.user_metadata.username
            : '';
        // Fallback to user data if no profile exists
        setUserProfile({
          id: user.id,
          username: cachedUsername || metadataUsername || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          profile_picture_url: null,
        });
      }
    } catch (error) {
      console.error('[ProfileScreen] Error loading profile:', error);
      const cachedUsername = await AsyncStorage.getItem('CACHED_USERNAME');
      const metadataUsername =
        typeof user.user_metadata?.username === 'string'
          ? user.user_metadata.username
          : '';
      // Set fallback profile on error
      setUserProfile({
        id: user.id,
        username: cachedUsername || metadataUsername || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        profile_picture_url: null,
      });
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;
              
              // Delete all user data in order
              console.log('[DeleteAccount] Deleting notes...');
              await supabase.from('notes').delete().eq('user_id', user.id);
              
              console.log('[DeleteAccount] Deleting user profile...');
              await supabase.from('user_profiles').delete().eq('user_id', user.id);
              
              console.log('[DeleteAccount] Deleting auth user...');
              const { error: deleteError } = await supabase.rpc('delete_user');
              
              if (deleteError) {
                console.error('[DeleteAccount] Error deleting auth user:', deleteError);
                // Still sign out even if RPC fails
              }
              
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              await signOut();
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.secondaryText }]}>
      {title}
    </Text>
  );

  const renderMenuItem = (icon: string, title: string, subtitle?: string, onPress?: () => void, showChevron = true) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primaryText} style={styles.menuIcon} />
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: theme.colors.primaryText }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, { color: theme.colors.secondaryText }]}>{subtitle}</Text>}
        </View>
        {showChevron && <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.primaryText }]}>Profile</Text>

        {/* Profile Card - Clickable */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <View style={styles.profileContent}>
            {userProfile?.profile_picture_url && !imageLoadError ? (
              <Image
                key={userProfile.profile_picture_url}
                source={{ uri: userProfile.profile_picture_url }}
                style={styles.profilePicture}
                resizeMode="cover"
                onLoad={() => {
                  setImageLoadError(false);
                }}
                onError={() => {
                  setImageLoadError(true);
                }}
              />
            ) : (
              <View style={[styles.profilePicturePlaceholder, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <Ionicons name="person" size={22} color={theme.colors.secondaryText} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.primaryText }]}>
                {userProfile?.username || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.secondaryText }]}>
                {userProfile?.email || user?.email || ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
          </View>
        </TouchableOpacity>

        {/* Account Section */}
        {renderSectionHeader('Account')}
        <View style={styles.menuSection}>
          {renderMenuItem('card-outline', 'Current Plan', subscriptionPlan, () => navigation.navigate('Paywall'))}
          {renderMenuItem('calendar-outline', 'Analysed today', `${entriesCount} / ${entriesLimit}`, undefined, false)}
        </View>

        {/* Preferences Section */}
        {renderSectionHeader('Preferences')}
        <View style={styles.menuSection}>
          {renderMenuItem('color-palette-outline', 'Appearance', `Theme: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`, () => navigation.navigate('Appearance'))}
          {renderMenuItem('lock-closed-outline', 'Security', 'No lock set', () => navigation.navigate('Security'))}
          {renderMenuItem('options-outline', 'Personalize', 'Reminders, prompts & preferences', () => navigation.navigate('Personalize'))}
        </View>

        {/* Support Section */}
        {renderSectionHeader('Support')}
        <View style={styles.menuSection}>
          {renderMenuItem('document-text-outline', 'Privacy Policy', undefined, () => Linking.openURL('https://myinsightai.app/privacy'))}
        </View>

        {/* Account Actions */}
        {renderSectionHeader('Account Actions')}
        <View style={styles.menuSection}>
          {renderMenuItem('log-out-outline', 'Logout', undefined, handleSignOut, false)}
          {renderMenuItem('trash-outline', 'Delete Account', undefined, handleDeleteAccount, false)}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: sf(22),
    fontWeight: '600',
    marginTop: 60,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profilePicturePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicturePlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: sf(18),
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: sf(14),
  },
  sectionHeader: {
    fontSize: sf(13),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  menuSection: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: sf(16),
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: sf(14),
    marginTop: 2,
  },
});
