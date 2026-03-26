import { supabase } from '../lib/supabase';
import * as Crypto from 'expo-crypto';

class AnalyticsService {
  private currentUserId: string | null = null;
  private sessionId: string | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    // Generate session ID
    this.sessionId = Crypto.randomUUID();
    this.isInitialized = true;
    console.log('[Analytics] Supabase analytics initialized with session:', this.sessionId);
  }

  // Identify user
  identify(userId: string, properties?: Record<string, any>) {
    this.currentUserId = userId;
    console.log('[Analytics] User identified:', userId);
    
    // Track app_opened event when user is identified
    this.track('app_opened', properties);
  }

  // Reset user (on logout)
  reset() {
    this.currentUserId = null;
    this.sessionId = Crypto.randomUUID(); // New session for next user
    console.log('[Analytics] User reset, new session:', this.sessionId);
  }

  // Track custom event
  async track(eventName: string, properties?: Record<string, any>) {
    // Allow tracking onboarding events without user ID (before signup)
    const allowedAnonymousEvents = [
      'onboarding_started',
      'onboarding_step_viewed',
      'onboarding_step_completed',
      'onboarding_screen',
      'subscription_started',
      'paywall_viewed',
    ];
    
    if (!this.currentUserId && !allowedAnonymousEvents.includes(eventName)) {
      console.log('[Analytics] No user ID, skipping event:', eventName);
      return;
    }

    try {
      // Use database function to bypass RLS for anonymous events
      const { error } = await supabase.rpc('insert_analytics_event', {
        p_user_id: this.currentUserId,
        p_session_id: this.sessionId,
        p_event_name: eventName,
        p_properties: properties || {},
      });

      if (error) {
        console.error('[Analytics] Failed to track event:', eventName, error);
      } else {
        console.log('[Analytics] Event tracked:', eventName, properties);
      }
    } catch (err) {
      console.error('[Analytics] Error tracking event:', err);
    }
  }

  // Screen view tracking
  screen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_viewed', { screen: screenName, ...properties });
  }

  // Set user properties (stored in event properties for now)
  setUserProperties(properties: Record<string, any>) {
    this.track('user_properties_updated', properties);
  }

  // Onboarding events
  trackOnboardingStart() {
    // Track onboarding step
  }

  async trackOnboardingStep(stepId: string, stepNumber: number, username?: string) {
    await this.track('onboarding_step_viewed', {
      step: stepId,
      step_number: stepNumber,
      username: username || null,
    });
  }

  // Track onboarding step completion
  async trackOnboardingStepCompleted(stepId: string, stepNumber: number, username?: string, skipped?: boolean) {
    await this.track('onboarding_step_completed', {
      step: stepId,
      step_number: stepNumber,
      username: username || null,
      skipped: skipped || false,
    });
  }

  // Track onboarding screens outside the question flow (PersonalityQuizIntro, Analyzing, etc.)
  async trackOnboardingScreen(screenId: string, action: 'viewed' | 'completed' | 'skipped', username?: string) {
    await this.track('onboarding_screen', {
      screen: screenId,
      action,
      username: username || null,
    });
  }

  trackOnboardingComplete(username?: string) {
    this.track('onboarding_completed', { username: username || null });
  }

  trackOnboardingDropOff(step: string, stepNumber: number) {
    this.track('onboarding_dropped_off', { step, step_number: stepNumber });
  }

  // App session tracking
  trackAppSessionStart() {
    this.track('app_session_start', { timestamp: new Date().toISOString() });
  }

  trackAppSessionEnd(durationMs: number) {
    this.track('app_session_end', {
      duration_ms: durationMs,
      duration_minutes: Math.round(durationMs / 60000 * 10) / 10,
      timestamp: new Date().toISOString(),
    });
  }

  // Paywall events
  trackPaywallViewed(source?: string) {
    this.track('paywall_viewed', { source });
  }

  // Auth events
  trackSignUp(method: 'email' | 'google' | 'apple') {
    this.track('user_signed_up', { method });
  }

  trackSignIn(method: 'email' | 'google' | 'apple') {
    this.track('user_signed_in', { method });
  }

  trackSignOut() {
    this.track('user_signed_out');
  }

  // Journal events
  trackJournalEntryCreated(method: 'text' | 'voice' | 'scan') {
    this.track('journal_entry_created', { method });
  }

  trackJournalEntryViewed(entryId: string) {
    this.track('journal_entry_viewed', { entry_id: entryId });
  }

  trackJournalEntryDeleted() {
    this.track('journal_entry_deleted');
  }

  // AI Chat events
  trackAIChatOpened() {
    this.track('ai_chat_opened');
  }

  trackAIChatMessageSent() {
    this.track('ai_chat_message_sent');
  }

  // Subscription events
  trackSubscriptionViewed() {
    this.track('subscription_viewed');
  }

  trackSubscriptionPurchased(tier: string, price: string) {
    this.track('subscription_purchased', { tier, price });
  }

  trackSubscriptionStarted(tier: string, price: string, username?: string) {
    this.track('subscription_started', { tier, price, username: username || null });
  }

  trackSubscriptionCancelled(tier: string) {
    this.track('subscription_cancelled', { tier });
  }

  // Feature usage tracking
  trackFeatureUsed(feature: string, metadata?: Record<string, any>) {
    this.track('feature_used', { feature, ...metadata });
  }

  // Dashboard events
  trackDashboardViewed() {
    this.track('dashboard_viewed');
  }

  trackPatternClicked(pattern: string) {
    this.track('pattern_clicked', { pattern });
  }

  // Settings events
  trackThemeChanged(theme: string) {
    this.track('theme_changed', { theme });
  }

  trackProfileUpdated() {
    this.track('profile_updated');
  }
}

export const analytics = new AnalyticsService();
