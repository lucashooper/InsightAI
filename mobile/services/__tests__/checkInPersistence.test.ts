import { describe, expect, it, vi } from 'vitest';
import { CheckInDraft } from '../../components/checkin/types';
import { fetchCheckInForNote, saveCheckIn } from '../checkInService';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));

function createInMemoryCheckInClient() {
  const rows: any[] = [];

  return {
    from(table: string) {
      if (table !== 'check_ins') throw new Error(`Unexpected table: ${table}`);

      return {
        insert(payload: any) {
          const saved = {
            id: `check-in-${rows.length + 1}`,
            created_at: new Date().toISOString(),
            ...payload,
          };
          rows.push(saved);
          return {
            select: () => ({
              single: async () => ({ data: saved, error: null }),
            }),
          };
        },
        select() {
          const filters: Record<string, unknown> = {};
          const query: any = {
            eq(column: string, value: unknown) {
              filters[column] = value;
              return query;
            },
            order() {
              return query;
            },
            limit() {
              return query;
            },
            async maybeSingle() {
              const matches = rows.filter((row) =>
                Object.entries(filters).every(([column, value]) => row[column] === value),
              );
              return { data: matches.at(-1) ?? null, error: null };
            },
          };
          return query;
        },
      };
    },
  };
}

describe('linked check-in persistence', () => {
  it('retains mood and feelings after an entry is left and reloaded', async () => {
    const client = createInMemoryCheckInClient();
    const userId = 'user-1';
    const entry = { id: 'entry-1', title: 'A difficult afternoon' };
    const draft: CheckInDraft = {
      moodScore: 2,
      moodLabel: 'Struggling',
      moodTier: 'struggling',
      feelings: ['Stressed'],
      withWho: [],
      whereAt: ['Home'],
      doing: [],
    };

    await saveCheckIn(
      userId,
      draft,
      { journalNoteId: entry.id, journalTitle: entry.title },
      client as any,
    );

    // Simulate leaving CreateEntry: the route-only draft no longer exists.
    const reloadedCheckIn = await fetchCheckInForNote(userId, entry.id, client as any);

    expect(reloadedCheckIn).toMatchObject({
      journalNoteId: entry.id,
      moodScore: 2,
      moodLabel: 'Struggling',
      moodTier: 'struggling',
      feelings: ['Stressed'],
      whereAt: ['Home'],
    });
  });
});
