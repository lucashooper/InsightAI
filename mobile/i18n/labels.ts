export function normalizeLabelKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export function translateMachineLabel(
  t: (key: string) => string,
  namespace: string,
  value?: string | null,
): string {
  if (!value) return '';
  const key = `${namespace}.${normalizeLabelKey(value)}`;
  const translated = t(key);
  return translated === key ? value : translated;
}

/** Display-time label for canonical English emotion keys stored in AI analysis. */
export function translateEmotion(
  t: (key: string) => string,
  emotion?: string | null,
): string {
  return translateMachineLabel(t, 'emotions', emotion);
}
