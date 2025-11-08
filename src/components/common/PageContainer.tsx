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
    <div className={`page-container ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
