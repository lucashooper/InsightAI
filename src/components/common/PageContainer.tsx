import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Global Page Container - Provides consistent width, padding, and centering
 * for all main page views (Dashboard, My Notes, Playbook, etc.)
 * 
 * Inspired by Whop's architecture for a professional, seamless layout
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`page-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        padding: '0.5rem 1.5rem 2rem 1.5rem',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
