/** Convert internal 1–10 wellbeing to display score out of 100. */
export function wellbeingToDisplay(scoreOutOf10: number): number {
  const clamped = Math.max(1, Math.min(10, Math.round(scoreOutOf10)));
  return clamped * 10;
}

export function wellbeingBadgeLabel(scoreOutOf100: number): string {
  if (scoreOutOf100 >= 70) return 'Great Start';
  if (scoreOutOf100 >= 40) return 'Holding Steady';
  return 'Take Care';
}

export function wellbeingRingColor(scoreOutOf100: number): string {
  if (scoreOutOf100 >= 70) return '#22C55E';
  if (scoreOutOf100 >= 40) return '#E8956D';
  return '#DC2626';
}

export function wellbeingBadgeBg(scoreOutOf100: number, isDark: boolean): string {
  if (scoreOutOf100 >= 70) {
    return isDark ? 'rgba(34, 197, 94, 0.22)' : 'rgba(34, 197, 94, 0.12)';
  }
  if (scoreOutOf100 >= 40) {
    return isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.12)';
  }
  return isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.1)';
}

export function wellbeingBadgeBorder(scoreOutOf100: number, isDark: boolean): string {
  if (scoreOutOf100 >= 70) {
    return isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(34, 197, 94, 0.25)';
  }
  if (scoreOutOf100 >= 40) {
    return isDark ? 'rgba(234, 179, 8, 0.35)' : 'rgba(234, 179, 8, 0.25)';
  }
  return isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
}

export function wellbeingBadgeTextColor(scoreOutOf100: number): string {
  if (scoreOutOf100 >= 70) return '#15803D';
  if (scoreOutOf100 >= 40) return '#B45309';
  return '#DC2626';
}

export function truncateSummary(text: string, maxLen = 110): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const cut = trimmed.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
