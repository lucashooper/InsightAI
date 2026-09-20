// supabase/functions/elevenlabs-vent/index.ts
// Server-side ElevenLabs TTS for Vent Mode — keeps API key off the client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assertProEntitlement } from '../_shared/entitlements.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_VOICE_ID = 'dfeOmy6Uay63tNhyO99j'
const TTS_MODEL = 'eleven_flash_v2_5'
const OUTPUT_FORMAT = 'mp3_44100_128'

function encodeBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const entitlementError = await assertProEntitlement(supabase, user.id)
    if (entitlementError) {
      return new Response(await entitlementError.text(), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          voiceId: DEFAULT_VOICE_ID,
          model: TTS_MODEL,
          outputFormat: OUTPUT_FORMAT,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ElevenLabs not configured on server' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const text = typeof body.text === 'string' ? body.text.trim() : ''
    const voiceId = typeof body.voiceId === 'string' && body.voiceId.length > 4
      ? body.voiceId
      : DEFAULT_VOICE_ID

    if (!text || text.length > 1200) {
      return new Response(JSON.stringify({ error: 'Invalid text payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`
    const started = Date.now()

    const ttsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        voice_settings: {
          stability: 0.32,
          similarity_boost: 0.82,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    })

    const latencyMs = Date.now() - started

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text()
      return new Response(
        JSON.stringify({ error: 'ElevenLabs TTS failed', status: ttsResponse.status, detail: errText.slice(0, 400) }),
        { status: ttsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const audioBuffer = await ttsResponse.arrayBuffer()
    if (audioBuffer.byteLength < 256) {
      return new Response(JSON.stringify({ error: 'Audio response too small' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        audioBase64: encodeBase64(audioBuffer),
        latencyMs,
        bytes: audioBuffer.byteLength,
        voiceId,
        model: TTS_MODEL,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[elevenlabs-vent]', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
