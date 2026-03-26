import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface UserJourney {
  session_id: string;
  user_id: string | null;
  username: string;
  steps: {
    step: string;
    step_number: number;
    completed: boolean;
    skipped?: boolean;
    timestamp: string;
  }[];
  lastActiveTime: string;
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
  username: string;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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

  const deleteJourney = useCallback(async (sessionId: string) => {
    setDeletingId(sessionId);
    setContextMenu(null);
    try {
      const { error } = await supabase
        .from('analytics_events')
        .delete()
        .eq('session_id', sessionId);
      if (!error) {
        setUserJourneys(prev => prev.filter(j => j.session_id !== sessionId));
      } else {
        console.error('Failed to delete journey:', error);
      }
    } catch (err) {
      console.error('Error deleting journey:', err);
    }
    setDeletingId(null);
  }, []);

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

      setUserJourneys(journeys);

      // Calculate metrics
      const totalSessions = journeys.length;
      const completedOnboarding = journeys.filter(j => 
        j.steps.some(s => s.completed && s.step_number >= 23)
      ).length;
      const completionRate = totalSessions > 0 ? (completedOnboarding / totalSessions) * 100 : 0;

      // Find most common drop-off point
      const dropOffCounts = new Map<string, number>();
      journeys.forEach(j => {
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
      background: 'linear-gradient(135deg, #0a0a0c 0%, #1a1a2e 100%)',
      color: '#fff',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/app/admin')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <ArrowLeft size={16} />
            Back to Admin
          </button>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}>
              Onboarding Analytics
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Track user progress through onboarding steps
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Users
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
                {metrics.totalSessions}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Completed
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {metrics.completedOnboarding}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Completion Rate
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                {metrics.completionRate.toFixed(0)}%
              </div>
            </div>

            {metrics.dropOffStep && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Common Drop-off
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
                  {metrics.dropOffStep}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Journeys */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'rgba(255, 255, 255, 0.9)' }}>
              User Journeys ({userJourneys.length})
            </h2>
            <button
              onClick={loadAnalytics}
              disabled={loading}
              style={{
                background: loading ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⟳ Loading...' : '↻ Refresh'}
            </button>
          </div>

          {/* Legend */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              Completed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
              Subscribed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              Skipped
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              Dropped
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
              Not Reached
            </div>
          </div>

          {/* Journey List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
            {userJourneys.map((journey) => {
              const completedStepNumbers = new Set(journey.steps.filter(s => s.completed && !s.skipped).map(s => s.step_number));
              const skippedStepNumbers = new Set(journey.steps.filter(s => s.skipped).map(s => s.step_number));
              const hasSubscribed = journey.steps.some(s => s.step === 'subscription');
              const isFullyCompleted = completedStepNumbers.size >= 11;
              const isDeleting = deletingId === journey.session_id;
              
              return (
                <div 
                  key={journey.session_id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, sessionId: journey.session_id, username: journey.username });
                  }}
                  style={{
                    background: isDeleting ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isDeleting ? 'rgba(239,68,68,0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s',
                    opacity: isDeleting ? 0.5 : 1,
                    cursor: 'context-menu',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  {/* User Info */}
                  <div style={{ minWidth: '140px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: hasSubscribed ? '#fbbf24' : '#fff', marginBottom: '2px' }}>
                      {journey.username}{hasSubscribed ? ' 💎' : ''}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.35)' }}>
                      {new Date(journey.lastActiveTime).toLocaleDateString()} {new Date(journey.lastActiveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Step Dots */}
                  <div style={{ display: 'flex', gap: '5px', flex: 1, flexWrap: 'wrap' }}>
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

                      return (
                        <div
                          key={step.id}
                          title={tooltipText}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: color,
                            transition: 'transform 0.15s, background 0.2s',
                            cursor: 'help',
                            flexShrink: 0,
                            opacity: step.optional ? 0.8 : 1,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.6)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        />
                      );
                    })}
                  </div>

                  {/* Completion Status */}
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    color: hasSubscribed ? '#fbbf24' : isFullyCompleted ? '#10b981' : '#ef4444',
                    minWidth: '60px',
                    textAlign: 'right'
                  }}>
                    {completedStepNumbers.size}/{ONBOARDING_STEPS.length}
                    {skippedStepNumbers.size > 0 && (
                      <span style={{ color: '#f59e0b', marginLeft: '4px' }}>(-{skippedStepNumbers.size})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
            onClick={() => deleteJourney(contextMenu.sessionId)}
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
            🗑 Delete journey
          </button>
        </div>
      )}
    </div>
  );
}
