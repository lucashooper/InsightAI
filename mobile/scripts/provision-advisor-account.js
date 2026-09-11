const fs = require('fs');
const path = require('path');

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

/**
 * Create / refresh a VIP tester account that skips onboarding and paywall.
 *
 * Usage (from mobile/):
 *   node scripts/provision-advisor-account.js
 *
 * Login:
 *   amy@insight.app / Password123!
 */

const VIP_EMAIL = 'amy@insight.app';
const VIP_USERNAME = 'Amy';
const VIP_PASSWORD = 'Password123!';

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

async function upsertProfile(admin, userId) {
  const payload = {
    user_id: userId,
    username: VIP_USERNAME,
    email: VIP_EMAIL,
    subscription_tier: 'unlimited',
    onboarding_completed_at: new Date().toISOString(),
    has_completed_welcome: true,
    updated_at: new Date().toISOString(),
  };

  let { error } = await admin.from('user_profiles').upsert(payload, { onConflict: 'user_id' });
  if (error) {
    delete payload.has_completed_welcome;
    delete payload.onboarding_completed_at;
    const retry = await admin.from('user_profiles').upsert(payload, { onConflict: 'user_id' });
    error = retry.error;
  }
  if (error) throw error;
}

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    readEnvFile('SUPABASE_URL') ||
    readEnvFile('EXPO_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = sanitizeServiceKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY || readEnvFile('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in mobile/.env');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Provisioning VIP tester:', VIP_EMAIL);

  let user = await findUserByEmail(admin, VIP_EMAIL);

  if (!user) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: VIP_EMAIL,
      password: VIP_PASSWORD,
      email_confirm: true,
      user_metadata: { username: VIP_USERNAME, display_name: VIP_USERNAME },
    });
    if (createError) {
      console.error('Failed to create user:', createError.message);
      process.exit(1);
    }
    user = created.user;
    console.log('Created confirmed auth user');
  } else {
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: VIP_PASSWORD,
      email_confirm: true,
      user_metadata: { username: VIP_USERNAME, display_name: VIP_USERNAME },
    });
    if (updateError) {
      console.error('Failed to update user:', updateError.message);
      process.exit(1);
    }
    console.log('Auth user already existed — password reset and email confirmed');
  }

  await upsertProfile(admin, user.id);
  console.log('Profile: username=Amy, subscription_tier=unlimited (bypasses paywall)');
  console.log('Onboarding: username present → app skips quiz/paywall on login');

  console.log('');
  console.log('VIP account ready');
  console.log('  Email:', VIP_EMAIL);
  console.log('  Username:', VIP_USERNAME);
  console.log('  Password:', VIP_PASSWORD);
  console.log('  User ID:', user.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
