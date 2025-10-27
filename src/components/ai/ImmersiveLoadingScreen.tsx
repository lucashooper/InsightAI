import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import TypewriterText from './TypewriterText';
import Spinner from './Spinner';

interface ImmersiveLoadingScreenProps {
  isVisible: boolean;
  onMinimumDurationComplete?: () => void;
}

const ImmersiveLoadingScreen: React.FC<ImmersiveLoadingScreenProps> = ({ isVisible, onMinimumDurationComplete }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number; twinkleDelay: number }>>([]);
  const minimumDurationTimer = useRef<NodeJS.Timeout | null>(null);

  // Generate starfield on mount
  useEffect(() => {
    const generatedStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleDelay: Math.random() * 3
    }));
    setStars(generatedStars);
  }, []);

  // Enforce minimum display duration
  useEffect(() => {
    if (isVisible) {
      minimumDurationTimer.current = setTimeout(() => {
        if (onMinimumDurationComplete) {
          onMinimumDurationComplete();
        }
      }, 8000); // 8 second minimum
    } else {
      if (minimumDurationTimer.current) {
        clearTimeout(minimumDurationTimer.current);
      }
    }

    return () => {
      if (minimumDurationTimer.current) {
        clearTimeout(minimumDurationTimer.current);
      }
    };
  }, [isVisible, onMinimumDurationComplete]);

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Solid Backdrop - Blocks everything behind */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9998,
          background: '#000000',
          pointerEvents: 'none'
        }}
      />
      
      {/* Main Loading Screen */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-in',
          overflow: 'hidden'
        }}
      >
      {/* Animated Starfield Background */}
      {stars.map((star, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: star.size > 1.5 ? '#58a6ff' : '#ffffff',
            opacity: star.opacity,
            animation: `twinkle ${2 + star.twinkleDelay}s ease-in-out infinite`,
            animationDelay: `${star.twinkleDelay}s`,
            boxShadow: star.size > 1.5 ? '0 0 4px #58a6ff' : 'none'
          }}
        />
      ))}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(56, 189, 248, 0.6));
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
          borderRadius: '24px',
          padding: '4rem 5rem',
          maxWidth: '700px',
          width: '70%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 60px rgba(56, 189, 248, 0.3)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          textAlign: 'center',
          position: 'relative',
          animation: 'float 3s ease-in-out infinite',
          zIndex: 1
        }}
      >
        {/* Animated Prism Icon */}
        <div
          style={{
            marginBottom: '2rem',
            display: 'inline-block',
            animation: 'glow 2s ease-in-out infinite'
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.6))'
            }}
          >
            {/* Outer rotating hexagon */}
            <g style={{ animation: 'rotate 8s linear infinite', transformOrigin: '60px 60px' }}>
              <path
                d="M60 10 L95 32.5 L95 67.5 L60 90 L25 67.5 L25 32.5 Z"
                stroke="#58a6ff"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
            </g>
            {/* Middle pulsing hexagon */}
            <g style={{ animation: 'pulse 2s ease-in-out infinite', transformOrigin: '60px 60px' }}>
              <path
                d="M60 20 L85 35 L85 65 L60 80 L35 65 L35 35 Z"
                stroke="#58a6ff"
                strokeWidth="2.5"
                fill="rgba(56, 189, 248, 0.1)"
                opacity="0.6"
              />
            </g>
            {/* Inner core */}
            <circle
              cx="60"
              cy="50"
              r="15"
              fill="url(#prismGradient)"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            {/* Connecting nodes */}
            <circle cx="60" cy="20" r="4" fill="#58a6ff" opacity="0.8" />
            <circle cx="85" cy="35" r="4" fill="#58a6ff" opacity="0.8" />
            <circle cx="85" cy="65" r="4" fill="#58a6ff" opacity="0.8" />
            <circle cx="60" cy="80" r="4" fill="#58a6ff" opacity="0.8" />
            <circle cx="35" cy="65" r="4" fill="#58a6ff" opacity="0.8" />
            <circle cx="35" cy="35" r="4" fill="#58a6ff" opacity="0.8" />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#58a6ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#4c9aff', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Main Title with Typewriter */}
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#E5E7EB',
            marginBottom: '1.5rem',
            lineHeight: '1.4',
            minHeight: '2.8rem'
          }}
        >
          <TypewriterText
            text="Prism is analyzing your thoughts..."
            speed={60}
            onComplete={() => setShowSubtitle(true)}
          />
        </h2>

        {/* Subtitle with Typewriter */}
        <p
          style={{
            fontSize: '1.1rem',
            color: '#9CA3AF',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto 2.5rem',
            minHeight: '4rem'
          }}
        >
          {showSubtitle && (
            <TypewriterText
              text="Our AI is reading your entry and generating personalized insights."
              speed={50}
            />
          )}
        </p>

        {/* Spinner */}
        <div style={{ marginTop: '2rem' }}>
          <Spinner size="large" />
        </div>

        {/* Animated Dots */}
        <div
          style={{
            marginTop: '1.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
            letterSpacing: '0.1em'
          }}
        >
          <span
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0s'
            }}
          >
            •
          </span>
          <span
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.3s',
              marginLeft: '0.5rem'
            }}
          >
            •
          </span>
          <span
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.6s',
              marginLeft: '0.5rem'
            }}
          >
            •
          </span>
        </div>

        {/* Subtle Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '24px',
            background: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
    </>,
    document.body
  );
};

export default ImmersiveLoadingScreen;
