/**
 * Email Test Script
 * 
 * This script tests the Supabase email configuration and SMTP connection to Resend.
 * Run this with: node scripts/testEmail.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://ptpqvghlaesyrzlljzkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cHF2Z2hsYWVzeXJ6bGxqemtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDc4MzEsImV4cCI6MjA2ODY4MzgzMX0.dmkb2_Hdf0vQwirOwJKX4ssfr0ltA1eIZ5_v1s5p6DE';

// Test email address - CHANGE THIS TO YOUR EMAIL
const TEST_EMAIL = 'edwardsjonny547@gmail.com';

console.log('='.repeat(60));
console.log('SUPABASE EMAIL TEST SCRIPT');
console.log('='.repeat(60));
console.log('');

console.log('Configuration:');
console.log(`  Supabase URL: ${SUPABASE_URL}`);
console.log(`  Test Email: ${TEST_EMAIL}`);
console.log('');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPasswordReset() {
  console.log('Test 1: Password Reset Email');
  console.log('-'.repeat(60));
  
  try {
    console.log(`Sending password reset email to: ${TEST_EMAIL}`);
    console.log('Expected email content: 6-digit recovery code');
    console.log('');
    
    const startTime = Date.now();
    const { data, error } = await supabase.auth.resetPasswordForEmail(TEST_EMAIL);
    const duration = Date.now() - startTime;
    
    console.log(`Request completed in ${duration}ms`);
    console.log('');
    
    if (error) {
      console.error('❌ ERROR:', error.message);
      console.error('Error code:', error.status);
      console.error('Error name:', error.name);
      console.error('');
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('');
      
      // Common error messages and solutions
      // Detailed error analysis
      console.log('🔍 ERROR ANALYSIS:');
      console.log('');
      
      if (error.status === 500) {
        console.log('   Status 500 = Internal Server Error');
        console.log('   This usually means:');
        console.log('   1. SMTP credentials are incorrect (wrong API key)');
        console.log('   2. SMTP server cannot be reached');
        console.log('   3. Sender email domain is not verified');
        console.log('   4. Email template configuration issue');
        console.log('');
      }
      
      if (error.message === 'Error sending recovery email') {
        console.log('   Generic "Error sending recovery email" message');
        console.log('   Supabase is not providing specific details.');
        console.log('   This is almost always an SMTP configuration issue.');
        console.log('');
        console.log('   MOST COMMON CAUSES:');
        console.log('   ❌ Wrong Resend API key in Supabase SMTP password field');
        console.log('   ❌ Sender email domain doesn\'t match verified domain');
        console.log('   ❌ Port mismatch (use 465 for SSL or 587 for TLS)');
        console.log('   ❌ SMTP not enabled in Supabase');
        console.log('');
      }
      
      console.log('💡 TROUBLESHOOTING STEPS:');
      console.log('');
      console.log('   Step 1: Verify Sender Email Domain');
      console.log('   --------------------------------');
      console.log('   In Supabase SMTP settings, your sender email MUST be:');
      console.log('   ✅ noreply@myinsightai.app (matches your verified Resend domain)');
      console.log('   ❌ NOT noreply@myinsight.app (wrong domain)');
      console.log('');
      console.log('   Step 2: Double-Check API Key');
      console.log('   --------------------------------');
      console.log('   Your Resend API key should start with: re_');
      console.log('   Make sure there are NO extra spaces before/after the key');
      console.log('   Copy it fresh from Resend dashboard');
      console.log('');
      console.log('   Step 3: Verify SMTP Settings');
      console.log('   --------------------------------');
      console.log('   Host: smtp.resend.com');
      console.log('   Port: 465 (recommended) or 587');
      console.log('   Username: resend');
      console.log('   Password: [Your Resend API key]');
      console.log('   Sender: noreply@myinsightai.app');
      console.log('   Sender name: Insight');
      console.log('');
      console.log('   Step 4: Check Supabase Auth Logs');
      console.log('   --------------------------------');
      console.log('   Go to: Supabase Dashboard → Authentication → Logs');
      console.log('   Look for recent "password_recovery" events');
      console.log('   The logs might show the actual SMTP error');
      console.log('');
      
      if (error.message.includes('rate limit')) {
        console.log('\n💡 SOLUTION: Rate limit exceeded');
        console.log('   Wait a few minutes before trying again');
      }
      
      if (error.message.includes('User not found') || error.message.includes('not found')) {
        console.log('\n💡 SOLUTION: Email not registered');
        console.log('   Make sure this email has an account in your app');
        console.log('   Or try with a different email that you know is registered');
      }
      
      return false;
    }
    
    console.log('✅ SUCCESS: Password reset email sent!');
    console.log('   Check your inbox and spam folder');
    if (data) {
      console.log('   Response data:', JSON.stringify(data, null, 2));
    }
    return true;
    
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
    console.error('Stack:', err.stack);
    return false;
  }
}

async function checkUserExists() {
  console.log('Test 0.5: Check if User Exists');
  console.log('-'.repeat(60));
  
  try {
    console.log(`Checking if ${TEST_EMAIL} is registered...`);
    
    // Try to sign in with a dummy password to see if user exists
    // This will fail but the error message will tell us if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: 'dummy_password_to_check_user_exists_12345',
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
        console.log('✅ User exists (got invalid credentials error)');
        console.log('   This means the email is registered in Supabase');
        return true;
      } else if (error.message.includes('Email not confirmed')) {
        console.log('✅ User exists but email not confirmed');
        console.log('   This is fine for password reset testing');
        return true;
      } else {
        console.log('⚠️  Unexpected error:', error.message);
        console.log('   User might not exist or there\'s another issue');
        return false;
      }
    }
    
    console.log('⚠️  Unexpected: Login succeeded with dummy password');
    return true;
    
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
    return false;
  }
}

async function checkSupabaseConnection() {
  console.log('Test 0: Supabase Connection');
  console.log('-'.repeat(60));
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ ERROR: Cannot connect to Supabase');
      console.error('Error:', error.message);
      return false;
    }
    
    console.log('✅ SUCCESS: Connected to Supabase');
    return true;
    
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
    return false;
  }
}

async function checkAuthSettings() {
  console.log('\nChecking Auth Configuration...');
  console.log('-'.repeat(60));
  
  console.log('\nIMPORTANT: Check these settings in Supabase Dashboard:');
  console.log('');
  console.log('1. Authentication → Email Templates:');
  console.log('   - Confirm signup template is enabled');
  console.log('   - Reset password template is enabled');
  console.log('');
    console.log('2. Authentication → Providers:');
    console.log('   - Email provider is enabled');
    console.log('   - Confirm email is enabled');
  console.log('');
  console.log('3. Authentication → URL Configuration:');
    console.log('   - Site URL is set correctly for your environment');
    console.log('   - Reset Password template uses {{ .Token }} for code-based recovery');
  console.log('');
}

// Run all tests
async function runTests() {
  console.log('Starting tests...\n');
  
  const connectionOk = await checkSupabaseConnection();
  console.log('');
  
  if (!connectionOk) {
    console.log('❌ Cannot proceed - Supabase connection failed');
    console.log('   Check your internet connection and Supabase URL/key');
    process.exit(1);
  }
  
  const userExists = await checkUserExists();
  console.log('');
  
  if (!userExists) {
    console.log('⚠️  WARNING: Test email might not be registered');
    console.log('   Password reset will still be attempted...');
    console.log('');
  }
  
  await checkAuthSettings();
  
  const resetOk = await testPasswordReset();
  console.log('');
  
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Connection Test: ${connectionOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Password Reset: ${resetOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (!resetOk) {
    console.log('⚠️  EMAIL SENDING FAILED');
    console.log('');
    console.log('Next steps to debug:');
    console.log('1. Check Supabase Dashboard → Authentication → Logs');
    console.log('   Look for error messages related to email sending');
    console.log('');
    console.log('2. Check Resend Dashboard → Logs');
    console.log('   See if Resend received any send requests from Supabase');
    console.log('');
    console.log('3. Verify DNS records for myinsight.app:');
    console.log('   - SPF record');
    console.log('   - DKIM records (usually 2-3 records)');
    console.log('   - DMARC record (optional)');
    console.log('   Use a DNS checker tool to verify they are propagated');
    console.log('');
    console.log('4. Double-check SMTP settings in Supabase match exactly:');
    console.log('   Host: smtp.resend.com');
    console.log('   Port: 465 (SSL) or 587 (TLS)');
    console.log('   Username: resend');
    console.log('   Password: Your Resend API key (starts with re_)');
    console.log('');
    console.log('5. Test sending an email directly from Resend dashboard');
    console.log('   This will confirm if the issue is with Resend or Supabase');
  } else {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('Your email configuration is working correctly.');
    console.log('Verify the email contains a recovery code rather than a reset link.');
    console.log('');
    console.log('If users still report not receiving emails:');
    console.log('- Check their spam/junk folders');
    console.log('- Verify the email address is correct');
    console.log('- Check Supabase Auth Logs for that specific user');
  }
  
  console.log('');
}

// Execute
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
