/** Convert internal 1–10 wellbeing to display score out of 100. */
export function wellbeingToDisplay(scoreOutOf10: number): number {
  const clamped = Math.max(1, Math.min(10, Math.round(scoreOutOf10)));
  return clamped * 10;
}

export function wellbeingBadgeLabel(scoreOutOf100: number): string {
  if (scoreOutOf100 >= 67) return 'Great Start';
  if (scoreOutOf100 >= 34) return 'Holding Steady';
  return 'Take Care';
}

export function wellbeingRingColor(scoreOutOf100: number): string {
  if (scoreOutOf100 >= 67) return '#34d399';
  if (scoreOutOf100 >= 34) return '#fbbf24';
  return '#f87171';
}

export function wellbeingBadgeBg(scoreOutOf100: number, isDark: boolean): string {
  if (scoreOutOf100 >= 67) {
    return isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(167, 243, 208, 0.55)';
  }
  if (scoreOutOf100 >= 34) {
    return isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(253, 230, 138, 0.55)';
  }
  return isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(254, 202, 202, 0.5)';
}

export function truncateSummary(text: string, maxLen = 110): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const cut = trimmed.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
