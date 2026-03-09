import { supabase } from '../lib/supabase';

export interface AIConsentStatus {
  granted: boolean | null; // null = not asked yet, true = consented, false = declined
  consentDate: string | null;
  needsConsent: boolean; // true if we should show the consent screen
}

/**
 * Check if user has granted AI consent
 */
export async function checkAIConsent(): Promise<AIConsentStatus> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { granted: null, consentDate: null, needsConsent: false };
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('ai_consent_granted, ai_consent_date')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('[aiConsentService] Error fetching consent:', error);
      return { granted: null, consentDate: null, needsConsent: true };
    }

    const granted = profile?.ai_consent_granted ?? null;
    const consentDate = profile?.ai_consent_date ?? null;
    const needsConsent = granted === null; // Show consent screen if they haven't decided yet

    return { granted, consentDate, needsConsent };
  } catch (error) {
    console.error('[aiConsentService] Error checking consent:', error);
    return { granted: null, consentDate: null, needsConsent: true };
  }
}

/**
 * Update user's AI consent status
 */
export async function updateAIConsent(granted: boolean): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ai_consent_granted: granted,
        ai_consent_date: new Date().toISOString(),
      })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('[aiConsentService] Error updating consent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[aiConsentService] Error updating consent:', error);
    return false;
  }
}

/**
 * Check if AI features should be blocked (user declined or hasn't consented)
 */
export async function shouldBlockAI(): Promise<{ blocked: boolean; reason: string | null }> {
  const status = await checkAIConsent();
  
  if (status.granted === false) {
    return { 
      blocked: true, 
      reason: 'You have declined AI analysis. You can enable it in Settings > Privacy.' 
    };
  }
  
  if (status.needsConsent) {
    return { 
      blocked: true, 
      reason: 'Please review and accept AI data sharing consent to use this feature.' 
    };
  }
  
  return { blocked: false, reason: null };
}
