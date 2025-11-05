import React from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';

interface InsightBriefingModalProps {
  isOpen: boolean;
  primaryEmotion: string;
  emotionIntensity: number;
  summaryText: string;
  topEmotions?: Array<{ emotion: string; percentage: number }>;
  onViewFullAnalysis: () => void;
}

export const InsightBriefingModal: React.FC<InsightBriefingModalProps> = ({
  isOpen,
  primaryEmotion,
  emotionIntensity,
  summaryText,
  topEmotions = [],
  onViewFullAnalysis
}) => {
  const [expandedEmotion, setExpandedEmotion] = React.useState<number | null>(null);
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* Modal Container - Premium Glassmorphism */}
        <div 
          style={{
            maxWidth: window.innerWidth <= 768 ? '95%' : '900px',
            width: '100%',
            minHeight: window.innerWidth <= 768 ? '400px' : '500px',
            height: 'auto',
            maxHeight: window.innerWidth <= 768 ? '90vh' : '85vh',
            position: 'relative',
            background: `
              linear-gradient(135deg, rgba(15, 18, 25, 0.98) 0%, rgba(20, 25, 35, 0.95) 50%, rgba(15, 18, 25, 0.98) 100%)
            `,
            borderRadius: '24px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.05) inset,
              0 8px 32px rgba(0, 0, 0, 0.6),
              0 24px 64px rgba(0, 0, 0, 0.4),
              0 0 120px rgba(139, 92, 246, 0.1)
            `,
            overflow: 'hidden',
            animation: 'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)'
          }}
        >
          {/* Noise/Grain Texture Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            opacity: 0.03,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            zIndex: 1
          }} />
          
          {/* Gradient Accent Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }} />
          {/* Premium Badge */}
          <div style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            padding: '0.4rem 0.9rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'white',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <PremiumIcons.Sparkles size={12} />
            Premium Insight
          </div>

          {/* Two-Column Layout (Single column on mobile, 60/40 on desktop) */}
          <div style={{
            display: window.innerWidth <= 768 ? 'flex' : 'grid',
            flexDirection: window.innerWidth <= 768 ? 'column' : undefined,
            gridTemplateColumns: window.innerWidth <= 768 ? undefined : '1.5fr 1fr',
            gap: window.innerWidth <= 768 ? '1.5rem' : '0',
            height: '100%',
            overflowY: window.innerWidth <= 768 ? 'auto' : 'visible',
            paddingBottom: window.innerWidth <= 768 ? '2rem' : '0'
          }}>
            {/* Left Panel - Narrative Summary */}
            <div style={{
              padding: window.innerWidth <= 768 ? '2rem 1.5rem' : '3.5rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: window.innerWidth <= 768 ? 'flex-start' : 'space-between',
              gap: window.innerWidth <= 768 ? '1.5rem' : '0',
              background: window.innerWidth <= 768 ? 'transparent' : `
                linear-gradient(135deg, rgba(12, 15, 22, 0.6) 0%, rgba(18, 22, 32, 0.4) 50%, rgba(12, 15, 22, 0.6) 100%)
              `,
              borderRight: window.innerWidth <= 768 ? 'none' : '1px solid rgba(139, 92, 246, 0.15)',
              borderBottom: 'none',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: window.innerWidth <= 768 ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: window.innerWidth <= 768 ? 'none' : 'blur(20px)',
              zIndex: 2
            }}>
              {/* Subtle inner glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
              <div>
                {/* Headline */}
                <h2 style={{
                  margin: '0 0 1rem 0',
                  fontSize: window.innerWidth <= 768 ? '1.75rem' : '2.5rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 30%, #c7d2fe 60%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                  filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))'
                }}>
                  Your Entry's Briefing
                </h2>

                {/* Subheadline */}
                <p style={{
                  margin: '0 0 2rem 0',
                  fontSize: '0.95rem',
                  color: '#9CA3AF',
                  fontStyle: 'italic',
                  letterSpacing: '0.01em'
                }}>
                  Reflect deeply to find patterns and connections between your thoughts and emotions.
                </p>

                {/* Summary Text - Premium Card */}
                <div style={{
                  padding: '1.75rem',
                  position: 'relative',
                  background: `
                    linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)
                  `,
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  marginBottom: '2rem',
                  boxShadow: `
                    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    0 1px 2px rgba(139, 92, 246, 0.2)
                  `,
                  overflow: 'hidden'
                }}>
                  {/* Subtle top highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                    pointerEvents: 'none'
                  }} />
                  <p style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    lineHeight: '1.75',
                    color: '#E5E7EB',
                    fontWeight: '400'
                  }}>
                    {summaryText}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={onViewFullAnalysis}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  letterSpacing: '0.02em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)';
                }}
              >
                View Full Analysis
                <PremiumIcons.ChevronRight size={20} />
              </button>
            </div>

            {/* Right Panel - Data Visualization with Universe Theme */}
            <div style={{
              padding: window.innerWidth <= 768 ? '2rem 1.5rem 2.5rem' : '3.5rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: window.innerWidth <= 768 ? '1.5rem' : '2rem',
              background: window.innerWidth <= 768 ? 'transparent' : 'radial-gradient(circle at center, rgba(15, 15, 20, 1) 0%, rgba(8, 8, 12, 1) 100%)',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 2
            }}>
              {/* Dense Star Field - Purple Stars */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(2px 2px at 15% 25%, #8b5cf6, transparent),
                  radial-gradient(1px 1px at 25% 35%, #a78bfa, transparent),
                  radial-gradient(2px 2px at 35% 15%, #7c3aed, transparent),
                  radial-gradient(1px 1px at 45% 45%, #8b5cf6, transparent),
                  radial-gradient(2px 2px at 55% 65%, #a78bfa, transparent),
                  radial-gradient(1px 1px at 65% 25%, #c4b5fd, transparent),
                  radial-gradient(2px 2px at 75% 85%, #8b5cf6, transparent),
                  radial-gradient(1px 1px at 85% 35%, #a78bfa, transparent),
                  radial-gradient(1px 1px at 20% 75%, #7c3aed, transparent),
                  radial-gradient(2px 2px at 40% 90%, #8b5cf6, transparent),
                  radial-gradient(1px 1px at 60% 10%, #c4b5fd, transparent),
                  radial-gradient(1px 1px at 80% 55%, #a78bfa, transparent),
                  radial-gradient(2px 2px at 10% 60%, #8b5cf6, transparent),
                  radial-gradient(1px 1px at 30% 50%, #7c3aed, transparent),
                  radial-gradient(1px 1px at 50% 80%, #c4b5fd, transparent)
                `,
                opacity: 0.8,
                pointerEvents: 'none'
              }} />
              
              {/* Pink Stars Layer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(2px 2px at 18% 42%, #ec4899, transparent),
                  radial-gradient(1px 1px at 32% 68%, #f472b6, transparent),
                  radial-gradient(2px 2px at 48% 22%, #db2777, transparent),
                  radial-gradient(1px 1px at 62% 88%, #ec4899, transparent),
                  radial-gradient(1px 1px at 72% 48%, #f472b6, transparent),
                  radial-gradient(2px 2px at 88% 12%, #ec4899, transparent),
                  radial-gradient(1px 1px at 12% 78%, #f472b6, transparent),
                  radial-gradient(1px 1px at 42% 32%, #db2777, transparent),
                  radial-gradient(2px 2px at 68% 58%, #ec4899, transparent),
                  radial-gradient(1px 1px at 92% 72%, #f472b6, transparent)
                `,
                opacity: 0.6,
                pointerEvents: 'none'
              }} />
              
              {/* Blue Stars Layer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(2px 2px at 22% 18%, #6366f1, transparent),
                  radial-gradient(1px 1px at 38% 52%, #818cf8, transparent),
                  radial-gradient(2px 2px at 52% 72%, #4f46e5, transparent),
                  radial-gradient(1px 1px at 78% 28%, #6366f1, transparent),
                  radial-gradient(1px 1px at 8% 45%, #818cf8, transparent),
                  radial-gradient(2px 2px at 58% 38%, #6366f1, transparent),
                  radial-gradient(1px 1px at 28% 82%, #4f46e5, transparent),
                  radial-gradient(1px 1px at 82% 62%, #818cf8, transparent),
                  radial-gradient(2px 2px at 95% 85%, #6366f1, transparent),
                  radial-gradient(1px 1px at 5% 15%, #818cf8, transparent)
                `,
                opacity: 0.7,
                pointerEvents: 'none'
              }} />
              
              {/* White Accent Stars - Brightest */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(1px 1px at 14% 38%, white, transparent),
                  radial-gradient(2px 2px at 36% 62%, white, transparent),
                  radial-gradient(1px 1px at 54% 28%, white, transparent),
                  radial-gradient(1px 1px at 74% 78%, white, transparent),
                  radial-gradient(2px 2px at 86% 42%, white, transparent),
                  radial-gradient(1px 1px at 26% 8%, white, transparent),
                  radial-gradient(1px 1px at 46% 92%, white, transparent),
                  radial-gradient(1px 1px at 66% 18%, white, transparent),
                  radial-gradient(2px 2px at 96% 58%, white, transparent),
                  radial-gradient(1px 1px at 6% 68%, white, transparent)
                `,
                opacity: 0.9,
                pointerEvents: 'none'
              }} />
              {/* Primary Emotion Display */}
              <div style={{
                textAlign: 'center',
                marginBottom: '3rem'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#a78bfa',
                  marginBottom: '1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Primary Emotion
                </div>
                <h3 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '2.75rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {primaryEmotion}
                </h3>
                <div style={{
                  fontSize: '0.95rem',
                  color: '#c4b5fd',
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Intensity: {emotionIntensity}/10
                </div>
              </div>

              {/* Emotion Breakdown */}
              {topEmotions.length > 0 && (
                <div style={{
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#a78bfa',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    Emotion Breakdown
                  </div>
                  {topEmotions.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => setExpandedEmotion(expandedEmotion === index ? null : index)}
                      style={{
                        marginBottom: '1rem',
                        position: 'relative',
                        background: `
                          linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)
                        `,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 1,
                        boxShadow: `
                          0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                          0 4px 16px rgba(0, 0, 0, 0.4),
                          0 2px 4px rgba(139, 92, 246, 0.1)
                        `,
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Subtle top border glow */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
                        pointerEvents: 'none'
                      }} />
                      {/* Header - Always Visible */}
                      <div style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: '#E5E7EB',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {item.emotion}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#8b5cf6'
                          }}>
                            {item.percentage}%
                          </span>
                          <div style={{
                            transform: expandedEmotion === index ? 'rotate(90deg)' : 'rotate(0)',
                            transition: 'transform 0.3s ease',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <PremiumIcons.ChevronRight size={16} color="#a78bfa" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Expandable Content */}
                      {expandedEmotion === index && (
                        <div style={{
                          padding: '0 1.25rem 1rem 1.25rem',
                          fontSize: '0.85rem',
                          lineHeight: '1.6',
                          color: '#c4b5fd',
                          animation: 'slideDown 0.3s ease-out'
                        }}>
                          This emotion reflects a pattern in your entry. Understanding {item.emotion.toLowerCase()} can help you identify triggers and develop coping strategies.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            background-position: 0% 0%;
          }
          50% {
            opacity: 0.8;
            background-position: 100% 100%;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
          }
        }
      `}</style>
    </>
  );
};
