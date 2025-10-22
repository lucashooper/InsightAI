import React, { useState } from 'react';
import { entryBadgeService } from '../../services/entryBadgeService';
import type { ThemeIcon } from '../../services/entryBadgeService';

interface ThemeIconTooltipProps {
  icon: ThemeIcon;
  onHover?: (isHovering: boolean) => void;
}

export const ThemeIconTooltip: React.FC<ThemeIconTooltipProps> = ({ icon, onHover }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    onHover?.(false);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        fontSize: '0.7rem',
        opacity: showTooltip ? 1 : 0.9,
        cursor: 'help',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        transform: showTooltip ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {entryBadgeService.getThemeEmoji(icon)}
      
      {/* Enhanced Tooltip Popover */}
      {showTooltip && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '6px 10px',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          color: '#E5E7EB',
          fontSize: '0.75rem',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          animation: 'tooltipFadeIn 0.15s ease-out',
        }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}>
            <span style={{ fontSize: '0.9rem' }}>{entryBadgeService.getThemeEmoji(icon)}</span>
            <span>Theme: {entryBadgeService.getThemeLabel(icon)}</span>
          </span>
          {/* Tooltip Arrow */}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '4px solid rgba(0, 0, 0, 0.95)',
          }} />
        </span>
      )}
      
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </span>
  );
};
