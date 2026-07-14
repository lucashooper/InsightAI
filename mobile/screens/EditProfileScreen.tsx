import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePreloadedData } from '../contexts/PreloadContext';
import { supabase } from '../lib/supabase';
import { isTablet, sf } from '../utils/responsive';
import { useLanguage } from '../contexts/LanguageContext';

// Inline base64 to ArrayBuffer decoder (avoids broken base64-arraybuffer package)
function decodeBase64(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const len = base64.length;
  let bufferLength = Math.floor(len * 3 / 4);
  if (base64[len - 1] === '=') bufferLength--;
  if (base64[len - 2] === '=') bufferLength--;
  const arraybuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arraybuffer);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e0 = lookup[base64.charCodeAt(i)];
    const e1 = lookup[base64.charCodeAt(i + 1)];
    const e2 = lookup[base64.charCodeAt(i + 2)];
    const e3 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (e0 << 2) | (e1 >> 4);
    bytes[p++] = ((e1 & 15) << 4) | (e2 >> 2);
    bytes[p++] = ((e2 & 3) << 6) | (e3 & 63);
  }
  return arraybuffer;
}

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { refreshProfile } = usePreloadedData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<{ username?: string; profile_picture_url?: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user?.id) {
        console.log('[EditProfile] No user found');
        return;
      }

      console.log('[EditProfile] Loading profile for user:', user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, profile_picture_url')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[EditProfile] Profile query result:', { data, error });

      if (error) {
        console.error('[EditProfile] Error from Supabase:', error);
        throw error;
      }

      if (data) {
        console.log('[EditProfile] Profile data found:', data);
        setLoadedProfile(data); // Store for later reference
        const names = data.username?.split(' ') || [];
        setFirstName(names[0] || '');
        setLastName(names.slice(1).join(' ') || '');
        // Only use profile_picture_url if it's a valid HTTP(S) URL, not a relative path like '/Ocean-Swirl.webp'
        const pfpUrl = data.profile_picture_url?.trim();
        const isValidUrl = pfpUrl && (pfpUrl.startsWith('http://') || pfpUrl.startsWith('https://'));
        setProfilePicture(isValidUrl ? pfpUrl : null);
      } else {
        console.log('[EditProfile] No profile data found, using fallback');
        // Fallback to user email
        const emailName = user.email?.split('@')[0] || '';
        setFirstName(emailName);
        setLastName('');
        setProfilePicture(null);
      }
    } catch (error) {
      console.error('[EditProfile] Error loading profile:', error);
      // Fallback on error
      const emailName = user?.email?.split('@')[0] || '';
      setFirstName(emailName);
      setLastName('');
      setProfilePicture(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      console.log('[EditProfile] 📸 Opening image picker...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      console.log('[EditProfile] Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[EditProfile] Permission status:', status);
      
      if (status !== 'granted') {
        console.log('[EditProfile] Permission denied');
        Alert.alert(t('auxiliary.editProfile.permissionNeeded'), t('auxiliary.editProfile.permissionMessage'));
        return;
      }

      console.log('[EditProfile] Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('[EditProfile] Image picker result:', result.canceled ? 'cancelled' : 'selected');
      
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('[EditProfile] Image selected, URI:', uri);
        await uploadProfilePicture(uri);
      } else {
        console.log('[EditProfile] User cancelled image selection');
      }
    } catch (error) {
      console.error('[EditProfile] ❌ Error in handleChangePhoto:', error);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.editProfile.pickerFailed'));
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    try {
      console.log('[EditProfile] 🚀 Starting profile picture upload...');
      console.log('[EditProfile] URI:', uri);
      console.log('[EditProfile] User ID:', user?.id);
      
      if (!user?.id) {
        console.error('[EditProfile] ❌ No user ID found');
        return;
      }

      setSaving(true);

      console.log('[EditProfile] 📥 Reading image file with FileSystem...');
      // Read the file as base64 using legacy FileSystem API
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('[EditProfile] ✅ File read as base64, length:', base64.length);
      
      // Convert base64 to ArrayBuffer
      const arrayBuffer = decodeBase64(base64);
      console.log('[EditProfile] ✅ ArrayBuffer created, byteLength:', arrayBuffer.byteLength);
      
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExt}`;
      console.log('[EditProfile] 📁 File name:', fileName);

      console.log('[EditProfile] ☁️ Uploading to Supabase storage...');
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('[EditProfile] ❌ Upload error:', uploadError);
        throw uploadError;
      }
      console.log('[EditProfile] ✅ Upload successful');

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      
      console.log('[EditProfile] 🔗 Public URL:', publicUrl);

      // Verify the file is actually accessible
      console.log('[EditProfile] 🔍 Verifying file is accessible...');
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' });
        console.log('[EditProfile] ✅ File accessibility check - Status:', testResponse.status);
        if (!testResponse.ok) {
          console.error('[EditProfile] ⚠️ File not accessible, status:', testResponse.status);
          throw new Error(`File uploaded but not accessible (HTTP ${testResponse.status})`);
        }
      } catch (verifyError: any) {
        console.error('[EditProfile] ❌ File verification failed:', verifyError);
        throw new Error('File uploaded but cannot be accessed. Please check bucket permissions.');
      }

      console.log('[EditProfile] 💾 Upserting to user_profiles table...');
      // Build upsert data - include username to avoid NOT NULL constraint violation
      // Use current form values if valid, otherwise use existing profile username, or email fallback
      let currentUsername = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!currentUsername || currentUsername === 'First Last') {
        // If form fields are empty or default, use existing profile username or email
        currentUsername = loadedProfile?.username || user.email?.split('@')[0] || 'User';
      }
      console.log('[EditProfile] Using username for upsert:', currentUsername);
      
      const upsertData: any = {
        user_id: user.id,
        username: currentUsername,
        profile_picture_url: publicUrl,
        updated_at: new Date().toISOString()
      };
      
      // Only include email if it exists
      if (user.email) {
        upsertData.email = user.email;
      }
      
      console.log('[EditProfile] Upsert data:', upsertData);
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert(upsertData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (updateError) {
        console.error('[EditProfile] ❌ Database upsert error:', updateError);
        throw updateError;
      }
      console.log('[EditProfile] ✅ Database upserted');

      console.log('[EditProfile] 🎨 Setting local state to:', publicUrl);
      setProfilePicture(publicUrl);
      
      await AsyncStorage.setItem(`CACHED_PROFILE_PICTURE_${user.id}`, publicUrl);
      await AsyncStorage.setItem('CACHED_PROFILE_PICTURE', publicUrl);
      await refreshProfile(user.id);
      
      console.log('[EditProfile] 🎉 Profile picture upload complete!');
      Alert.alert(t('auxiliary.common.success'), t('auxiliary.editProfile.photoUpdated'));
    } catch (error: any) {
      console.error('[EditProfile] ❌ ERROR uploading profile picture:', error);
      console.error('[EditProfile] Error details:', JSON.stringify(error, null, 2));
      Alert.alert(t('auxiliary.common.error'), error.message || t('auxiliary.editProfile.uploadFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const username = `${firstName.trim()} ${lastName.trim()}`.trim();

      console.log('[EditProfile] Upserting username:', username);
      
      // Build upsert data
      const upsertData: any = {
        user_id: user.id,
        username,
        updated_at: new Date().toISOString()
      };
      
      // Only include email if it exists
      if (user.email) {
        upsertData.email = user.email;
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert(upsertData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('[EditProfile] Error upserting username:', error);
        throw error;
      }

      console.log('[EditProfile] Username upserted successfully');
      await AsyncStorage.setItem(`CACHED_USERNAME_${user.id}`, username);
      await AsyncStorage.setItem('CACHED_USERNAME', username);
      await refreshProfile(user.id);
      Alert.alert(t('auxiliary.common.success'), t('auxiliary.editProfile.profileUpdated'));
      navigation.goBack();
    } catch (error: any) {
      console.error('[EditProfile] Error saving profile:', error);
      Alert.alert(t('auxiliary.common.error'), error.message || t('auxiliary.editProfile.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>{t('auxiliary.editProfile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity 
            style={styles.profilePictureContainer}
            onPress={handleChangePhoto}
            disabled={saving}
            activeOpacity={0.7}
          >
            {profilePicture && profilePicture.trim() !== '' ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person-circle-outline" size={100} color={theme.colors.secondaryText} />
              </View>
            )}
            <View 
              style={[styles.editPhotoButton, { backgroundColor: theme.colors.background }]}
            >
              <Ionicons name="pencil" size={16} color={theme.colors.primaryText} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangePhoto} disabled={saving}>
            <Text style={[styles.changePhotoText, { color: theme.colors.secondaryText }]}>
              {t('auxiliary.editProfile.changePhoto')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.secondaryText }]}>{t('auxiliary.editProfile.firstName')}</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.cardBackground, 
                color: theme.colors.primaryText,
                borderColor: theme.colors.border 
              }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('auxiliary.editProfile.firstName')}
              placeholderTextColor={theme.colors.secondaryText}
              editable={!saving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.secondaryText }]}>{t('auxiliary.editProfile.lastName')}</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.cardBackground, 
                color: theme.colors.primaryText,
                borderColor: theme.colors.border 
              }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('auxiliary.editProfile.lastName')}
              placeholderTextColor={theme.colors.secondaryText}
              editable={!saving}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('auxiliary.common.continue')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: sf(20),
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicturePlaceholderText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: sf(15),
    fontWeight: '500',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: sf(14),
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: sf(16),
    borderWidth: 1,
  },
  saveButton: {
    marginTop: 40,
    height: 56,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
  },
});
