/**
 * Grant unlimited tier to founder dev account.
 *
 * Usage (from mobile/):
 *   node scripts/provision-dev-account.js
 */
const fs = require('fs');
const path = require('path');

const DEV_EMAIL = 'edwardsjonny547@gmail.com';

function readEnvFile(key) {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return undefined;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq).trim() === key) return trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return undefined;
}

function sanitizeServiceKey(raw) {
  const cleaned = raw.replace(/\s+/g, '').replace(/^y(?=eyJ)/i, '');
  const jwtMatch = cleaned.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  return jwtMatch ? jwtMatch[0] : cleaned;
}

async function findUserByEmail(admin, email) {
  const normalized = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function main() {
  const supabaseUrl =
    readEnvFile('EXPO_PUBLIC_SUPABASE_URL') || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = sanitizeServiceKey(
    readEnvFile('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  );

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in mobile/.env');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const user = await findUserByEmail(admin, DEV_EMAIL);
  if (!user) {
    console.error(`No auth user found for ${DEV_EMAIL}`);
    process.exit(1);
  }

  console.log('Found user:', user.id, user.email);

  const { data: existingProfile } = await admin
    .from('user_profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle();

  const username =
    existingProfile?.username
    || user.user_metadata?.username
    || user.email?.split('@')[0]
    || 'dev';

  const { error } = await admin.from('user_profiles').upsert(
    {
      user_id: user.id,
      username,
      email: DEV_EMAIL,
      subscription_tier: 'unlimited',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to upsert profile:', error.message);
    process.exit(1);
  }

  console.log(`✅ ${DEV_EMAIL} provisioned with subscription_tier=unlimited`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
