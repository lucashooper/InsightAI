import { SupabaseClient, createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ENTITLED_TIERS = new Set(['pro', 'unlimited', 'demo'])

/** APK investor demo — keep AI working even if profile tier drifts to free. */
const INVESTOR_DEMO_USER_IDS = new Set([
  'a0c3ba5b-c584-48a2-b297-0feaa726fb83',
])

function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function assertProEntitlement(
  _supabase: SupabaseClient,
  userId: string,
): Promise<Response | null> {
  if (INVESTOR_DEMO_USER_IDS.has(userId)) {
    return null
  }

  const { data: profile, error } = await adminClient()
    .from('user_profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[entitlements] profile lookup failed:', error.message)
    return new Response(JSON.stringify({ error: 'Unable to verify subscription' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tier = profile?.subscription_tier ?? 'free'
  if (!ENTITLED_TIERS.has(tier)) {
    return new Response(
      JSON.stringify({
        error: 'Subscription required',
        code: 'NO_ACTIVE_SUBSCRIPTION',
        message: 'You need an active subscription to use AI features.',
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return null
}
