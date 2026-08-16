/**
 * Test david@insight.app login against production Supabase.
 * Usage: node scripts/test-david-login.js
 */

require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = 'millie@app.com';
const PASSWORD = 'Millie123';

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  console.log('Testing signInWithPassword for', EMAIL);
  console.log('URL:', SUPABASE_URL);

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (error) {
    console.error('\n❌ LOGIN FAILED');
    console.error('  message:', error.message);
    console.error('  status:', error.status);
    console.error('  code:', error.code);
    console.error('  name:', error.name);
    if (error.message?.toLowerCase().includes('schema') || error.message?.toLowerCase().includes('scheme')) {
      console.error('\n→ This usually means the auth.users row was created via raw SQL');
      console.error('  with missing columns. Re-create the user via Dashboard or fixed SQL.');
    }
    process.exit(1);
  }

  console.log('\n✅ LOGIN SUCCESS');
  console.log('  user id:', data.user?.id);
  console.log('  email:', data.user?.email);

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('username, subscription_tier, email')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (profileError) {
    console.warn('  profile lookup:', profileError.message);
  } else {
    console.log('  profile:', profile);
  }

  await supabase.auth.signOut();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
