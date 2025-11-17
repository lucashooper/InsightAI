import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Layout for marketing pages (public).
 * 
 * Optional: Redirects authenticated users to /app after a short delay.
 * This provides a smooth UX without flashing content.
 */
const MarketingLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and lands on marketing page, gently redirect to app
    // Only redirect if we're actually on the root path to avoid loops
    if (!loading && user && window.location.pathname === '/') {
      const timer = setTimeout(() => {
        navigate('/app', { replace: true });
      }, 500); // 500ms delay to avoid jarring redirect

      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="marketing-layout">
      <Outlet />
    </div>
  );
};

export default MarketingLayout;
