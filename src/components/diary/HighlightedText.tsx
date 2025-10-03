import React, { useState, useRef, useEffect } from 'react';
import type { DetectedPattern } from '../../services/keywordHighlightService';
import { keywordHighlightService } from '../../services/keywordHighlightService';

interface HighlightedTextProps {
  content: string;
  patterns: DetectedPattern[];
  isEnabled: boolean;
}

interface TooltipProps {
  pattern: DetectedPattern;
  x: number;
  y: number;
}

const Tooltip: React.FC<TooltipProps> = ({ pattern, x, y }) => {
  const tooltipData = keywordHighlightService.generateTooltipContent(pattern);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y - 80}px`,
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        minWidth: '200px',
        maxWidth: '280px',
        zIndex: 10000,
        pointerEvents: 'none',
        animation: 'fadeIn 0.2s ease-out',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: '0.25rem'
      }}>
        {tooltipData.title}
      </div>
      <div style={{
        fontSize: '0.75rem',
        color: '#A0A0A0',
        marginBottom: tooltipData.link ? '0.5rem' : '0'
      }}>
        {tooltipData.subtitle}
      </div>
      {tooltipData.link && (
        <div style={{
          fontSize: '0.75rem',
          color: pattern.color,
          fontWeight: '500',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {tooltipData.link}
        </div>
      )}
      {/* Arrow pointing down */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '12px',
        height: '12px',
        background: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderTop: 'none',
        borderLeft: 'none'
      }} />
    </div>
  );
};

export const HighlightedText: React.FC<HighlightedTextProps> = ({ content, patterns, isEnabled }) => {
  const [hoveredMatch, setHoveredMatch] = useState<{ pattern: DetectedPattern; x: number; y: number } | null>(null);
  const spanRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  useEffect(() => {
    // Add fade-in animation to document if not already present
    if (!document.getElementById('highlight-animations')) {
      const style = document.createElement('style');
      style.id = 'highlight-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isEnabled || patterns.length === 0) {
    return <>{content}</>;
  }

  const matches = keywordHighlightService.findMatchesInText(content, patterns);

  // Limit to 4 highlights per entry to avoid overwhelming
  const limitedMatches = matches.slice(0, 4);

  if (limitedMatches.length === 0) {
    return <>{content}</>;
  }

  // Build segments of text (highlighted and non-highlighted)
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  limitedMatches.forEach((match, idx) => {
    // Add text before highlight
    if (match.startIndex > lastIndex) {
      segments.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex, match.startIndex)}
        </span>
      );
    }

    // Add highlighted text
    segments.push(
      <span
        key={`highlight-${idx}`}
        ref={(el) => {
          if (el) spanRefs.current.set(idx, el);
        }}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredMatch({
            pattern: match.pattern,
            x: rect.left + rect.width / 2,
            y: rect.top
          });
        }}
        onMouseLeave={() => setHoveredMatch(null)}
        style={{
          borderBottom: `2px dotted ${match.pattern.color}`,
          opacity: 0.85,
          cursor: 'help',
          transition: 'opacity 0.2s ease',
          textDecoration: 'none'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '0.85';
        }}
      >
        {match.text}
      </span>
    );

    lastIndex = match.endIndex;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push(
      <span key={`text-${lastIndex}`}>
        {content.substring(lastIndex)}
      </span>
    );
  }

  return (
    <>
      {segments}
      {hoveredMatch && (
        <Tooltip
          pattern={hoveredMatch.pattern}
          x={hoveredMatch.x}
          y={hoveredMatch.y}
        />
      )}
    </>
  );
};
