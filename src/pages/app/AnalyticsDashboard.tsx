import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

interface UserJourney {
  session_id: string;
  user_id: string | null;
  username: string;
  email?: string | null;
  signedUpAt?: string | null;
  steps: {
    step: string;
    step_number: number;
    completed: boolean;
    skipped?: boolean;
    timestamp: string;
  }[];
  lastActiveTime: string;
}

interface RegisteredProfile {
  user_id: string;
  username: string;
  email: string | null;
  created_at: string;
  hasAnalytics: boolean;
}

interface AnalyticsMetrics {
  totalSessions: number;
  completedOnboarding: number;
  completionRate: number;
  dropOffStep: string | null;
}

const ONBOARDING_STEPS = [
  { id: 'name', label: 'Name', number: 0, type: 'step', description: '"What is your name?" — user enters their first name' },
  { id: 'referral', label: 'Referral', number: 1, type: 'step', description: '"Where did you hear about us?" — Instagram, TikTok, Friend, etc.' },
  { id: 'goal', label: 'Goal', number: 2, type: 'step', description: '"What is your main goal?" — Improve Mood, Reduce Stress, Build Habits, Gain Clarity' },
  { id: 'research_info', label: 'Research', number: 3, type: 'step', description: '"Grounded in psychology" — info slide about Cambridge research' },
  { id: 'frequency', label: 'Frequency', number: 4, type: 'step', description: '"How often do you want to reflect?" — Daily, Weekly, As Needed' },
  { id: 'journalingExperience', label: 'Experience', number: 5, type: 'step', description: '"How long have you been journaling?" — New, < 6 months, 6–24 months, 2+ years' },
  { id: 'personality_quiz_intro', label: 'Quiz Intro', number: 6, type: 'screen', optional: true, description: '"Help us understand your habits" — intro before personality questions (can skip)' },
  { id: 'wellbeing', label: 'Wellbeing', number: 7, type: 'step', optional: true, description: '"How would you rate your daily wellbeing?" — slider 1–10' },
  { id: 'stressResponse', label: 'Stress', number: 8, type: 'step', optional: true, description: '"When under pressure, what do you tend to do?" — Ruminate, Self-blame, Fixate, Step back' },
  { id: 'selfTalk', label: 'Self-talk', number: 9, type: 'step', optional: true, description: '"How would you describe your inner voice?" — Harsh, Mixed, Supportive' },
  { id: 'copingStyle', label: 'Coping', number: 10, type: 'step', optional: true, description: '"When emotions feel overwhelming, what helps?" — Talk, Move, Journal, Solitude' },
  { id: 'changeResponse', label: 'Change', number: 11, type: 'step', optional: true, description: '"How do you respond to big changes?" — Resist, Anxious but push, Embrace, Need support' },
  { id: 'motivationDriver', label: 'Motivation', number: 12, type: 'step', optional: true, description: '"What drives you to keep going?" — Fear, External rewards, Values, Passion' },
  { id: 'relationshipPatterns', label: 'Relationships', number: 13, type: 'step', optional: true, description: '"In close relationships, what pattern shows up?" — Deeper personality question' },
  { id: 'conflictStyle', label: 'Conflict', number: 14, type: 'step', optional: true, description: '"How do you handle conflict?" — Deeper personality question' },
  { id: 'restStyle', label: 'Rest', number: 15, type: 'step', optional: true, description: '"How do you typically recharge?" — Deeper personality question' },
  { id: 'identitySource', label: 'Identity', number: 16, type: 'step', optional: true, description: '"Where does your sense of worth come from?" — Deeper personality question' },
  { id: 'failureResponse', label: 'Failure', number: 17, type: 'step', optional: true, description: '"How do you respond to failure or setbacks?" — Deeper personality question' },
  { id: 'analyzing', label: 'Analyzing', number: 18, type: 'screen', description: '"Personalising your plan" — loading animation, building your profile' },
  { id: 'onboarding_summary', label: 'Summary', number: 19, type: 'screen', description: '"Your Insight Profile" — confetti screen showing user\'s analysis summary' },
  { id: 'interactive_showcase', label: 'Showcase', number: 20, type: 'screen', description: '"Try journaling now" — interactive AI demo with sample prompts' },
  { id: 'privacy', label: 'Privacy', number: 21, type: 'screen', description: '"Your privacy is our priority" — data safety & encryption info screen' },
  { id: 'notifications', label: 'Notifications', number: 22, type: 'screen', description: '"Stay on track" — notification permission request screen' },
  { id: 'paywall', label: 'Paywall', number: 23, type: 'screen', description: '"Start your journey" — subscription plan selection (Weekly / Monthly / Yearly)' },
  { id: 'subscription', label: '💎 Pro', number: 24, type: 'subscription', description: '"Welcome to Insight" — user purchased Pro subscription successfully!' },
];

interface ContextMenu {
  x: number;
  y: number;
  sessionId: string;
  userId: string | null;
  username: string;
}

const PAGE_BG = '#000000';

const glassCard: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
};

function CompletionRing({ percent }: { percent: number }) {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 72, height: 72 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={36}
          cy={36}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={36}
          cy={36}
          r={normalizedRadius}
          fill="none"
          stroke="#7B5EA7"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(123, 94, 167, 0.55))' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          fontWeight: 700,
          color: '#FFFFFF',
        }}
      >
        {Math.round(percent)}%
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  ring,
}: {
  label: string;
  value: ReactNode;
  ring?: ReactNode;
}) {
  return (
    <div style={{ ...glassCard, padding: '24px' }}>
      <div
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.45)',
          marginBottom: ring ? '12px' : '8px',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {ring ?? (
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
          {value}
        </div>
      )}
    </div>
  );
}

function LegendPill({ color, label, glow }: { color: string; label: string; glow?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '4px 10px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.75)',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          boxShadow: glow ?? `0 0 6px ${color}`,
        }}
      />
      {label}
    </div>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
  destructive,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.2s',
      }}
    >
      {children}
    </button>
  );
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [registeredProfiles, setRegisteredProfiles] = useState<RegisteredProfile[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const filteredJourneys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return userJourneys;
    return userJourneys.filter((j) => {
      const haystack = [j.username, j.email, j.user_id, j.session_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [userJourneys, searchQuery]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return registeredProfiles.filter((p) => !p.hasAnalytics);
    return registeredProfiles.filter((p) => {
      const haystack = [p.username, p.email, p.user_id].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [registeredProfiles, searchQuery]);

  useEffect(() => {
    if (!user || user.email !== 'edwardsjonny547@gmail.com') {
      navigate('/app');
    }
  }, [user, navigate]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const deleteJourney = useCallback(async (sessionId: string, userId: string | null, username: string) => {
    setDeletingId(sessionId);
    setContextMenu(null);

    console.log('[Analytics] 🗑️ Deleting:', { sessionId, userId, username });
    
    try {
      let data, error, count;
      
      if (userId) {
        // Delete ALL events for this user (all sessions)
        const result = await supabase
          .from('analytics_events')
          .delete()
          .eq('user_id', userId)
          .select();
        data = result.data;
        error = result.error;
        count = result.count;
        
        if (!error) {
          // Remove all journeys for this user
          setUserJourneys(prev => prev.filter(j => j.user_id !== userId));
        }
      } else {
        // Delete only this anonymous session
        const result = await supabase
          .from('analytics_events')
          .delete()
          .eq('session_id', sessionId)
          .select();
        data = result.data;
        error = result.error;
        count = result.count;
        
        if (!error) {
          setUserJourneys(prev => prev.filter(j => j.session_id !== sessionId));
        }
      }
      
      console.log('[Analytics] Delete response:', { data, error, count });
      
      if (error) {
        console.error('[Analytics] ❌ Delete failed with error:', error);
        console.error('[Analytics] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to delete: ${error.message}\n\nThis is likely due to missing database permissions. Please run the SQL fix in FIX_ANALYTICS_DELETE_POLICY.sql`);
      } else {
        console.log('[Analytics] ✅ Successfully deleted', data?.length || 0, 'events for', userId ? 'user' : 'session');
      }
    } catch (err: any) {
      console.error('[Analytics] ❌ Exception during delete:', err);
      console.error('[Analytics] Exception details:', {
        message: err?.message,
        stack: err?.stack
      });
      alert(`Error deleting: ${err?.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  }, []);

  const deleteAllMatchingSearch = useCallback(async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    setIsDeletingAll(true);
    setContextMenu(null);

    try {
      const matching = userJourneys.filter((j) => {
        const haystack = [j.username, j.email, j.user_id, j.session_id]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
      const userIds = [...new Set(matching.map((j) => j.user_id).filter(Boolean))] as string[];
      const anonSessionIds = matching.filter((j) => !j.user_id).map((j) => j.session_id);

      for (const userId of userIds) {
        await supabase.from('analytics_events').delete().eq('user_id', userId);
      }
      for (const sessionId of anonSessionIds) {
        await supabase.from('analytics_events').delete().eq('session_id', sessionId);
      }

      setUserJourneys((prev) =>
        prev.filter((j) => {
          const haystack = [j.username, j.email, j.user_id, j.session_id]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return !haystack.includes(q);
        }),
      );
    } catch (err: any) {
      console.error('[Analytics] Delete matching failed:', err);
    } finally {
      setIsDeletingAll(false);
    }
  }, [searchQuery, userJourneys]);

  const deleteAllJourneys = useCallback(async () => {
    setIsDeletingAll(true);
    console.log('[Analytics] 🗑️ Deleting ALL analytics events...');
    
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .delete()
        .in('event_name', ['onboarding_step_viewed', 'onboarding_step_completed', 'onboarding_screen', 'subscription_started'])
        .select();
      
      console.log('[Analytics] Delete all response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('[Analytics] ❌ Delete all failed:', error);
      } else {
        console.log('[Analytics] ✅ Successfully deleted', data?.length || 0, 'events');
        setUserJourneys([]);
        setMetrics({
          totalSessions: 0,
          completedOnboarding: 0,
          completionRate: 0,
          dropOffStep: null,
        });
      }
    } catch (err: any) {
      console.error('[Analytics] ❌ Exception during delete all:', err);
      alert(`Error deleting all journeys: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDeletingAll(false);
    }
  }, [userJourneys.length]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get all onboarding events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .in('event_name', ['onboarding_step_viewed', 'onboarding_step_completed', 'onboarding_screen', 'subscription_started'])
        .order('created_at', { ascending: true });

      if (!events) {
        setLoading(false);
        return;
      }

      // Group by session
      const sessionMap = new Map<string, UserJourney>();
      
      events.forEach(event => {
        const sessionId = event.session_id;
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            session_id: sessionId,
            user_id: event.user_id,
            username: 'Anonymous',
            steps: [],
            lastActiveTime: event.created_at,
          });
        }

        // Update username whenever we find a non-null one in any event
        const eventUsername = event.properties?.username || event.properties?.name;
        if (eventUsername && eventUsername !== 'null') {
          sessionMap.get(sessionId)!.username = eventUsername;
        }

        const journey = sessionMap.get(sessionId)!;
        if (event.created_at > journey.lastActiveTime) journey.lastActiveTime = event.created_at;
        
        // Handle onboarding steps
        const step = event.properties?.step;
        const stepNumber = event.properties?.step_number;
        
        // Handle onboarding screens
        const screen = event.properties?.screen;
        const action = event.properties?.action;
        
        // Handle subscription
        const isSubscription = event.event_name === 'subscription_started';

        if (step && stepNumber !== undefined) {
          const existingStep = journey.steps.find(s => s.step === step);
          if (!existingStep) {
            journey.steps.push({
              step,
              step_number: stepNumber,
              completed: event.event_name === 'onboarding_step_completed',
              skipped: event.properties?.skipped || false,
              timestamp: event.created_at,
            });
          } else if (event.event_name === 'onboarding_step_completed') {
            existingStep.completed = true;
            existingStep.skipped = event.properties?.skipped || false;
          }
        } else if (screen && action) {
          // Map screen to step number
          const screenStep = ONBOARDING_STEPS.find(s => s.id === screen);
          if (screenStep) {
            const existingStep = journey.steps.find(s => s.step === screen);
            if (!existingStep) {
              journey.steps.push({
                step: screen,
                step_number: screenStep.number,
                completed: action === 'completed',
                skipped: action === 'skipped',
                timestamp: event.created_at,
              });
            } else if (action === 'completed') {
              existingStep.completed = true;
            } else if (action === 'skipped') {
              existingStep.skipped = true;
            }
          }
        } else if (isSubscription) {
          // Add subscription as final step
          const subStep = ONBOARDING_STEPS.find(s => s.id === 'subscription');
          if (subStep) {
            journey.steps.push({
              step: 'subscription',
              step_number: subStep.number,
              completed: true,
              skipped: false,
              timestamp: event.created_at,
            });
          }
        }
      });

      const journeys = Array.from(sessionMap.values())
        .map(j => ({
          ...j,
          steps: j.steps.sort((a, b) => a.step_number - b.step_number),
        }))
        .sort((a, b) => b.lastActiveTime.localeCompare(a.lastActiveTime));

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, username, email, created_at')
        .order('created_at', { ascending: false });

      const analyticsUserIds = new Set(
        journeys.map((j) => j.user_id).filter(Boolean) as string[],
      );

      const profileByUserId = new Map(
        (profiles ?? []).map((p) => [p.user_id, p]),
      );

      const enrichedJourneys = journeys.map((j) => {
        if (!j.user_id) return j;
        const profile = profileByUserId.get(j.user_id);
        if (!profile) return j;
        return {
          ...j,
          username: j.username === 'Anonymous' ? profile.username : j.username,
          email: profile.email,
          signedUpAt: profile.created_at,
        };
      });

      const registered = (profiles ?? []).map((p) => ({
        user_id: p.user_id,
        username: p.username,
        email: p.email,
        created_at: p.created_at,
        hasAnalytics: analyticsUserIds.has(p.user_id),
      }));

      setUserJourneys(enrichedJourneys);
      setRegisteredProfiles(registered);

      // Calculate metrics
      const totalSessions = enrichedJourneys.length;
      const completedOnboarding = enrichedJourneys.filter(j => 
        j.steps.some(s => s.completed && s.step_number >= 23)
      ).length;
      const completionRate = totalSessions > 0 ? (completedOnboarding / totalSessions) * 100 : 0;

      // Find most common drop-off point
      const dropOffCounts = new Map<string, number>();
      enrichedJourneys.forEach(j => {
        const lastCompletedStep = j.steps.filter(s => s.completed).pop();
        if (lastCompletedStep && lastCompletedStep.step_number < 23) {
          const stepLabel = ONBOARDING_STEPS.find(s => s.number === lastCompletedStep.step_number)?.label || lastCompletedStep.step;
          dropOffCounts.set(stepLabel, (dropOffCounts.get(stepLabel) || 0) + 1);
        }
      });
      
      let dropOffStep = null;
      let maxDropOffs = 0;
      dropOffCounts.forEach((count, step) => {
        if (count > maxDropOffs) {
          maxDropOffs = count;
          dropOffStep = step;
        }
      });

      setMetrics({
        totalSessions,
        completedOnboarding,
        completionRate,
        dropOffStep,
      });

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
      background: PAGE_BG,
      color: '#fff',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/app/admin')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <ArrowLeft size={16} />
            Back to Admin
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
              Onboarding Analytics
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Track user progress through onboarding steps
            </p>
          </div>
        </div>

        {metrics && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <StatCard label="Total Users" value={metrics.totalSessions} />
            <StatCard label="Completed" value={metrics.completedOnboarding} />
            <StatCard
              label="Completion Rate"
              value={null}
              ring={<CompletionRing percent={metrics.completionRate} />}
            />
            {metrics.dropOffStep && (
              <StatCard label="Common Drop-off" value={metrics.dropOffStep} />
            )}
          </div>
        )}

        <div style={{ ...glassCard, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#FFFFFF' }}>
              User Journeys ({filteredJourneys.length}{searchQuery ? ` of ${userJourneys.length}` : ''})
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {searchQuery.trim() && filteredJourneys.length > 0 ? (
                <GhostButton onClick={deleteAllMatchingSearch} disabled={loading || isDeletingAll} destructive>
                  {isDeletingAll ? 'Deleting...' : `Delete "${searchQuery.trim()}" (${filteredJourneys.length})`}
                </GhostButton>
              ) : null}
              <GhostButton onClick={deleteAllJourneys} disabled={loading || isDeletingAll || userJourneys.length === 0} destructive>
                {isDeletingAll ? 'Deleting...' : 'Delete All'}
              </GhostButton>
              <GhostButton onClick={loadAnalytics} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </GhostButton>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                placeholder="Search username, email, or user id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '10px 14px 10px 38px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            {searchQuery.trim() ? (
              <GhostButton onClick={() => setSearchQuery('')}>Clear</GhostButton>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <LegendPill color="#10b981" label="Completed" glow="0 0 4px #4ade80" />
            <LegendPill color="#fbbf24" label="Subscribed" />
            <LegendPill color="#f59e0b" label="Skipped" />
            <LegendPill color="#ef4444" label="Dropped" />
            <LegendPill color="rgba(255, 255, 255, 0.25)" label="Not Reached" glow="none" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredJourneys.map((journey, index) => {
              const completedStepNumbers = new Set(journey.steps.filter(s => s.completed && !s.skipped).map(s => s.step_number));
              const skippedStepNumbers = new Set(journey.steps.filter(s => s.skipped).map(s => s.step_number));
              const hasSubscribed = journey.steps.some(s => s.step === 'subscription');
              const isDeleting = deletingId === journey.session_id;
              
              return (
                <div 
                  key={journey.session_id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ 
                      x: e.clientX, 
                      y: e.clientY, 
                      sessionId: journey.session_id, 
                      userId: journey.user_id,
                      username: journey.username 
                    });
                  }}
                  style={{
                    background: index % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    opacity: isDeleting ? 0.5 : 1,
                    cursor: 'context-menu',
                  }}
                >
                  <div style={{ minWidth: '140px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#FFFFFF', marginBottom: '2px' }}>
                      {journey.username}{hasSubscribed ? ' 💎' : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {journey.signedUpAt
                        ? `Signed up ${new Date(journey.signedUpAt).toLocaleDateString()}`
                        : new Date(journey.lastActiveTime).toLocaleDateString()}{' '}
                      {new Date(journey.lastActiveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {journey.email ? (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                        {journey.email}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                    {ONBOARDING_STEPS.map(step => {
                      const isCompleted = completedStepNumbers.has(step.number);
                      const isSkipped = skippedStepNumbers.has(step.number);
                      const wasViewed = journey.steps.some(s => s.step_number === step.number);
                      
                      let color = 'rgba(255, 255, 255, 0.15)';
                      let status = 'not reached';
                      
                      if (step.type === 'subscription' && journey.steps.some(s => s.step === 'subscription')) {
                        color = '#fbbf24';
                        status = '✓ Subscribed to Pro!';
                      } else if (isCompleted) {
                        color = '#10b981';
                        status = '✓ completed';
                      } else if (isSkipped) {
                        color = '#f59e0b';
                        status = 'skipped';
                      } else if (wasViewed) {
                        color = '#ef4444';
                        status = 'dropped off here';
                      }

                      const tooltipText = `${step.label} — ${step.description}\n[${status}]`;
                      const dotGlow = isCompleted ? '0 0 4px #4ade80' : undefined;

                      return (
                        <div
                          key={step.id}
                          title={tooltipText}
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: color,
                            boxShadow: dotGlow,
                            flexShrink: 0,
                            opacity: step.optional ? 0.8 : 1,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF', minWidth: '60px', textAlign: 'right' }}>
                    {completedStepNumbers.size}/{ONBOARDING_STEPS.length}
                    {skippedStepNumbers.size > 0 && (
                      <span style={{ color: 'rgba(255,100,100,0.8)', marginLeft: '4px' }}>(-{skippedStepNumbers.size})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {(searchQuery.trim() ? filteredProfiles : filteredProfiles.slice(0, 12)).length > 0 ? (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px', color: '#fff' }}>
                Registered in app, no onboarding analytics
                {searchQuery.trim() ? ` (${filteredProfiles.length})` : ''}
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 12px' }}>
                Usually Apple/Google sign-in at the end of onboarding, returning logins, or users who dropped before tracked steps.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(searchQuery.trim() ? filteredProfiles : filteredProfiles.slice(0, 12)).map((profile) => (
                  <div
                    key={profile.user_id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{profile.username}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        {profile.email || 'No email on profile'}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textAlign: 'right' }}>
                      Signed up<br />
                      {new Date(profile.created_at).toLocaleDateString()}{' '}
                      {new Date(profile.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '6px',
            zIndex: 9999,
            minWidth: '200px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            padding: '4px 10px 6px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '4px',
          }}>
            {contextMenu.username}
          </div>
          <button
            onClick={() => deleteJourney(contextMenu.sessionId, contextMenu.userId, contextMenu.username)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: '5px',
              color: '#ef4444',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            🗑 {contextMenu.userId ? 'Delete all user data' : 'Delete session'}
          </button>
        </div>
      )}
    </div>
  );
}
