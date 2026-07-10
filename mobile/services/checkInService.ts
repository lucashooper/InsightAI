import { supabase } from '../lib/supabase';
import { CheckInDraft, TagCategory } from '../components/checkin/types';

export async function saveCheckIn(
  userId: string,
  draft: CheckInDraft,
  options?: {
    journalTitle?: string;
    journalBody?: string;
    journalNoteId?: string;
    aiSummary?: string;
  },
) {
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: userId,
      mood_score: draft.moodScore,
      mood_label: draft.moodLabel,
      feelings: draft.feelings,
      with_who: draft.withWho,
      where_at: draft.whereAt,
      doing: draft.doing,
      journal_title: options?.journalTitle ?? null,
      journal_body: options?.journalBody ?? null,
      journal_note_id: options?.journalNoteId ?? null,
      ai_summary: options?.aiSummary ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchCustomTags(userId: string, category: TagCategory): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_custom_tags')
    .select('tag')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []).map((row: { tag: string }) => row.tag);
}

export async function addCustomTag(userId: string, category: TagCategory, tag: string) {
  const trimmed = tag.trim();
  if (!trimmed) return;
  await supabase
    .from('user_custom_tags')
    .upsert({ user_id: userId, category, tag: trimmed }, { onConflict: 'user_id,category,tag' });
}
