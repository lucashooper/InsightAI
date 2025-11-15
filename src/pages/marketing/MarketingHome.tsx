import React from 'react';

/**
 * Marketing landing page - renders the marketing site via iframe.
 * 
 * The marketing site is built separately and served from /marketing-dist.
 * This approach avoids TypeScript conflicts between the two projects.
 */
const MarketingHome: React.FC = () => {
  return (
    <iframe
      src="/marketing-dist/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      title="InsightAI Marketing"
    />
  );
};

export default MarketingHome;
