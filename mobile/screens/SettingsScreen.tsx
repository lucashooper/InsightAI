import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Purchases from 'react-native-purchases';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemeName, isDarkTheme, ContainerStyle } from '../contexts/ThemeContext';
import { useAppLock } from '../contexts/AppLockContext';
import { supabase } from '../lib/supabase';
import { checkAIConsent, updateAIConsent } from '../services/aiConsentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StandardContainer from '../components/shared/StandardContainer';
import PageHeader from '../components/shared/PageHeader';
import LanguagePicker from '../components/LanguagePicker';
import { useLanguage } from '../contexts/LanguageContext';
import { usePreloadedData } from '../contexts/PreloadContext';
import { isTablet, sf, ss, si, iPadContentStyle } from '../utils/responsive';
import { printSubscriptionDebugReport, resetRevenueCatOnly, nukeAllSubscriptionState } from '../utils/subscriptionDebug';
import Constants from 'expo-constants';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
}

export default function SettingsScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { theme, themeName, setTheme, containerStyle, setContainerStyle } = useTheme();
  const { isLockEnabled, isBiometricEnabled, isBiometricAvailable, enableLock, disableLock, toggleBiometric } = useAppLock();
  const { t } = useLanguage();
  const { refreshProfile } = usePreloadedData();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm' | 'disable'>('enter');
  const [pinError, setPinError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(2);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [dailyMoodCheckInEnabled, setDailyMoodCheckInEnabled] = useState(true);
  const [breathingPromptsEnabled, setBreathingPromptsEnabled] = useState(true);
  const [monthlyStoriesEnabled, setMonthlyStoriesEnabled] = useState(true);
  const [moodIndicatorsEnabled, setMoodIndicatorsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(() => t('settings.free'));
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [aiConsentGranted, setAiConsentGranted] = useState<boolean | null>(null);
  const [loadingAiConsent, setLoadingAiConsent] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const defaultThemes: { name: ThemeName; label: string; emoji: string }[] = [
    { name: 'dark', label: t('settings.dark'), emoji: '' },
    { name: 'light', label: t('settings.light'), emoji: '' },
  ];

  const otherThemes: { name: ThemeName; label: string; emoji: string }[] = [
    { name: 'sunset', label: t('settings.sunset'), emoji: '' },
    { name: 'vibrant', label: t('settings.vibrant'), emoji: '' },
    { name: 'ocean', label: t('settings.ocean'), emoji: '' },
    { name: 'midnight', label: t('settings.midnight'), emoji: '' },
  ];

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUsageStats();
      loadPersonalizationSettings();
      loadSubscriptionStatus();
      loadAIConsent();
    }
  }, [user]);

  // Refresh subscription status when screen comes into focus (e.g., after purchase)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        console.log('[Settings] Screen focused - refreshing subscription status');
        loadSubscriptionStatus();
        loadUsageStats();
      }
    }, [user])
  );

  const loadAIConsent = async () => {
    try {
      setLoadingAiConsent(true);
      const status = await checkAIConsent();
      setAiConsentGranted(status.granted);
    } catch (error) {
      console.error('Error loading AI consent:', error);
    } finally {
      setLoadingAiConsent(false);
    }
  };

  const toggleAIConsent = async (newValue: boolean) => {
    try {
      const success = await updateAIConsent(newValue);
      if (success) {
        setAiConsentGranted(newValue);
        Alert.alert(
          newValue ? t('settings.aiEnabled') : t('settings.aiDisabled'),
          newValue 
            ? t('settings.aiEnabledMessage')
            : t('settings.aiDisabledMessage')
        );
      } else {
        Alert.alert(t('common.error'), t('settings.updateConsentFailed'));
      }
    } catch (error) {
      console.error('Error toggling AI consent:', error);
      Alert.alert(t('common.error'), t('settings.updateConsentFailed'));
    }
  };

  const loadPersonalizationSettings = async () => {
    try {
      const dailyMood = await AsyncStorage.getItem('dailyMoodCheckInEnabled');
      const breathingPrompts = await AsyncStorage.getItem('breathingPromptsEnabled');
      const monthlyStories = await AsyncStorage.getItem('monthlyStoriesEnabled');
      const moodIndicators = await AsyncStorage.getItem('moodIndicatorsEnabled');
      const reminder = await AsyncStorage.getItem('reminderEnabled');
      const time = await AsyncStorage.getItem('reminderTime');
      
      if (dailyMood !== null) setDailyMoodCheckInEnabled(dailyMood === 'true');
      if (breathingPrompts !== null) setBreathingPromptsEnabled(breathingPrompts === 'true');
      if (monthlyStories !== null) setMonthlyStoriesEnabled(monthlyStories === 'true');
      if (moodIndicators !== null) setMoodIndicatorsEnabled(moodIndicators === 'true');
      if (reminder !== null) setReminderEnabled(reminder === 'true');
      if (time !== null) setReminderTime(time);
    } catch (error) {
      console.error('Error loading personalization settings:', error);
    }
  };

  const toggleDailyMoodCheckIn = async (value: boolean) => {
    setDailyMoodCheckInEnabled(value);
    await AsyncStorage.setItem('dailyMoodCheckInEnabled', value.toString());
  };

  const toggleBreathingPrompts = async (value: boolean) => {
    setBreathingPromptsEnabled(value);
    await AsyncStorage.setItem('breathingPromptsEnabled', value.toString());
  };

  const toggleMonthlyStories = async (value: boolean) => {
    setMonthlyStoriesEnabled(value);
    await AsyncStorage.setItem('monthlyStoriesEnabled', value.toString());
  };

  const toggleMoodIndicators = async (value: boolean) => {
    setMoodIndicatorsEnabled(value);
    await AsyncStorage.setItem('moodIndicatorsEnabled', value.toString());
  };

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    await AsyncStorage.setItem('reminderEnabled', value.toString());
    
    if (value) {
      // Show time picker when enabling
      handleSetReminderTime();
    }
  };

  const handleSetReminderTime = () => {
    Alert.prompt(
      t('settings.reminderTime'),
      t('settings.reminderPrompt'),
      async (time) => {
        if (time && time.trim()) {
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(time.trim())) {
            Alert.alert(t('settings.invalidFormat'), t('settings.invalidFormatMessage'));
            return;
          }
          
          setReminderTime(time.trim());
          await AsyncStorage.setItem('reminderTime', time.trim());
          Alert.alert(
            t('settings.reminderSet'),
            t('settings.reminderSetMessage', { time: time.trim() })
          );
        }
      },
      'plain-text',
      reminderTime
    );
  };

  const handleEditUsername = () => {
    Alert.prompt(
      t('settings.editName'),
      t('settings.editNamePrompt'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('settings.save'),
          onPress: async (newName?: string) => {
            if (!newName || !newName.trim()) return;
            
            const trimmedName = newName.trim().substring(0, 30);
            
            try {
              console.log('[Settings] Updating username to:', trimmedName);
              const { error } = await supabase
                .from('user_profiles')
                .update({ username: trimmedName })
                .eq('user_id', user?.id);
              
              if (error) {
                console.error('[Settings] Error updating username:', error);
                Alert.alert(t('common.error'), t('settings.updateNameFailed'));
              } else {
                console.log('[Settings] ✅ Username updated successfully');
                setUserProfile(prev => prev ? { ...prev, username: trimmedName } : prev);
                await AsyncStorage.setItem('CACHED_USERNAME', trimmedName);
                if (user?.id) {
                  await AsyncStorage.setItem(`CACHED_USERNAME_${user.id}`, trimmedName);
                  await refreshProfile(user.id);
                }
                Alert.alert(t('common.success'), t('settings.nameUpdated'));
              }
            } catch (err) {
              console.error('[Settings] Exception updating username:', err);
              Alert.alert(t('common.error'), t('settings.updateNameFailed'));
            }
          }
        }
      ],
      'plain-text',
      userProfile?.username || ''
    );
  };

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      console.log('Loading profile for user ID:', user.id);
      console.log('User email:', user.email);

      // Query by user_id to match desktop schema
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile query by user_id result:', { data, error });

      // If no data but also no error, try email-based lookup (desktop may have created by email)
      if (!data && !error && user.email) {
        const emailResult = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        console.log('Profile query by email fallback result:', emailResult);
        data = emailResult.data;
        error = emailResult.error;
      }

      if (error) {
        console.error('Error loading profile:', error);
        // Use fallback profile on error — restore cached picture
        const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
        const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
        setUserProfile({
          id: user.id,
          email: user.email || '',
          username: cachedName || user.email?.split('@')[0] || t('settings.user'),
          profile_picture_url: cachedPfp || null
        });
      } else if (data) {
        console.log('✅ Profile loaded successfully:', data.username, data.profile_picture_url);
        // Accept full URLs or relative Supabase storage paths
        let validProfilePicture: string | null = null;
        if (data.profile_picture_url) {
          if (data.profile_picture_url.startsWith('http://') || data.profile_picture_url.startsWith('https://')) {
            validProfilePicture = data.profile_picture_url;
          } else if (data.profile_picture_url.startsWith('/')) {
            // Relative path from Supabase storage - construct full URL
            const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || '';
            validProfilePicture = `${supabaseUrl}/storage/v1/object/public/profile-pictures${data.profile_picture_url}`;
          }
        }
        // Cache the profile picture URL for persistence
        if (validProfilePicture) {
          await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', validProfilePicture);
        }
        if (data.username) {
          await AsyncStorage.setItem('CACHED_USERNAME', data.username);
        }
        setUserProfile({
          id: data.id,
          email: data.email,
          username: data.username,
          profile_picture_url: validProfilePicture,
        });
      } else {
        // No profile found - likely RLS blocking the query
        console.log('⚠️ No profile found (RLS may be blocking SELECT). Using fallback.');
        const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
        const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
        setUserProfile({
          id: user.id,
          email: user.email || '',
          username: cachedName || user.user_metadata?.username || user.email?.split('@')[0] || t('settings.user'),
          profile_picture_url: cachedPfp || null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
      const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
      setUserProfile({
        id: user.id,
        email: user.email || '',
        username: cachedName || user.user_metadata?.username || user.email?.split('@')[0] || t('settings.user'),
        profile_picture_url: cachedPfp || null
      });
    }
  };

  const loadUsageStats = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'ai_analysis')
        .gte('created_at', today);

      if (!error) {
        setUsageCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoadingSubscription(true);
      console.log('[Settings] Loading subscription status...');
      
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('[Settings] Customer info loaded');
      console.log('[Settings] Active entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('[Settings] Active subscriptions:', customerInfo.activeSubscriptions);
      
      const ENTITLEMENT_ID = 'Insight Pro';
      const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
      const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
      
      console.log('[Settings] Is Pro Active:', isProActive);
      console.log('[Settings] Has any active entitlement:', hasAnyActiveEntitlement);
      
      let isPro = isProActive || hasAnyActiveEntitlement;
      
      // CRITICAL: Verify subscription belongs to THIS user, not another account on same device
      if (isPro && user) {
        const originalOwner = customerInfo.originalAppUserId;
        const isOwnSubscription = originalOwner === user.id || originalOwner?.startsWith('$RCAnonymousID:');
        if (!isOwnSubscription) {
          console.log('[Settings] ⚠️ Subscription belongs to different user:', originalOwner, 'current:', user.id);
          isPro = false;
        }
      }
      
      if (isPro) {
        setSubscriptionPlan('Pro');
        setUsageLimit(2);
        console.log('[Settings] ✅ Subscription is active - setting plan to Pro');
      } else {
        setSubscriptionPlan(t('settings.free'));
        setUsageLimit(0);
        console.log('[Settings] ⚠️ No active subscription - setting plan to Free');
      }
    } catch (error: any) {
      console.error('[Settings] ❌ Error loading subscription status:', error);
      console.error('[Settings] Error message:', error.message);
      setSubscriptionPlan(t('settings.free'));
      setUsageLimit(0);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('settings.permissionRequired'), t('settings.photoPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && user) {
      setUploadingImage(true);
      try {
        const uri = result.assets[0].uri;
        const fileExt = uri.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        // Store inside a user-specific folder to align with common RLS patterns
        const filePath = `${user.id}/${fileName}`;

        // Create form data for React Native
        const formData = new FormData();
        formData.append('file', {
          uri: uri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any);

        // Upload to Supabase Storage using FormData (same bucket as desktop)
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, formData, {
            contentType: `image/${fileExt}`,
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        // Update profile picture URL in existing profile row
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ profile_picture_url: urlData.publicUrl })
          .eq('user_id', user.id);

        if (updateError) {
          console.log('Could not save to database, updating local state only:', updateError);
        }

        // Update local state regardless
        setUserProfile(prev => prev ? { ...prev, profile_picture_url: urlData.publicUrl } : null);
        Alert.alert(t('common.success'), t('settings.pictureUpdated'));
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert(t('settings.uploadFailed'), t('settings.uploadFailedMessage'));
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTitle.trim() || !feedbackMessage.trim()) {
      Alert.alert(t('settings.missingInfo'), t('settings.missingInfoMessage'));
      return;
    }

    setSubmittingFeedback(true);
    try {
      console.log('[Settings] Submitting feedback...');
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id,
          title: feedbackTitle.trim(),
          message: feedbackMessage.trim(),
          status: 'new'
        })
        .select();

      if (error) {
        console.error('[Settings] Feedback submission error:', error);
        throw error;
      }

      console.log('[Settings] ✅ Feedback submitted successfully:', data);
      setFeedbackSuccess(true);
      setFeedbackTitle('');
      setFeedbackMessage('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (error: any) {
      console.error('[Settings] Error submitting feedback:', error);
      Alert.alert(t('common.error'), error?.message || t('settings.feedbackFailed'));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Sync strategies from Supabase
      const { data, error } = await supabase
        .from('actionable_insights')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      Alert.alert(t('common.success'), t('settings.syncSuccess', { count: data?.length || 0 }));
      console.log('📥 Synced strategies:', data);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.syncFailed'));
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigation will automatically switch to unauthenticated stack
            // when user becomes null
          }
        },
      ]
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      <PageHeader title={t('settings.pageTitle')} />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <View style={styles.profileSection}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={handleProfilePictureUpload}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <View style={styles.avatar}>
                      <ActivityIndicator size="small" color="#8b5cf6" />
                    </View>
                  ) : userProfile?.profile_picture_url ? (
                    <Image
                      source={{ uri: userProfile.profile_picture_url }}
                      style={styles.avatarImage}
                      onError={() => {
                        // Image failed to load (invalid URL) - clear it to show placeholder
                        setUserProfile(prev => prev ? { ...prev, profile_picture_url: null } : prev);
                      }}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={isTablet ? 36 : 28} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.5)' : '#8b5cf6'} />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <TouchableOpacity onPress={handleEditUsername}>
                    <Text style={[styles.profileName, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]} numberOfLines={1}>{userProfile?.username || user?.user_metadata?.username || t('settings.user')}</Text>
                  </TouchableOpacity>
                  {user?.email && <Text style={[styles.profileEmail, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.6)' : '#6B6B6B' }]}>{user.email}</Text>}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Language — always visible, not hidden inside another section */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={{ paddingHorizontal: 16 }}>
              <LanguagePicker variant="row" />
            </View>
          </View>
        </View>

        {/* Appearance - Collapsible */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => toggleSection('appearance')}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.colors.primaryText, marginBottom: 0 }]}>{t('settings.appearance')}</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>Theme: {themeName.charAt(0).toUpperCase() + themeName.slice(1)}</Text>
              </View>
              <Ionicons name={expandedSection === 'appearance' ? 'chevron-up' : 'chevron-forward'} size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
            {expandedSection === 'appearance' && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border, marginHorizontal: 0, marginBottom: 16 }]} />
                
                {/* Theme Selection */}
                <Text style={[styles.subsectionLabel, { color: theme.colors.secondaryText }]}>{t('settings.theme')}</Text>
                <View style={styles.themeGrid}>
                  {[...defaultThemes, ...otherThemes].map((t) => (
                    <TouchableOpacity
                      key={t.name}
                      style={[
                        styles.themeOption,
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                        themeName === t.name && styles.themeOptionActive
                      ]}
                      onPress={() => setTheme(t.name)}
                    >
                      <Text style={[
                        styles.themeLabel,
                        { color: themeName === t.name ? '#8b5cf6' : theme.colors.secondaryText }
                      ]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Container Style Selection */}
                <Text style={[styles.subsectionLabel, { color: theme.colors.secondaryText, marginTop: 20 }]}>{t('settings.containerStyle')}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.accentModeOption,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      containerStyle === 'modern-gray' && styles.accentModeOptionActive
                    ]}
                    onPress={() => setContainerStyle('modern-gray')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.accentModeLabel, { color: containerStyle === 'modern-gray' ? '#8b5cf6' : theme.colors.secondaryText }]}>{t('settings.modernGray')}</Text>
                    <Text style={[styles.accentModeDesc, { color: theme.colors.tertiaryText }]}>{t('settings.modernGrayDesc')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.accentModeOption,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      containerStyle === 'responsive' && styles.accentModeOptionActive
                    ]}
                    onPress={() => setContainerStyle('responsive')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.accentModeLabel, { color: containerStyle === 'responsive' ? '#8b5cf6' : theme.colors.secondaryText }]}>{t('settings.responsive')}</Text>
                    <Text style={[styles.accentModeDesc, { color: theme.colors.tertiaryText }]}>{t('settings.responsiveDesc')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Security - Collapsible */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => toggleSection('security')}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.colors.primaryText, marginBottom: 0 }]}>{t('settings.security')}</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{isLockEnabled ? t('settings.lockEnabledShort') : t('settings.noLock')}</Text>
              </View>
              <Ionicons name={expandedSection === 'security' ? 'chevron-up' : 'chevron-forward'} size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
            {expandedSection === 'security' && (
              <>
                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => {
                    if (isLockEnabled) {
                      Alert.prompt(
                        t('settings.disableLock'),
                        t('settings.disableLockPrompt'),
                        async (text: string) => {
                          if (text && text.length === 4) {
                            const success = await disableLock(text);
                            if (!success) {
                              Alert.alert(t('settings.incorrectPin'), t('settings.incorrectPinMessage'));
                            }
                          }
                        },
                        'secure-text',
                        '',
                        'number-pad'
                      );
                    } else {
                      Alert.prompt(
                        t('settings.setLockPin'),
                        t('settings.setLockPinPrompt'),
                        [
                          { text: t('common.cancel'), style: 'cancel' },
                          {
                            text: t('settings.next'),
                            onPress: (pin?: string) => {
                              if (!pin || pin.length !== 4) {
                                Alert.alert(t('settings.invalidPin'), t('settings.invalidPinMessage'));
                                return;
                              }
                              Alert.prompt(
                                t('settings.confirmPin'),
                                t('settings.confirmPinPrompt'),
                                [
                                  { text: t('common.cancel'), style: 'cancel' },
                                  {
                                    text: t('settings.enableLock'),
                                    onPress: async (confirmPin?: string) => {
                                      if (confirmPin === pin) {
                                        await enableLock(pin);
                                        Alert.alert(t('settings.lockEnabled'), t('settings.lockEnabledMessage'));
                                      } else {
                                        Alert.alert(t('settings.pinsMismatch'), t('settings.pinsMismatchMessage'));
                                      }
                                    },
                                  },
                                ],
                                'secure-text',
                                '',
                                'number-pad'
                              );
                            },
                          },
                        ],
                        'secure-text',
                        '',
                        'number-pad'
                      );
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.appLock')}</Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.appLockDesc')}</Text>
                  </View>
                  <View style={[styles.toggle, isLockEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, isLockEnabled && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>

                {isLockEnabled && isBiometricAvailable && (
                  <>
                    <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                    <TouchableOpacity 
                      style={styles.settingRow}
                      onPress={() => toggleBiometric(!isBiometricEnabled)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.biometrics')}</Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.biometricsDesc')}</Text>
                      </View>
                      <View style={[styles.toggle, isBiometricEnabled && styles.toggleActive]}>
                        <View style={[styles.toggleThumb, isBiometricEnabled && styles.toggleThumbActive]} />
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                {isLockEnabled && (
                  <>
                    <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                    <TouchableOpacity 
                      style={styles.settingRow}
                      onPress={() => {
                        Alert.prompt(
                          t('settings.changePin'),
                          t('settings.currentPinPrompt'),
                          [
                            { text: t('common.cancel'), style: 'cancel' },
                            {
                              text: t('settings.next'),
                              onPress: async (currentPin?: string) => {
                                if (!currentPin) return;
                                const valid = await disableLock(currentPin);
                                if (!valid) {
                                  Alert.alert(t('settings.incorrectPin'), t('settings.incorrectPinMessage'));
                                  return;
                                }
                                Alert.prompt(
                                  t('settings.newPin'),
                                  t('settings.newPinPrompt'),
                                  [
                                    { text: t('common.cancel'), style: 'cancel' },
                                    {
                                      text: t('settings.setPin'),
                                      onPress: async (newPin?: string) => {
                                        if (!newPin || newPin.length !== 4) {
                                          Alert.alert(t('settings.invalidPin'), t('settings.invalidPinMessage'));
                                          await enableLock(currentPin);
                                          return;
                                        }
                                        await enableLock(newPin);
                                        Alert.alert(t('settings.pinChanged'), t('settings.pinChangedMessage'));
                                      },
                                    },
                                  ],
                                  'secure-text',
                                  '',
                                  'number-pad'
                                );
                              },
                            },
                          ],
                          'secure-text',
                          '',
                          'number-pad'
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.changePin')}</Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.changePinDesc')}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.secondaryText} />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Privacy & Data - Simple row */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => {
                Alert.alert(
                  t('settings.privacy'),
                  t('settings.privacyMessage'),
                  [
                    { text: t('common.cancel'), style: 'cancel' },
                    { 
                      text: t('settings.open'),
                      onPress: () => {
                        const url = 'https://myinsightai.app/privacy';
                        console.log('Opening privacy policy:', url);
                      }
                    }
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.colors.primaryText, marginBottom: 0 }]}>{t('settings.privacy')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalize - Collapsible */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => toggleSection('personalize')}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.colors.primaryText, marginBottom: 0 }]}>{t('settings.personalize')}</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.personalizeDesc')}</Text>
              </View>
              <Ionicons name={expandedSection === 'personalize' ? 'chevron-up' : 'chevron-forward'} size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
            {expandedSection === 'personalize' && (
              <>
                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => toggleReminder(!reminderEnabled)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.dailyReminder')}</Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>Receive a notification at {reminderTime}</Text>
                  </View>
                  <View style={[styles.toggle, reminderEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, reminderEnabled && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
                
                {reminderEnabled && (
                  <>
                    <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                    <TouchableOpacity 
                      style={styles.settingRow}
                      onPress={handleSetReminderTime}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.changeTime')}</Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>Currently set to {reminderTime}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.secondaryText} />
                    </TouchableOpacity>
                  </>
                )}

                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => toggleDailyMoodCheckIn(!dailyMoodCheckInEnabled)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('checkIn.dailyMoodCheckIn')}</Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('checkIn.dailyMoodDescription')}</Text>
                  </View>
                  <View style={[styles.toggle, dailyMoodCheckInEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, dailyMoodCheckInEnabled && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
                
                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => toggleBreathingPrompts(!breathingPromptsEnabled)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.breathing')}</Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.breathingDesc')}</Text>
                  </View>
                  <View style={[styles.toggle, breathingPromptsEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, breathingPromptsEnabled && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
                
                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => toggleMonthlyStories(!monthlyStoriesEnabled)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.monthly')}</Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.monthlyDesc')}</Text>
                  </View>
                  <View style={[styles.toggle, monthlyStoriesEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, monthlyStoriesEnabled && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
                
                <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => toggleMoodIndicators(!moodIndicatorsEnabled)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={[styles.settingLabel, { color: theme.colors.primaryText }]}>{t('settings.moodIndicators')}</Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.secondaryText }]}>{t('settings.moodIndicatorsDesc')}</Text>
                  </View>
                  <View style={[styles.toggle, moodIndicatorsEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, moodIndicatorsEnabled && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Subscription & Usage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{t('settings.account')}</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <View style={styles.usageRow}>
                <Text style={[styles.usageLabel, { color: theme.colors.secondaryText }]}>{t('settings.currentPlan')}</Text>
                {isLoadingSubscription ? (
                  <ActivityIndicator size="small" color="#a855f7" />
                ) : (
                  <Text style={[styles.usageTier, { color: theme.colors.primaryText }]}>Insight {subscriptionPlan}</Text>
                )}
              </View>
              {/* Only show usage counter for Pro users */}
              {subscriptionPlan === 'Pro' && (
                <View style={styles.usageProgress}>
                  <View style={styles.usageProgressRow}>
                    <Text style={[styles.usageProgressLabel, { color: theme.colors.secondaryText }]}>{t('settings.analyzedToday')}</Text>
                    <Text style={[styles.usageProgressValue, { color: theme.colors.primaryText }]}>{usageCount} / {usageLimit}</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min((usageCount / usageLimit) * 100, 100)}%` }
                      ]}
                    />
                  </View>
                </View>
              )}
              
              {/* Upgrade/Manage Button */}
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('Paywall', { fromSettings: true })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={subscriptionPlan === 'Pro' ? ['#10b981', '#059669'] : ['#a855f7', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeGradient}
                >
                  <Ionicons name={subscriptionPlan === 'Pro' ? 'settings-outline' : 'sparkles'} size={18} color="#fff" />
                  <Text style={styles.upgradeButtonText}>{subscriptionPlan === 'Pro' ? t('settings.manageSubscription') : t('settings.upgradePro')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Developer Testing Tools - Only visible to admin account */}
        {__DEV__ && user?.email === 'edwardsjonny547@gmail.com' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{t('settings.developerTools')}</Text>
            <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={styles.devToolButton}
                onPress={async () => {
                  Alert.alert(
                    t('settings.clearCache'),
                    t('settings.clearCacheMessage'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('settings.clearCacheAction'), onPress: async () => {
                        try {
                          await Purchases.invalidateCustomerInfoCache();
                          const customerInfo = await Purchases.getCustomerInfo();
                          const hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
                          Alert.alert(
                            t('settings.cacheCleared'),
                            t('settings.freshStatus', {
                              entitlements: hasEntitlement ? t('settings.active') : t('settings.none'),
                              plan: hasEntitlement ? 'Pro' : t('settings.free'),
                            })
                          );
                        } catch (error: any) {
                          Alert.alert(t('common.error'), error.message);
                        }
                      }}
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="#a855f7" />
                <Text style={[styles.devToolButtonText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('settings.clearCache')}</Text>
              </TouchableOpacity>
              
              <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
              
              <TouchableOpacity
                style={styles.devToolButton}
                onPress={async () => {
                  try {
                    const customerInfo = await Purchases.getCustomerInfo();
                    const hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
                    const entitlementsList = Object.keys(customerInfo.entitlements.active).join(', ') || t('settings.none');
                    Alert.alert(
                      t('settings.subscriptionDebug'),
                      t('settings.subscriptionDebugMessage', {
                        userId: customerInfo.originalAppUserId,
                        entitlements: entitlementsList,
                        plan: hasEntitlement ? 'Pro' : t('settings.free'),
                        purchaseDate: customerInfo.originalPurchaseDate || t('settings.never'),
                        expiration: customerInfo.latestExpirationDate || t('settings.notAvailable'),
                      })
                    );
                  } catch (error: any) {
                    Alert.alert(t('common.error'), error.message);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={[styles.devToolButtonText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('settings.debugInfo')}</Text>
              </TouchableOpacity>
              
              <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />
              
              <TouchableOpacity
                style={styles.devToolButton}
                onPress={async () => {
                  Alert.alert(
                    t('settings.forceReset'),
                    t('settings.forceResetMessage'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('settings.reset'), style: 'destructive', onPress: async () => {
                        try {
                          console.log('[Settings] Force reset initiated');
                          await AsyncStorage.clear();
                          await signOut();
                          console.log('[Settings] Force reset complete');
                        } catch (error: any) {
                          Alert.alert(t('common.error'), error.message);
                        }
                      }}
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={20} color="#ef4444" />
                <Text style={[styles.devToolButtonText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('settings.forceReset')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Send Feedback */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{t('settings.feedback')}</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <TextInput
                style={styles.feedbackInput}
                value={feedbackTitle}
                onChangeText={setFeedbackTitle}
                placeholder={t('settings.feedbackTitle')}
                placeholderTextColor="#666"
              />
              <TextInput
                style={[styles.feedbackInput, styles.feedbackTextArea]}
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                placeholder={t('settings.feedbackPlaceholder')}
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  (!feedbackTitle.trim() || !feedbackMessage.trim() || submittingFeedback) && styles.feedbackButtonDisabled
                ]}
                onPress={handleSubmitFeedback}
                disabled={!feedbackTitle.trim() || !feedbackMessage.trim() || submittingFeedback}
              >
                {submittingFeedback ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={styles.feedbackButtonText}>{t('common.send')}</Text>
                  </>
                )}
              </TouchableOpacity>
              {feedbackSuccess && (
                <View style={styles.feedbackSuccess}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <Text style={styles.feedbackSuccessText}>{t('settings.feedbackThanks')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{t('settings.actions')}</Text>

          <TouchableOpacity style={{}} onPress={handleSignOut} activeOpacity={0.85}>
            <StandardContainer style={styles.card}>
              <View style={styles.cardGradient}>
                <View style={styles.actionRow}>
                  <Ionicons name="log-out" size={20} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>{t('settings.signOut')}</Text>
                </View>
              </View>
            </StandardContainer>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 12 }} 
            onPress={() => {
              // First confirmation
              Alert.alert(
                t('settings.deleteAccountWarning'),
                t('settings.deleteConfirm'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('common.continue'),
                    style: 'destructive',
                    onPress: () => {
                      // Second confirmation - require typing confirmation
                      Alert.alert(
                        t('settings.finalConfirmation'),
                        t('settings.deleteFinal'),
                        [
                          { text: t('common.cancel'), style: 'cancel' },
                          {
                            text: t('settings.deleteEverything'),
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                console.log('[Settings] Starting account deletion...');
                                // Delete user data from Supabase
                                if (user) {
                                  console.log('[Settings] Deleting notes/journal entries...');
                                  const { error: notesError } = await supabase.from('notes').delete().eq('user_id', user.id);
                                  if (notesError) console.error('[Settings] Notes delete error:', notesError);
                                  else console.log('[Settings] ✅ Notes deleted');
                                  
                                  console.log('[Settings] Deleting user profile...');
                                  const { error: profileError } = await supabase.from('user_profiles').delete().eq('user_id', user.id);
                                  if (profileError) console.error('[Settings] Profile delete error:', profileError);
                                  
                                  // Try to delete auth user via RPC, but don't block on it
                                  console.log('[Settings] Attempting to delete auth user...');
                                  try {
                                    const { error: rpcError } = await supabase.rpc('delete_user');
                                    if (rpcError) {
                                      console.error('[Settings] RPC delete_user error (non-blocking):', rpcError);
                                    }
                                  } catch (rpcErr) {
                                    console.error('[Settings] RPC delete_user exception (non-blocking):', rpcErr);
                                  }
                                }
                                
                                console.log('[Settings] Signing out after deletion...');
                                await signOut();
                                Alert.alert(t('settings.accountDeleted'), t('settings.accountDeletedMessage'));
                              } catch (error) {
                                console.error('[Settings] Error deleting account:', error);
                                Alert.alert(t('common.error'), t('settings.deleteFailed'));
                              }
                            }
                          }
                        ]
                      );
                    }
                  }
                ]
              );
            }} 
            activeOpacity={0.85}
          >
            <StandardContainer style={styles.card}>
              <View style={styles.cardGradient}>
                <View style={styles.actionRow}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>{t('settings.deleteAccount')}</Text>
                </View>
              </View>
            </StandardContainer>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{t('settings.about')}</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <Text style={[styles.infoText, { color: theme.colors.primaryText }]}>Insight Mobile v1.0.0</Text>
              <Text style={[styles.infoSubtext, { color: theme.colors.secondaryText }]}>{t('settings.personalJournal')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 48 : 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: isTablet ? 32 : 24,
  },
  sectionTitle: {
    fontSize: isTablet ? sf(22) : sf(20),
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: isTablet ? 16 : 12,
    marginTop: isTablet ? 28 : 20,
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: isTablet ? 20 : 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  cardGradient: {
    padding: isTablet ? 24 : 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: isTablet ? sf(20) : sf(16),
  },
  infoSubtext: {
    fontSize: isTablet ? sf(18) : sf(14),
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 16 : 12,
  },
  actionText: {
    fontSize: isTablet ? sf(20) : sf(16),
    fontWeight: '600',
  },
  actionSubtext: {
    fontSize: isTablet ? sf(17) : sf(13),
    marginTop: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    overflow: 'hidden',
  },
  avatar: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
  },
  avatarPlaceholder: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isTablet ? sf(24) : sf(18),
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: isTablet ? sf(18) : sf(14),
    color: '#999',
  },
  avatarImage: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageLabel: {
    fontSize: isTablet ? sf(18) : sf(14),
  },
  usageTier: {
    fontSize: isTablet ? sf(20) : sf(16),
    fontWeight: '700',
  },
  usageProgress: {
    marginTop: 8,
  },
  usageProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageProgressLabel: {
    fontSize: sf(13),
  },
  usageProgressValue: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  upgradeButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? sf(20) : sf(16),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  feedbackInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    color: '#ffffff',
    fontSize: sf(14),
    marginBottom: 12,
  },
  feedbackTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackButtonDisabled: {
    opacity: 0.5,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  feedbackSuccessText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isTablet ? 16 : 12,
    marginTop: isTablet ? 16 : 12,
  },
  themeOption: {
    width: isTablet ? 90 : 70,
    height: isTablet ? 50 : 40,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  themeOptionActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  themeEmoji: {
    fontSize: sf(32),
  },
  themeLabel: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  themeLabelActive: {
    color: '#8b5cf6',
  },
  themeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  subsectionLabel: {
    fontSize: sf(13),
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accentModeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  accentModeOptionActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  accentModeLabel: {
    fontSize: sf(14),
    fontWeight: '600',
    marginBottom: 4,
  },
  accentModeDesc: {
    fontSize: sf(11),
    fontWeight: '400',
  },
  devToolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  devToolButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  settingIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
