import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { sf } from '../utils/responsive';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
}

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');
  const [entriesCount, setEntriesCount] = useState(0);
  const [entriesLimit, setEntriesLimit] = useState(2);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadSubscriptionStatus();
      loadEntriesCount();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadUserProfile();
        loadSubscriptionStatus();
        loadEntriesCount();
      }
    }, [user])
  );

  const loadUserProfile = async () => {
    if (!user) {
      console.log('[ProfileScreen] No user found, cannot load profile');
      return;
    }
    
    try {
      console.log('[ProfileScreen] Loading profile for user:', user.id);
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
        setUserProfile({
          id: data.id,
          username: data.username || '',
          email: user.email || '',
          profile_picture_url: data.profile_picture_url,
        });
      } else {
        console.log('[ProfileScreen] No profile data found, using fallback');
        // Fallback to user data if no profile exists
        setUserProfile({
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          profile_picture_url: null,
        });
      }
    } catch (error) {
      console.error('[ProfileScreen] Error loading profile:', error);
      // Set fallback profile on error
      setUserProfile({
        id: user.id,
        username: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        profile_picture_url: null,
      });
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      console.log('[Settings] Loading subscription status...');
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('[Settings] Customer info loaded');
      console.log('[Settings] Active entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('[Settings] Active subscriptions:', customerInfo.activeSubscriptions);

      const hasProEntitlement = customerInfo.entitlements.active['InsightAI Pro'] !== undefined;
      const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

      console.log('[Settings] Is Pro Active:', hasProEntitlement);
      console.log('[Settings] Has any active entitlement:', hasAnyActiveEntitlement);

      if (hasAnyActiveEntitlement) {
        console.log('[Settings] ✅ Subscription is active - setting plan to Pro');
        setSubscriptionPlan('Insight Pro');
        setEntriesLimit(2); // Pro users get 2 AI analyses per day
      } else {
        console.log('[Settings] ⚠️ No active subscription - setting plan to Free');
        setSubscriptionPlan('Free');
        setEntriesLimit(0); // Free users get 0 AI analyses
      }
    } catch (error) {
      console.error('[Settings] Error loading subscription:', error);
      setSubscriptionPlan('Free');
      setEntriesLimit(0);
    }
  };

  const loadEntriesCount = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      if (!error && count !== null) {
        setEntriesCount(count);
      }
    } catch (error) {
      console.error('Error loading entries count:', error);
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.primaryText }]}>Profile</Text>

        {/* Profile Card - Clickable */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <View style={styles.profileContent}>
            {(() => {
              const pfpUrl = userProfile?.profile_picture_url?.trim();
              // Only show image if it's a valid HTTP/HTTPS URL (not relative paths like "/Ocean-Swirl.webp")
              const isValidUrl = pfpUrl && (pfpUrl.startsWith('http://') || pfpUrl.startsWith('https://'));
              
              if (isValidUrl) {
                return (
                  <Image 
                    source={{ uri: pfpUrl }} 
                    style={styles.profilePicture}
                    onError={(e) => {
                      console.log('[ProfileScreen] Image failed to load:', e.nativeEvent.error);
                    }}
                  />
                );
              } else {
                return (
                  <View style={[styles.profilePicturePlaceholder, { width: 56, height: 56 }]}>
                    <Ionicons name="person-circle-outline" size={56} color={theme.colors.primaryText} />
                  </View>
                );
              }
            })()}
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
          {renderMenuItem('calendar-outline', 'Entries today', `${entriesCount} / ${entriesLimit}`, undefined, false)}
        </View>

        {/* Preferences Section */}
        {renderSectionHeader('Preferences')}
        <View style={styles.menuSection}>
          {renderMenuItem('color-palette-outline', 'Appearance', 'Theme: Dark', () => navigation.navigate('Appearance'))}
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
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profilePicturePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
