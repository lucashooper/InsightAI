/**
 * Verify investor account Pro access against production edge functions.
 * Usage: node scripts/test-investor-entitlements.js
 */

require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = 'millie@app.com';
const PASSWORD = 'Millie123';

async function callFunction(name, token, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error) {
    console.error('Login failed:', error.message);
    process.exit(1);
  }

  const token = data.session.access_token;
  const userId = data.user.id;
  console.log('Logged in:', EMAIL, userId);

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .maybeSingle();
  console.log('Profile tier:', profile?.subscription_tier);

  const groq = await callFunction('groq-proxy', token, {
    messages: [{ role: 'user', content: 'Say hi in one word.' }],
    model: 'openai/gpt-oss-120b',
    max_tokens: 10,
  });
  console.log('\ngroq-proxy:', groq.status, groq.status === 200 ? 'OK' : groq.json);

  const clever = await callFunction('clever-api', token, {
    content: 'Today I felt anxious about work but also grateful for my friends.',
    systemInstruction: 'Respond with JSON: {"summary":"..."}',
  });
  console.log('clever-api:', clever.status, clever.status === 200 ? 'OK' : clever.json);

  await supabase.auth.signOut();

  if (groq.status !== 200 || clever.status !== 200) {
    process.exit(1);
  }
  console.log('\nAll entitlement checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
