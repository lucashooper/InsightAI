import type { MoodTrendPoint } from '../components/analytics/MoodOverTimeChart';

function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** One chart point per calendar day — averages multiple entries on the same day. */
export function buildDailyMoodTrendPoints(notes: any[], maxDays = 14): MoodTrendPoint[] {
  const byDay = new Map<string, any[]>();

  for (const note of notes) {
    const insights = note.ai_structured_insights ?? note.ai_insights;
    const score = insights?.wellbeingScore;
    if (score == null || score <= 0) continue;

    const key = dayKey(note.created_at || note.updated_at || '');
    if (!key) continue;

    const bucket = byDay.get(key) ?? [];
    bucket.push(note);
    byDay.set(key, bucket);
  }

  const sortedDays = [...byDay.keys()].sort().slice(-maxDays);

  return sortedDays.map((key) => {
    const entries = byDay.get(key)!;
    const sorted = [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const latest = sorted[0];
    const insights = latest.ai_structured_insights ?? latest.ai_insights ?? {};

    const avgWellbeing =
      entries.reduce((sum, n) => {
        const s = (n.ai_structured_insights ?? n.ai_insights)?.wellbeingScore ?? 0;
        return sum + s;
      }, 0) / entries.length;

    return {
      id: key,
      date: latest.created_at,
      displayDate: formatDisplayDate(latest.created_at),
      wellbeing: Math.round(avgWellbeing * 10) / 10,
      entryCount: entries.length,
      primaryEmotion: insights.mood_analysis?.primary_emotion,
      entry: latest,
    };
  });
}

export function computeWeeklyMoodStats(points: MoodTrendPoint[]) {
  if (points.length === 0) {
    return { avg: 0, bestIndex: 0, bestDate: '', bestScore: 0 };
  }

  const avg =
    Math.round((points.reduce((s, p) => s + p.wellbeing, 0) / points.length) * 10) / 10;

  let bestIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].wellbeing > points[bestIndex].wellbeing) bestIndex = i;
  }

  const best = points[bestIndex];
  return {
    avg,
    bestIndex,
    bestDate: best.displayDate ?? formatDisplayDate(best.date),
    bestScore: best.wellbeing,
  };
}

export function pickDateLabelIndices(count: number): number[] {
  if (count <= 0) return [];
  if (count <= 5) return Array.from({ length: count }, (_, i) => i);
  if (count <= 8) return [0, Math.floor(count / 2), count - 1];
  const step = Math.max(1, Math.floor((count - 1) / 4));
  const indices = new Set<number>([0, count - 1]);
  for (let i = step; i < count - 1; i += step) indices.add(i);
  indices.add(count - 1);
  return [...indices].sort((a, b) => a - b);
}
