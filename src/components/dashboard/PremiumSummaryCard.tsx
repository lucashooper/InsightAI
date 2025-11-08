import React from 'react';
import { motion } from 'framer-motion';

interface PremiumSummaryCardProps {
  number: string | number;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  colorScheme: 'emerald' | 'teal' | 'amber' | 'blue' | 'purple' | 'cyan' | 'orange';
}

const colorSchemes = {
  emerald: {
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)',
    border: 'rgba(16, 185, 129, 0.3)',
    iconBg: 'rgba(16, 185, 129, 0.1)',
    iconBorder: 'rgba(16, 185, 129, 0.2)',
    iconShadow: 'rgba(16, 185, 129, 0.1)',
    textColor: '#10b981',
    orbColor: 'rgba(16, 185, 129, 0.2)',
    hoverBorder: 'rgba(16, 185, 129, 0.5)',
    hoverShadow: 'rgba(16, 185, 129, 0.3)'
  },
  teal: {
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.15) 100%)',
    border: 'rgba(20, 184, 166, 0.3)',
    iconBg: 'rgba(20, 184, 166, 0.1)',
    iconBorder: 'rgba(20, 184, 166, 0.2)',
    iconShadow: 'rgba(20, 184, 166, 0.1)',
    textColor: '#14b8a6',
    orbColor: 'rgba(20, 184, 166, 0.2)',
    hoverBorder: 'rgba(20, 184, 166, 0.5)',
    hoverShadow: 'rgba(20, 184, 166, 0.3)'
  },
  amber: {
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)',
    border: 'rgba(245, 158, 11, 0.3)',
    iconBg: 'rgba(245, 158, 11, 0.1)',
    iconBorder: 'rgba(245, 158, 11, 0.2)',
    iconShadow: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b',
    orbColor: 'rgba(245, 158, 11, 0.2)',
    hoverBorder: 'rgba(245, 158, 11, 0.5)',
    hoverShadow: 'rgba(245, 158, 11, 0.3)'
  },
  blue: {
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)',
    border: 'rgba(59, 130, 246, 0.3)',
    iconBg: 'rgba(59, 130, 246, 0.1)',
    iconBorder: 'rgba(59, 130, 246, 0.2)',
    iconShadow: 'rgba(59, 130, 246, 0.1)',
    textColor: '#3b82f6',
    orbColor: 'rgba(59, 130, 246, 0.2)',
    hoverBorder: 'rgba(59, 130, 246, 0.5)',
    hoverShadow: 'rgba(59, 130, 246, 0.3)'
  },
  purple: {
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)',
    border: 'rgba(139, 92, 246, 0.3)',
    iconBg: 'rgba(139, 92, 246, 0.1)',
    iconBorder: 'rgba(139, 92, 246, 0.2)',
    iconShadow: 'rgba(139, 92, 246, 0.1)',
    textColor: '#8b5cf6',
    orbColor: 'rgba(139, 92, 246, 0.2)',
    hoverBorder: 'rgba(139, 92, 246, 0.5)',
    hoverShadow: 'rgba(139, 92, 246, 0.3)'
  },
  cyan: {
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 145, 178, 0.15) 100%)',
    border: 'rgba(6, 182, 212, 0.3)',
    iconBg: 'rgba(6, 182, 212, 0.1)',
    iconBorder: 'rgba(6, 182, 212, 0.2)',
    iconShadow: 'rgba(6, 182, 212, 0.1)',
    textColor: '#06b6d4',
    orbColor: 'rgba(6, 182, 212, 0.2)',
    hoverBorder: 'rgba(6, 182, 212, 0.5)',
    hoverShadow: 'rgba(6, 182, 212, 0.3)'
  },
  orange: {
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.15) 100%)',
    border: 'rgba(249, 115, 22, 0.3)',
    iconBg: 'rgba(249, 115, 22, 0.1)',
    iconBorder: 'rgba(249, 115, 22, 0.2)',
    iconShadow: 'rgba(249, 115, 22, 0.1)',
    textColor: '#f97316',
    orbColor: 'rgba(249, 115, 22, 0.2)',
    hoverBorder: 'rgba(249, 115, 22, 0.5)',
    hoverShadow: 'rgba(249, 115, 22, 0.3)'
  }
};

const PremiumSummaryCard: React.FC<PremiumSummaryCardProps> = ({
  number,
  label,
  trend,
  icon,
  colorScheme
}) => {
  const colors = colorSchemes[colorScheme];
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: colors.gradient,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isHovered ? colors.hoverBorder : colors.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered 
          ? `0 12px 48px 0 ${colors.hoverShadow}`
          : `0 8px 32px 0 ${colors.iconShadow}`,
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Animated background orb */}
      <motion.div
        animate={{
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ duration: 0.7 }}
        style={{
          position: 'absolute',
          top: '-6rem',
          right: '-6rem',
          width: '12rem',
          height: '12rem',
          background: colors.orbColor,
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Label at top */}
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#9CA3AF',
          marginBottom: '1rem'
        }}>
          {label}
        </div>

        {/* Number + Icon side-by-side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Number - MASSIVE */}
          <div style={{
            fontSize: '4.5rem',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: '1',
            textShadow: `0 2px 8px ${colors.iconShadow}`
          }}>
            {number}
          </div>

          {/* Icon - decorative, next to number */}
          <div style={{
            color: `${colors.textColor}70`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7
          }}>
            {icon}
          </div>
        </div>

        {/* Trend */}
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            <span style={{
              color: colors.textColor,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span style={{ color: '#6B7280', fontWeight: '400' }}>
              from last period
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumSummaryCard;
