/** Internal dev / founder accounts — entitled in all builds (Expo Go, TestFlight, production). */
export const DEV_ACCOUNT_EMAILS = new Set([
  'edwardsjonny547@gmail.com',
]);

export function isDevAccountEmail(email?: string | null): boolean {
  if (!email) return false;
  return DEV_ACCOUNT_EMAILS.has(email.toLowerCase());
}

export function isDevAccount(userId?: string | null, email?: string | null): boolean {
  return isDevAccountEmail(email);
}
