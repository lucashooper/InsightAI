// supabase/functions/groq-proxy/index.ts
// Generic Groq API proxy for secondary AI calls (protocol generation, follow-up questions, monthly stories)
// Keeps the Groq API key server-side only.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate the user
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Parse the request body
    const { messages, model, temperature, max_tokens } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid messages array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Get the Groq API key from server-side secrets
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured in Supabase secrets')
    }

    // 4. Proxy the request to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        temperature: temperature ?? 0.8,
        max_tokens: max_tokens ?? 500,
      }),
    })

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text()
      console.error('Groq API error:', groqResponse.status, errorBody)
      return new Response(JSON.stringify({ error: `Groq API error (${groqResponse.status})` }), {
        status: groqResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await groqResponse.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
