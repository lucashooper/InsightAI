import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color = '#38BDF8' }) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `2px solid rgba(56, 189, 248, 0.2)`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );
};

export default Spinner; 