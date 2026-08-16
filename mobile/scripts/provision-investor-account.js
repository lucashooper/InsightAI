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

/**
 * Provision Millie Smith demo account (David's data) in Supabase.
 *
 * Usage (from mobile/):
 *   node scripts/provision-investor-account.js
 *
 * Login (email or username "Millie"):
 *   millie@app.com / Millie123
 *
 * Same user_id as the original investor demo — journal entries are preserved.
 */

const DEMO_EMAIL = 'millie@app.com';
const DEMO_USERNAME = 'Millie Smith';
const DEMO_PASSWORD = 'Millie123';

const LEGACY_EMAILS = ['david@insight.app', 'david.investor@insightdemo.app'];

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

async function findLegacyDemoUser(admin) {
  for (const email of LEGACY_EMAILS) {
    const user = await findUserByEmail(admin, email);
    if (user) return user;
  }
  return null;
}

async function upsertProfile(admin, userId) {
  const { error } = await admin.from('user_profiles').upsert(
    {
      user_id: userId,
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      subscription_tier: 'unlimited',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}

function sanitizeServiceKey(raw) {
  const cleaned = raw.replace(/\s+/g, '').replace(/^y(?=eyJ)/i, '');
  const jwtMatch = cleaned.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  return jwtMatch ? jwtMatch[0] : cleaned;
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
    console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Provisioning demo persona:', DEMO_USERNAME, `(${DEMO_EMAIL})`);

  let user = await findUserByEmail(admin, DEMO_EMAIL);
  const legacyUser = user ? null : await findLegacyDemoUser(admin);

  if (legacyUser && !user) {
    console.log('Migrating legacy demo account →', legacyUser.email);
    const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(legacyUser.id, {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { username: DEMO_USERNAME, display_name: DEMO_USERNAME },
    });
    if (updateError) {
      console.error('Failed to migrate legacy user:', updateError.message);
      process.exit(1);
    }
    user = updated.user;
    console.log('Legacy account updated — same user_id, entries preserved');
  } else if (!user) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { username: DEMO_USERNAME, display_name: DEMO_USERNAME },
    });

    if (createError) {
      console.error('Failed to create user:', createError.message);
      process.exit(1);
    }
    user = created.user;
    console.log('Created new auth user');
  } else {
    console.log('User already exists — resetting password & profile');
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { username: DEMO_USERNAME, display_name: DEMO_USERNAME },
    });
    if (updateError) {
      console.error('Failed to update password:', updateError.message);
      process.exit(1);
    }
  }

  await upsertProfile(admin, user.id);
  console.log('Profile tier: unlimited');

  console.log('');
  console.log('✅ Demo account ready');
  console.log('   Name:', DEMO_USERNAME);
  console.log('   Email:', DEMO_EMAIL);
  console.log('   Username: Millie (also works on login screen)');
  console.log('   Password:', DEMO_PASSWORD);
  console.log('   User ID:', user.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
