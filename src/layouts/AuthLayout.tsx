import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout for authentication pages (login, signup).
 * Simple wrapper that provides consistent styling for auth pages.
 */
const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
