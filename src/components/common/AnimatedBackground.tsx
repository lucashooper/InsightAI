import React from 'react';

const AnimatedBackground: React.FC = () => {
  // Generate random stars for each layer
  const generateStars = (count: number, size: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * size + 1,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 20
    }));
  };

  const layer1Stars = generateStars(50, 2); // Small, distant stars
  const layer2Stars = generateStars(30, 3); // Medium stars
  const layer3Stars = generateStars(15, 4); // Large, close stars

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {/* Layer 1: Distant stars - slowest movement */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        animation: 'starfield1 60s linear infinite'
      }}>
        {layer1Stars.map(star => (
          <div
            key={`layer1-${star.id}`}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Layer 2: Medium stars - medium movement */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        animation: 'starfield2 40s linear infinite'
      }}>
        {layer2Stars.map(star => (
          <div
            key={`layer2-${star.id}`}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'radial-gradient(circle, rgba(56,189,248,0.9) 0%, rgba(56,189,248,0.5) 50%, transparent 100%)',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Layer 3: Close stars - fastest movement */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        animation: 'starfield3 25s linear infinite'
      }}>
        {layer3Stars.map(star => (
          <div
            key={`layer3-${star.id}`}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes starfield1 {
          0% { transform: translateX(0px) translateY(0px); }
          100% { transform: translateX(-100px) translateY(-50px); }
        }
        
        @keyframes starfield2 {
          0% { transform: translateX(0px) translateY(0px); }
          100% { transform: translateX(-150px) translateY(-75px); }
        }
        
        @keyframes starfield3 {
          0% { transform: translateX(0px) translateY(0px); }
          100% { transform: translateX(-200px) translateY(-100px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground; 