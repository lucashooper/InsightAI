import React from 'react';
// Import marketing components directly
import MarketingApp from '../../../marketing/App';
import '../../../marketing/styles-premium.css';

/**
 * Marketing landing page - renders the marketing site.
 * 
 * Imports the marketing site's React app directly from /marketing folder.
 */
const MarketingHome: React.FC = () => {
  return (
    <div className="marketing-home">
      <MarketingApp />
    </div>
  );
};

export default MarketingHome;
