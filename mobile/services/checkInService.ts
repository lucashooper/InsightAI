import { supabase } from '../lib/supabase';
import { CheckInDraft, TagCategory } from '../components/checkin/types';

type SupabaseLikeClient = Pick<typeof supabase, 'from'>;

export type StoredCheckIn = CheckInDraft & {
  id: string;
  journalNoteId: string | null;
  createdAt: string | null;
};

export function checkInDraftToRow(
  userId: string,
  draft: CheckInDraft,
  options?: {
    journalTitle?: string;
    journalBody?: string;
    journalNoteId?: string;
    aiSummary?: string;
  },
) {
  return {
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
  };
}

export function checkInRowToDraft(row: any): StoredCheckIn {
  return {
    id: row.id,
    moodScore: row.mood_score,
    moodLabel: row.mood_label,
    moodTier:
      row.mood_score <= 1
        ? 'terrible'
        : row.mood_score === 2
          ? 'struggling'
          : row.mood_score === 3
            ? 'neutral'
            : row.mood_score === 4
              ? 'good'
              : 'amazing',
    feelings: Array.isArray(row.feelings) ? row.feelings : [],
    withWho: Array.isArray(row.with_who) ? row.with_who : [],
    whereAt: Array.isArray(row.where_at) ? row.where_at : [],
    doing: Array.isArray(row.doing) ? row.doing : [],
    journalNoteId: row.journal_note_id ?? null,
    createdAt: row.created_at ?? null,
  };
}

export async function saveCheckIn(
  userId: string,
  draft: CheckInDraft,
  options?: {
    journalTitle?: string;
    journalBody?: string;
    journalNoteId?: string;
    aiSummary?: string;
  },
  client: SupabaseLikeClient = supabase,
) {
  const { data, error } = await client
    .from('check_ins')
    .insert(checkInDraftToRow(userId, draft, options))
    .select()
    .single();

  if (error) throw error;
  return checkInRowToDraft(data);
}

export async function fetchCheckInForNote(
  userId: string,
  journalNoteId: string,
  client: SupabaseLikeClient = supabase,
): Promise<StoredCheckIn | null> {
  const { data, error } = await client
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('journal_note_id', journalNoteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? checkInRowToDraft(data) : null;
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
