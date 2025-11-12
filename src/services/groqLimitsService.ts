/**
 * Groq API Limits Service
 * Securely fetches Groq API rate limit information via Supabase Edge Function
 */

import { supabase } from './supabaseClient';

export interface GroqLimits {
  remainingRequests: string | null;
  remainingTokens: string | null;
  requestsReset: string | null;
}

export interface GroqLimitsError {
  error: string;
}

/**
 * Fetch current Groq API rate limits
 * Only works if the current user is the designated admin
 */
export async function fetchGroqLimits(): Promise<GroqLimits> {
  // Get the current user's session token from Supabase auth
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not logged in. Cannot fetch limits.');
  }

  try {
    // This securely calls your backend Edge Function
    const { data, error } = await supabase.functions.invoke('get-groq-limits', {
      headers: {
        'Authorization': `Bearer ${session.access_token}` 
      }
    });

    console.log('Edge Function Response:', { data, error });

    if (error) {
      console.error('Edge Function Error Details:', error);
      throw new Error(error.message || 'Failed to fetch Groq limits');
    }

    // Check if the response contains an error (e.g., not authorized)
    if (data && 'error' in data) {
      console.error('Edge Function returned error:', data.error);
      throw new Error(data.error);
    }

    return data as GroqLimits;
  } catch (error) {
    console.error('Error fetching Groq limits:', error);
    throw error;
  }
}

/**
 * Parse the reset time from Groq's header format
 * Example: "2s" or "1m30s" or "1h"
 */
export function parseResetTime(resetString: string | null): string {
  if (!resetString) return 'Unknown';
  
  // If it's already in a readable format, return it
  if (resetString.includes('s') || resetString.includes('m') || resetString.includes('h')) {
    return resetString;
  }
  
  // Otherwise, assume it's seconds and format it
  const seconds = parseInt(resetString);
  if (isNaN(seconds)) return resetString;
  
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}
