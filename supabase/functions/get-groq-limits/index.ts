// supabase/functions/get-groq-limits/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This is the main function that will handle the request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the user's auth token from the request header
    const authHeader = req.headers.get('Authorization')!
    
    // 2. Create a Supabase client to securely identify the user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 3. Get the user's details from their token
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not found or invalid token.");
    }

    // 4. SECURITY CHECK: Ensure the user is the designated admin
    if (user.email !== Deno.env.get('ADMIN_EMAIL')) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. User is confirmed as admin. Proceed to call Groq.
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured in Supabase secrets')
    }

    console.log('Calling Groq API...')

    // 6. Make a minimal "test" call to Groq to read the response headers
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      // We send a minimal payload to save tokens
      body: JSON.stringify({
        model: "openai/gpt-oss-120b", 
        messages: [{ role: "user", content: "test" }],
        max_completion_tokens: 1
      }),
    })

    console.log('Groq API Response Status:', groqResponse.status)

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text()
      console.error('Groq API Error Body:', errorBody)
      throw new Error(`Groq API error (${groqResponse.status}): ${errorBody}`);
    }

    // 7. Read the rate limit headers from Groq's response
    const remainingRequests = groqResponse.headers.get('x-ratelimit-remaining-requests')
    const remainingTokens = groqResponse.headers.get('x-ratelimit-remaining-tokens')
    const requestsReset = groqResponse.headers.get('x-ratelimit-reset-requests')

    // 8. Send the data back to the admin dashboard
    const data = {
      remainingRequests,
      remainingTokens,
      requestsReset,
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
