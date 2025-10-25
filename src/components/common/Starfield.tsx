import React, { useMemo } from 'react';
import './starfield.css';

interface Star {
  id: number;
  size: 'small' | 'medium' | 'large';
  style: React.CSSProperties;
}

interface StarfieldProps {
  count?: number;
  className?: string;
}

const Starfield: React.FC<StarfieldProps> = ({ count = 150, className = '' }) => {
  const stars = useMemo<Star[]>(() => {
    const starArray: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      // Weighted randomization: more small stars, fewer large ones
      const rand = Math.random();
      const size: 'small' | 'medium' | 'large' = 
        rand < 0.6 ? 'small' : 
        rand < 0.9 ? 'medium' : 
        'large';
      
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 4;
      
      starArray.push({
        id: i,
        size,
        style: {
          left: `${x}%`,
          top: `${y}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          '--base-opacity': 
            size === 'small' ? '0.3' : 
            size === 'medium' ? '0.5' : 
            '0.7'
        } as React.CSSProperties,
      });
    }
    
    return starArray;
  }, [count]);

  return (
    <div className={`starfield-container ${className}`}>
      {stars.map(star => (
        <div
          key={star.id}
          className={`star star-${star.size}`}
          style={star.style}
        />
      ))}
    </div>
  );
};

export default Starfield;
