import React, { useState } from 'react';
import Login from '../../components/auth/Login';
import Signup from '../../components/auth/Signup';

/**
 * Login/Signup page.
 * 
 * After successful login, RedirectIfAuthenticated wrapper will redirect to /app.
 */
const LoginPage: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="login-page">
      {showSignup ? (
        <Signup 
          onSwitchToLogin={() => setShowSignup(false)}
        />
      ) : (
        <Login 
          onSwitchToSignup={() => setShowSignup(true)}
        />
      )}
    </div>
  );
};

export default LoginPage;
