/** Investor demo accounts — always entitled on APK even if DB tier drifts to free. */
export const INVESTOR_DEMO_USER_IDS = new Set([
  'a0c3ba5b-c584-48a2-b297-0feaa726fb83', // millie@app.com
]);

export const INVESTOR_DEMO_EMAILS = new Set([
  'millie@app.com',
  'david@insight.app',
  'david.investor@insightdemo.app',
]);

export function isInvestorDemoUser(userId?: string | null, email?: string | null): boolean {
  if (userId && INVESTOR_DEMO_USER_IDS.has(userId)) return true;
  if (email && INVESTOR_DEMO_EMAILS.has(email.toLowerCase())) return true;
  return false;
}
