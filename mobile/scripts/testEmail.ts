/**
 * Email Test Script
 * 
 * This script tests the Supabase email configuration and SMTP connection to Resend.
 * Run this with: npx ts-node scripts/testEmail.ts
 * 
 * Make sure you have ts-node installed: npm install -g ts-node
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ptpqvghlaesyrzlljzkk.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cHF2Z2hsYWVzeXJ6bGxqemtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDc4MzEsImV4cCI6MjA2ODY4MzgzMX0.dmkb2_Hdf0vQwirOwJKX4ssfr0ltA1eIZ5_v1s5p6DE';

// Test email address (change this to your email)
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
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(TEST_EMAIL, {
      redirectTo: 'myinsightai://reset-password',
    });
    
    if (error) {
      console.error('❌ ERROR:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Common error messages and solutions
      if (error.message.includes('SMTP')) {
        console.log('\n💡 SOLUTION: SMTP configuration issue detected');
        console.log('   1. Go to Supabase Dashboard → Project Settings → Authentication');
        console.log('   2. Scroll to "SMTP Settings"');
        console.log('   3. Verify these settings:');
        console.log('      - Enable Custom SMTP: ON');
        console.log('      - Host: smtp.resend.com');
        console.log('      - Port: 465 (or 587)');
        console.log('      - Username: resend');
        console.log('      - Password: Your Resend API key (re_...)');
        console.log('      - Sender email: noreply@myinsight.app');
        console.log('      - Sender name: Insight');
        console.log('   4. Click Save and wait 1-2 minutes');
      }
      
      if (error.message.includes('rate limit')) {
        console.log('\n💡 SOLUTION: Rate limit exceeded');
        console.log('   Wait a few minutes before trying again');
      }
      
      if (error.message.includes('User not found')) {
        console.log('\n💡 SOLUTION: Email not registered');
        console.log('   Make sure this email has an account in your app');
      }
      
      return false;
    }
    
    console.log('✅ SUCCESS: Password reset email sent!');
    console.log('   Check your inbox and spam folder');
    console.log('   Data:', JSON.stringify(data, null, 2));
    return true;
    
  } catch (err: any) {
    console.error('❌ EXCEPTION:', err.message);
    console.error('Stack:', err.stack);
    return false;
  }
}

async function testSignUp() {
  console.log('\nTest 2: Sign Up Confirmation Email');
  console.log('-'.repeat(60));
  
  const testEmail = `test+${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log(`Creating test account: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('❌ ERROR:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ SUCCESS: Sign up email should be sent!');
    console.log('   Note: This is a test account, you can delete it from Supabase dashboard');
    console.log('   Data:', JSON.stringify(data, null, 2));
    return true;
    
  } catch (err: any) {
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
    
  } catch (err: any) {
    console.error('❌ EXCEPTION:', err.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting tests...\n');
  
  const connectionOk = await checkSupabaseConnection();
  console.log('');
  
  if (!connectionOk) {
    console.log('❌ Cannot proceed - Supabase connection failed');
    process.exit(1);
  }
  
  const resetOk = await testPasswordReset();
  console.log('');
  
  // Uncomment to test signup emails (creates a test account)
  // const signupOk = await testSignUp();
  // console.log('');
  
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Connection Test: ${connectionOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Password Reset: ${resetOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (!resetOk) {
    console.log('⚠️  EMAIL SENDING FAILED');
    console.log('');
    console.log('Next steps:');
    console.log('1. Check Supabase Dashboard → Authentication → Logs for detailed errors');
    console.log('2. Verify SMTP settings in Supabase (see error messages above)');
    console.log('3. Check Resend Dashboard → Logs to see if emails are being sent');
    console.log('4. Verify DNS records for myinsight.app domain');
    console.log('5. Make sure domain is verified in Resend (green checkmark)');
  } else {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('Your email configuration is working correctly.');
  }
  
  console.log('');
}

// Execute
runTests().catch(console.error);
