import React from 'react';
import { useNavigate } from 'react-router-dom';
import MembershipPage from '../components/membership/MembershipPage';

const MembershipRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // After successful subscription, redirect to dashboard or home
    navigate('/');
  };

  const handleSkip = () => {
    // If user skips, also redirect to home
    navigate('/');
  };

  return <MembershipPage onSuccess={handleSuccess} onSkip={handleSkip} />;
};

export default MembershipRoute;
