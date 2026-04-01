import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AnalyticsMetrics {
  dau: number;
  onboardingStarted: number;
  onboardingCompleted: number;
  completionRate: number;
  paywallViews: number;
  subscriptionStarts: number;
  conversionRate: number;
}

interface OnboardingStep {
  step: string;
  step_number: string;
  users: number;
  views: number;
}

interface RecentEvent {
  id: string;
  event_name: string;
  properties: any;
  created_at: string;
  user_id: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<OnboardingStep[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Check admin access
  useEffect(() => {
    if (!user || user.email !== 'edwardsjonny547@gmail.com') {
      navigate('/app');
    }
  }, [user, navigate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get DAU (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: dauData } = await supabase
        .from('analytics_events')
        .select('user_id')
        .eq('event_name', 'app_opened')
        .gte('created_at', oneDayAgo);
      
      const dau = new Set(dauData?.map(e => e.user_id).filter(Boolean)).size;

      // Get onboarding metrics
      const { data: onboardingStartedData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_name', 'onboarding_started');
      
      const { data: onboardingCompletedData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_name', 'onboarding_completed');
      
      const onboardingStarted = new Set(onboardingStartedData?.map(e => e.session_id)).size;
      const onboardingCompleted = new Set(onboardingCompletedData?.map(e => e.session_id)).size;
      const completionRate = onboardingStarted > 0 ? (onboardingCompleted / onboardingStarted) * 100 : 0;

      // Get paywall/subscription metrics
      const { data: paywallData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_name', 'paywall_viewed');
      
      const { data: subscriptionData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_name', 'subscription_started');
      
      const paywallViews = new Set(paywallData?.map(e => e.session_id)).size;
      const subscriptionStarts = new Set(subscriptionData?.map(e => e.session_id)).size;
      const conversionRate = paywallViews > 0 ? (subscriptionStarts / paywallViews) * 100 : 0;

      setMetrics({
        dau,
        onboardingStarted,
        onboardingCompleted,
        completionRate,
        paywallViews,
        subscriptionStarts,
        conversionRate,
      });

      // Get onboarding funnel
      const { data: funnelData } = await supabase
        .from('analytics_events')
        .select('properties')
        .eq('event_name', 'onboarding_step_viewed');
      
      // Group by step
      const stepMap = new Map<string, { step: string; step_number: string; count: number }>();
      funnelData?.forEach(event => {
        const step = event.properties?.step || 'unknown';
        const stepNumber = event.properties?.step_number?.toString() || '0';
        const key = `${stepNumber}-${step}`;
        if (!stepMap.has(key)) {
          stepMap.set(key, { step, step_number: stepNumber, count: 0 });
        }
        stepMap.get(key)!.count++;
      });
      
      const funnel = Array.from(stepMap.values())
        .map(s => ({ step: s.step, step_number: s.step_number, users: s.count, views: s.count }))
        .sort((a, b) => parseInt(a.step_number) - parseInt(b.step_number));
      
      setFunnelData(funnel);

      // Get recent events
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      setRecentEvents(eventsData || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (!user || user.email !== 'edwardsjonny547@gmail.com') {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0c 0%, #1a1a2e 100%)',
      color: '#fff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
            Analytics & User Insights
          </p>
        </div>

        {/* Refresh Button */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '⟳ Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* DAU Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
              Daily Active Users
            </div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#10b981' }}>
              {metrics?.dau || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
              Last 24 hours
            </div>
          </div>

          {/* Onboarding Completion Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
              Onboarding Completion
            </div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#8b5cf6' }}>
              {metrics?.completionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
              {metrics?.onboardingCompleted} / {metrics?.onboardingStarted} completed
            </div>
          </div>

          {/* Paywall Conversion Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
              Paywall Conversion
            </div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#f59e0b' }}>
              {metrics?.conversionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
              {metrics?.subscriptionStarts} / {metrics?.paywallViews} converted
            </div>
          </div>
        </div>

        {/* Onboarding Funnel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
            Onboarding Funnel
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {funnelData.map((step, index) => {
              const maxUsers = Math.max(...funnelData.map(s => s.users));
              const percentage = (step.users / maxUsers) * 100;
              const dropOff = index > 0 ? ((funnelData[index - 1].users - step.users) / funnelData[index - 1].users) * 100 : 0;
              
              return (
                <div key={step.step} style={{ position: 'relative' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      Step {step.step_number}: {step.step}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {dropOff > 0 && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: dropOff > 20 ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
                          fontWeight: dropOff > 20 ? '600' : '400'
                        }}>
                          ↓ {dropOff.toFixed(1)}% drop-off
                        </span>
                      )}
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>
                        {step.users} users
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '32px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${
                        dropOff > 20 ? '#ef4444' : '#8b5cf6'
                      } 0%, ${
                        dropOff > 20 ? '#dc2626' : '#7c3aed'
                      } 100%)`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Events */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
            Recent Events
          </h2>
          <div style={{ 
            maxHeight: '500px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {recentEvents.map(event => (
              <div 
                key={event.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ 
                    fontWeight: '600',
                    color: event.event_name.includes('completed') ? '#10b981' : 
                           event.event_name.includes('subscription') ? '#f59e0b' : '#8b5cf6'
                  }}>
                    {event.event_name}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
                {Object.keys(event.properties || {}).length > 0 && (
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '8px'
                  }}>
                    {JSON.stringify(event.properties, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
