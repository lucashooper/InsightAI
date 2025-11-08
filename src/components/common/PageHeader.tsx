import React from 'react';

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * Standardized Page Header Component
 * Left-aligned title with optional icon, subtitle, and right-side actions
 */
const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle, actions }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem',
      gap: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {icon && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: '#8b5cf6'
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            color: '#e5e7ff',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.9rem',
              color: '#9ca3af',
              fontWeight: '400'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
