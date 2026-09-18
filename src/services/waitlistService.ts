import { supabase } from './supabaseClient';

export interface QuizWaitlistPayload {
  email: string;
  goal: string;
  frequency: string;
  minutes: string;
  profileLabel: string;
  profileSummary: string;
  answers?: Record<string, string>;
  matchLevel?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const waitlistService = {
  async submitQuizLead(payload: QuizWaitlistPayload): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('quiz_waitlist').insert({
        email: payload.email.trim().toLowerCase(),
        goal: payload.goal,
        frequency: payload.frequency,
        minutes: payload.minutes,
        profile_label: payload.profileLabel,
        profile_summary: payload.profileSummary,
        source: 'web_quiz',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      if (error) {
        if (error.code === '23505') {
          return { success: true };
        }
        console.error('Quiz waitlist insert failed:', error);
        return { success: false, error: error.message };
      }

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quiz_email_capture', {
          event_category: 'conversion',
          event_label: payload.goal,
          match_level: payload.matchLevel,
        });
      }

      return { success: true };
    } catch (err) {
      console.error('Quiz waitlist error:', err);
      return { success: false, error: 'Failed to save email. Please try again.' };
    }
  },
};
