import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('=== SUPABASE CONNECTION TEST ===');
  
  try {
    // Test 1: Auth status
    console.log('Test 1: Checking auth session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Auth session:', !!session, sessionError?.message || 'OK');
    
    if (session?.user) {
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
      
      // Test 2: Simple database query with timeout
      console.log('\nTest 2: Testing database query...');
      const queryPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
      );
      
      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        console.log('Database query result:', !!data, error?.message || 'OK');
        console.log('Profile data:', data);
      } catch (queryError: any) {
        console.error('Database query failed:', queryError.message);
        
        // Test 3: Check if it's an RLS issue
        console.log('\nTest 3: Testing public table access...');
        try {
          const { data: testData, error: testError } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);
          console.log('Public query result:', testError?.message || 'OK');
        } catch (e: any) {
          console.error('Public query failed:', e.message);
        }
      }
    }
  } catch (error: any) {
    console.error('Connection test failed:', error.message);
  }
  
  console.log('=== TEST COMPLETE ===');
}
