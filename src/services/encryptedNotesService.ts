import { supabase } from './supabaseClient';
import { encryptionService } from './encryptionService';
import { userProfileService } from './userProfileService';
import type { DiaryEntry } from '../types/diary';

/**
 * Encrypted Notes Service
 * 
 * Wraps notesService with automatic encryption/decryption
 * - Encrypts notes before storing
 * - Decrypts notes after fetching
 * - Falls back to plaintext for users without encryption
 */

export const encryptedNotesService = {
  /**
   * Check if current user has encryption enabled
   */
  async isEncryptionEnabled(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const profile = await userProfileService.getUserProfile(user.id);
    return profile?.encryption_enabled === true;
  },

  /**
   * Fetch all notes (automatically decrypts if needed)
   */
  async getNotes(): Promise<DiaryEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    if (!data) return [];

    // Check if encryption is active
    const isEncrypted = await this.isEncryptionEnabled();
    
    if (!isEncrypted || !encryptionService.isEncryptionActive()) {
      // No encryption or vault locked - return plaintext
      return data;
    }

    // Decrypt notes
    const decryptedNotes: DiaryEntry[] = [];
    
    for (const note of data) {
      try {
        // Check if note has encrypted data
        if (note.encrypted_content) {
          const decrypted = await encryptionService.decryptNote(note.encrypted_content);
          decryptedNotes.push({
            ...note,
            title: decrypted.title,
            content: decrypted.content,
            ai_insights: decrypted.ai_insights,
            encrypted_content: undefined // Remove encrypted field
          });
        } else {
          // Plaintext note (legacy or non-encrypted)
          decryptedNotes.push(note);
        }
      } catch (error) {
        console.error(`Failed to decrypt note ${note.id}:`, error);
        // Skip corrupted notes
      }
    }

    console.log(`✅ Loaded ${decryptedNotes.length} notes (${isEncrypted ? 'encrypted' : 'plaintext'})`);
    return decryptedNotes;
  },

  /**
   * Create a new note (automatically encrypts if needed)
   */
  async createNote(title: string, content: string): Promise<DiaryEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const isEncrypted = await this.isEncryptionEnabled();

    if (isEncrypted && encryptionService.isEncryptionActive()) {
      // Encrypt note before storing
      const noteData = { title, content };
      const encryptedContent = await encryptionService.encryptNote(noteData);

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: '[Encrypted]', // Placeholder title
          content: '[Encrypted content]', // Placeholder content
          encrypted_content: encryptedContent,
          user_id: user.id,
          mood_score: 5
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating encrypted note:', error);
        throw error;
      }

      // Return with decrypted data for client
      return {
        ...data,
        title,
        content,
        encrypted_content: undefined
      };
    } else {
      // Store plaintext (encryption disabled or vault locked)
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title,
          content,
          user_id: user.id,
          mood_score: 5
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }

      return data;
    }
  },

  /**
   * Update a note (automatically encrypts if needed)
   */
  async updateNote(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const isEncrypted = await this.isEncryptionEnabled();

    if (isEncrypted && encryptionService.isEncryptionActive()) {
      // Encrypt updated content
      const noteData = {
        title: updates.title || '',
        content: updates.content || '',
        ai_insights: updates.ai_insights
      };
      
      const encryptedContent = await encryptionService.encryptNote(noteData);

      const { data, error } = await supabase
        .from('notes')
        .update({
          encrypted_content: encryptedContent,
          title: '[Encrypted]',
          content: '[Encrypted content]',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating encrypted note:', error);
        throw error;
      }

      // Return with decrypted data
      return {
        ...data,
        title: noteData.title,
        content: noteData.content,
        ai_insights: noteData.ai_insights,
        encrypted_content: undefined
      };
    } else {
      // Update plaintext
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating note:', error);
        throw error;
      }

      return data;
    }
  },

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  /**
   * Save AI insights (encrypts with note data)
   */
  async saveAIInsights(id: string, insights: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    // Fetch existing note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !note) {
      throw new Error('Note not found');
    }

    const isEncrypted = await this.isEncryptionEnabled();

    if (isEncrypted && encryptionService.isEncryptionActive()) {
      // Decrypt existing note
      let noteData: { title: string; content: string; ai_insights?: any };
      if (note.encrypted_content) {
        noteData = await encryptionService.decryptNote(note.encrypted_content);
      } else {
        noteData = {
          title: note.title,
          content: note.content,
          ai_insights: undefined
        };
      }

      // Add insights
      noteData.ai_insights = insights;

      // Re-encrypt with insights
      const encryptedContent = await encryptionService.encryptNote(noteData);

      const { error } = await supabase
        .from('notes')
        .update({
          encrypted_content: encryptedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } else {
      // Update plaintext
      const { error } = await supabase
        .from('notes')
        .update({
          ai_insights: insights,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    }
  }
};
