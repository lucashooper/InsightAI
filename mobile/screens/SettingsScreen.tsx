import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemeName } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StandardContainer from '../components/shared/StandardContainer';
import PageHeader from '../components/shared/PageHeader';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
}

export default function SettingsScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { theme, themeName, setTheme } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(2);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const defaultThemes: { name: ThemeName; label: string; emoji: string }[] = [
    { name: 'dark', label: 'Dark', emoji: '🌑' },
    { name: 'light', label: 'Light', emoji: '☀️' },
  ];

  const otherThemes: { name: ThemeName; label: string; emoji: string }[] = [
    { name: 'sunset', label: 'Sunset', emoji: '🌅' },
    { name: 'vibrant', label: 'Vibrant', emoji: '✨' },
    { name: 'ocean', label: 'Ocean', emoji: '�' },
    { name: 'midnight', label: 'Midnight', emoji: '🌙' },
  ];

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUsageStats();
    }
  }, [user]);

  const handleEditUsername = () => {
    Alert.prompt(
      'Edit Name',
      'Enter your new name',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Save',
          onPress: async (newName?: string) => {
            if (!newName || !newName.trim()) return;
            
            try {
              console.log('[Settings] Updating username to:', newName);
              const { error } = await supabase
                .from('user_profiles')
                .update({ username: newName.trim() })
                .eq('user_id', user?.id);
              
              if (error) {
                console.error('[Settings] Error updating username:', error);
                Alert.alert('Error', 'Failed to update name. Please try again.');
              } else {
                console.log('[Settings] ✅ Username updated successfully');
                // Reload profile to show new name
                loadUserProfile();
                Alert.alert('Success', 'Your name has been updated!');
              }
            } catch (err) {
              console.error('[Settings] Exception updating username:', err);
              Alert.alert('Error', 'Failed to update name. Please try again.');
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
        // Use fallback profile on error
        setUserProfile({
          id: user.id,
          email: user.email || '',
          username: user.email?.split('@')[0] || 'User',
          profile_picture_url: null
        });
      } else if (data) {
        console.log('✅ Profile loaded successfully:', data.username, data.profile_picture_url);
        // Only use profile picture if it's a valid URL (starts with http/https)
        const validProfilePicture = data.profile_picture_url && 
          (data.profile_picture_url.startsWith('http://') || data.profile_picture_url.startsWith('https://'))
          ? data.profile_picture_url
          : null;
        setUserProfile({
          id: data.id,
          email: data.email,
          username: data.username,
          profile_picture_url: validProfilePicture,
        });
      } else {
        // No profile found - likely RLS blocking the query
        console.log('⚠️ No profile found (RLS may be blocking SELECT). Using fallback.');
        console.log('Note: Profile exists on desktop but mobile cannot read it due to RLS policy.');
        setUserProfile({
          id: user.id,
          email: user.email || '',
          username: user.email?.split('@')[0] || 'User',
          profile_picture_url: null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Use fallback profile
      setUserProfile({
        id: user.id,
        email: user.email || '',
        username: user.email?.split('@')[0] || 'User',
        profile_picture_url: null
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

  const handleProfilePictureUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
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

        // Try to update user profile (match desktop by using user_id)
        // Only update the picture URL so we don't overwrite existing username/email
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert(
            {
              user_id: user.id,
              profile_picture_url: urlData.publicUrl,
            },
            { onConflict: 'user_id' }
          );

        if (updateError) {
          console.log('Could not save to database, updating local state only:', updateError);
        }

        // Update local state regardless
        setUserProfile(prev => prev ? { ...prev, profile_picture_url: urlData.publicUrl } : null);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Upload Failed', 'Could not upload profile picture.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTitle.trim() || !feedbackMessage.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and message');
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
      Alert.alert('Error', error?.message || 'Failed to submit feedback. Please try again.');
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

      Alert.alert('Success', `Synced ${data?.length || 0} strategies from cloud`);
      console.log('📥 Synced strategies:', data);
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
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

      <PageHeader title="Settings" />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>Profile</Text>
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
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <TouchableOpacity onPress={handleEditUsername}>
                    <Text style={[styles.profileName, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>{user?.user_metadata?.username || userProfile?.username || 'User'}</Text>
                  </TouchableOpacity>
                  <Text style={[styles.profileEmail, { color: theme.name === 'light' ? '#6B6B6B' : 'rgba(255, 255, 255, 0.6)' }]}>{user?.email}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>


        {/* Default Themes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>🎨 Default Themes</Text>
          <View style={styles.themeGrid}>
            {defaultThemes.map((t) => (
              <TouchableOpacity
                key={t.name}
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  themeName === t.name && styles.themeOptionActive
                ]}
                onPress={() => setTheme(t.name)}
              >
                <Text style={styles.themeEmoji}>{t.emoji}</Text>
                <Text style={[
                  styles.themeLabel,
                  themeName === t.name && styles.themeLabelActive
                ]}>
                  {t.label}
                </Text>
                {themeName === t.name && (
                  <View style={styles.themeCheckmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Themes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>✨ Other Themes</Text>
          <View style={styles.themeGrid}>
            {otherThemes.map((t) => (
              <TouchableOpacity
                key={t.name}
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  themeName === t.name && styles.themeOptionActive
                ]}
                onPress={() => setTheme(t.name)}
              >
                <Text style={styles.themeEmoji}>{t.emoji}</Text>
                <Text style={[
                  styles.themeLabel,
                  themeName === t.name && styles.themeLabelActive
                ]}>
                  {t.label}
                </Text>
                {themeName === t.name && (
                  <View style={styles.themeCheckmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subscription & Usage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>💎 Subscription & Usage</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Current Plan</Text>
                <Text style={styles.usageTier}>Free</Text>
              </View>
              <View style={styles.usageProgress}>
                <View style={styles.usageProgressRow}>
                  <Text style={styles.usageProgressLabel}>AI Analyses Today</Text>
                  <Text style={styles.usageProgressValue}>{usageCount} / {usageLimit}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(usageCount / usageLimit) * 100}%` }
                    ]}
                  />
                </View>
              </View>
              
              {/* Upgrade Button */}
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#a855f7', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeGradient}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Send Feedback */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>💬 Send Feedback</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <TextInput
                style={styles.feedbackInput}
                value={feedbackTitle}
                onChangeText={setFeedbackTitle}
                placeholder="Title"
                placeholderTextColor="#666"
              />
              <TextInput
                style={[styles.feedbackInput, styles.feedbackTextArea]}
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                placeholder="Your feedback..."
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
                    <Text style={styles.feedbackButtonText}>Send</Text>
                  </>
                )}
              </TouchableOpacity>
              {feedbackSuccess && (
                <View style={styles.feedbackSuccess}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <Text style={styles.feedbackSuccessText}>Thank you! Feedback sent.</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.name === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)' }]}>Actions</Text>

          <TouchableOpacity style={{}} onPress={handleSignOut} activeOpacity={0.85}>
            <StandardContainer style={styles.card}>
              <View style={styles.cardGradient}>
                <View style={styles.actionRow}>
                  <Ionicons name="log-out" size={20} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Sign Out</Text>
                </View>
              </View>
            </StandardContainer>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 12 }} 
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your journal entries, insights, and personal data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Delete user data from Supabase
                        if (user) {
                          // Delete user's journal entries
                          await supabase.from('journal_entries').delete().eq('user_id', user.id);
                          // Delete user's profile
                          await supabase.from('user_profiles').delete().eq('user_id', user.id);
                          // Delete the auth user
                          const { error } = await supabase.rpc('delete_user');
                          if (error) throw error;
                        }
                        Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                        await signOut();
                      } catch (error) {
                        console.error('Error deleting account:', error);
                        Alert.alert('Error', 'Failed to delete account. Please contact support at support@myinsightai.app');
                      }
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
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete Account</Text>
                </View>
              </View>
            </StandardContainer>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
            <View style={styles.cardGradient}>
              <Text style={styles.infoText}>Insight Mobile v1.0.0</Text>
              <Text style={styles.infoSubtext}>Your Personal AI Journal</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  cardGradient: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageLabel: {
    fontSize: 14,
    color: '#999',
  },
  usageTier: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
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
    fontSize: 13,
    color: '#999',
  },
  usageProgressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
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
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  feedbackInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
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
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  themeOptionActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  themeEmoji: {
    fontSize: 32,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  themeLabelActive: {
    color: '#8b5cf6',
  },
  themeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
