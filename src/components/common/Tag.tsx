import React from 'react';

export type TagVariant = 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'purple';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ 
  children, 
  variant = 'neutral',
  size = 'md',
  icon
}) => {
  const getColors = (variant: TagVariant) => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
          text: '#3b82f6'
        };
      case 'success':
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.3)',
          text: '#22c55e'
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
          text: '#f59e0b'
        };
      case 'info':
        return {
          bg: 'rgba(56, 189, 248, 0.1)',
          border: 'rgba(56, 189, 248, 0.3)',
          text: '#38bdf8'
        };
      case 'purple':
        return {
          bg: 'rgba(139, 92, 246, 0.1)',
          border: 'rgba(139, 92, 246, 0.3)',
          text: '#8b5cf6'
        };
      case 'neutral':
      default:
        return {
          bg: 'rgba(156, 163, 175, 0.1)',
          border: 'rgba(156, 163, 175, 0.3)',
          text: '#9CA3AF'
        };
    }
  };

  const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.125rem 0.375rem',
          fontSize: '0.7rem'
        };
      case 'lg':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: '0.875rem'
        };
      case 'md':
      default:
        return {
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem'
        };
    }
  };

  const colors = getColors(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: icon ? '0.25rem' : '0',
      ...sizeStyles,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '4px',
      color: colors.text,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      whiteSpace: 'nowrap',
    }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
