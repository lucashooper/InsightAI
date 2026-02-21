// Comprehensive Supabase diagnostic test
// Run with: node mobile/scripts/testSupabase.js

const { createClient } = require('@supabase/supabase-js');

// Load credentials from app.config.js
const appConfig = require('../app.config.js');

const supabaseUrl = appConfig.default.expo.extra.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = appConfig.default.expo.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== SUPABASE DIAGNOSTIC TEST ===\n');

// Test 1: Check credentials
console.log('Test 1: Checking credentials...');
console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING');
console.log('Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  try {
    // Test 2: Check network connectivity to Supabase
    console.log('\nTest 2: Testing network connectivity...');
    const startTime = Date.now();
    
    try {
      const response = await fetch(supabaseUrl, { method: 'HEAD' });
      const elapsed = Date.now() - startTime;
      console.log(`✅ Network reachable (${elapsed}ms) - Status: ${response.status}`);
    } catch (netError) {
      console.error('❌ Network unreachable:', netError.message);
      return;
    }

    // Test 3: Test auth (should work even with RLS)
    console.log('\nTest 3: Testing auth endpoint...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.log('⚠️  No active session:', error.message);
      } else if (session) {
        console.log('✅ Active session found');
        console.log('   User ID:', session.user.id);
        console.log('   Email:', session.user.email);
      } else {
        console.log('ℹ️  No active session (not logged in)');
      }
    } catch (authError) {
      console.error('❌ Auth test failed:', authError.message);
    }

    // Test 4: Test database query without auth (RLS test)
    console.log('\nTest 4: Testing database query without user context...');
    const queryStart = Date.now();
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
      );
      
      const queryPromise = supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      const queryElapsed = Date.now() - queryStart;
      
      if (error) {
        console.error(`❌ Query failed (${queryElapsed}ms):`, error.message);
        console.error('   Error code:', error.code);
        console.error('   Error hint:', error.hint);
        
        if (error.message.includes('RLS') || error.code === 'PGRST301') {
          console.log('\n⚠️  LIKELY ISSUE: Row Level Security (RLS) is blocking queries');
          console.log('   Solution: Check RLS policies in Supabase dashboard');
        }
      } else {
        console.log(`✅ Query succeeded (${queryElapsed}ms)`);
        console.log('   Result:', data);
      }
    } catch (timeoutError) {
      const queryElapsed = Date.now() - queryStart;
      console.error(`❌ Query timed out (${queryElapsed}ms):`, timeoutError.message);
      console.log('\n⚠️  LIKELY ISSUE: Network connectivity or Supabase project paused');
      console.log('   Solution: Check Supabase dashboard for project status');
    }

    // Test 5: Test with specific user ID (if we have a session)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('\nTest 5: Testing user-specific query with RLS...');
      const userQueryStart = Date.now();
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('User query timeout after 5s')), 5000)
        );
        
        const queryPromise = supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
        const userQueryElapsed = Date.now() - userQueryStart;
        
        if (error) {
          console.error(`❌ User query failed (${userQueryElapsed}ms):`, error.message);
        } else if (data) {
          console.log(`✅ User query succeeded (${userQueryElapsed}ms)`);
          console.log('   Username:', data.username);
          console.log('   Email:', data.email);
        } else {
          console.log(`⚠️  No profile found for user (${userQueryElapsed}ms)`);
        }
      } catch (timeoutError) {
        const userQueryElapsed = Date.now() - userQueryStart;
        console.error(`❌ User query timed out (${userQueryElapsed}ms):`, timeoutError.message);
      }
    }

    // Test 6: Check Supabase REST API directly
    console.log('\nTest 6: Testing Supabase REST API directly...');
    try {
      const restUrl = `${supabaseUrl}/rest/v1/user_profiles?select=count&limit=1`;
      const restStart = Date.now();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('REST API timeout after 5s')), 5000)
      );
      
      const fetchPromise = fetch(restUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const restElapsed = Date.now() - restStart;
      
      console.log(`✅ REST API responded (${restElapsed}ms) - Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('   Response:', data);
      } else if (response.status === 401 || response.status === 403) {
        console.log('⚠️  Authentication/Authorization issue - check RLS policies');
      } else {
        const text = await response.text();
        console.log('   Response:', text);
      }
    } catch (restError) {
      console.error('❌ REST API test failed:', restError.message);
    }

    console.log('\n=== DIAGNOSTIC SUMMARY ===');
    console.log('If queries are timing out: Check Supabase project status in dashboard');
    console.log('If queries fail with RLS errors: Check RLS policies for user_profiles table');
    console.log('If network is unreachable: Check internet connection or Supabase status');
    console.log('\nSupabase Dashboard: https://app.supabase.com/project/_/settings/api');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

runTests();
