import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  profile_picture_url: string;
  bio?: string;
  has_completed_welcome: boolean;
  created_at: string;
  updated_at: string;
}

export const userProfileService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  // Create user profile
  async createUserProfile(
    userId: string,
    username: string,
    email: string
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        username,
        email,
        profile_picture_url: '/Ocean-Swirl.webp',
        has_completed_welcome: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  },

  // Mark welcome as completed
  async completeWelcome(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ has_completed_welcome: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error completing welcome:', error);
      return false;
    }

    return true;
  },

  // Upload profile picture
  async uploadProfilePicture(
    userId: string,
    file: File
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update user profile with new picture URL
      await this.updateUserProfile(userId, {
        profile_picture_url: data.publicUrl,
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadProfilePicture:', error);
      return null;
    }
  },
};
