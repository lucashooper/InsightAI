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
