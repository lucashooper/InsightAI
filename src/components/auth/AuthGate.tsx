import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import { supabase } from '../../services/supabaseClient';
import Login from './Login';
import Signup from './Signup';
import UsernameScreen from './UsernameScreen';
import WelcomeScreen from './WelcomeScreen';
import MembershipPage from '../membership/MembershipPage';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      // ALWAYS get fresh session to avoid stale user data
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const currentUser = session.user;
        console.log('=== CHECKING USER PROFILE ===');
        console.log('Session user ID:', currentUser.id);
        console.log('Session user email:', currentUser.email);
        console.log('User metadata:', currentUser.user_metadata);
        
        // Check for context/session mismatch
        if (user && user.id !== currentUser.id) {
          console.error('⚠️ USER ID MISMATCH DETECTED!');
          console.error('Context user ID:', user.id);
          console.error('Session user ID:', currentUser.id);
          console.error('USING SESSION USER (correct) instead of context user');
        }
        
        try {
          // Use session user ID, not context user ID
          let profile = await userProfileService.getUserProfile(currentUser.id);
          console.log('Profile lookup result:', profile ? 'Found' : 'Not found');
          if (profile) {
            console.log('Profile user_id:', profile.user_id);
            console.log('Profile email:', profile.email);
          }
          
          if (!profile) {
            // NEW USER - Show username setup screen
            console.log('New user detected - showing username setup for:', currentUser.id);
            setShowUsernameSetup(true);
            setShowWelcome(false);
            setShowMembership(false);
          } else if (!profile.has_completed_welcome) {
            // EXISTING profile but hasn't completed onboarding - show welcome then membership
            setShowUsernameSetup(false);
            setShowWelcome(true);
            setShowMembership(false);
          } else {
            // EXISTING user with completed onboarding
            setShowUsernameSetup(false);
            setShowWelcome(false);
            setShowMembership(false);
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          setShowWelcome(false);
        }
      }
      setCheckingProfile(false);
    };

    if (!loading) {
      checkUserProfile();
    }
  }, [user, loading]);

  if (loading || checkingProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  // Show username setup for brand new users
  if (showUsernameSetup) {
    return (
      <UsernameScreen 
        onComplete={() => {
          // After username is set, show welcome screen
          setShowUsernameSetup(false);
          setShowWelcome(true);
        }}
      />
    );
  }

  // Show welcome screen (with features)
  if (showWelcome) {
    return <WelcomeScreen />;
  }

  // Show membership page
  if (showMembership) {
    return (
      <MembershipPage 
        onSuccess={() => {
          // After successful payment, complete onboarding
          setShowMembership(false);
        }}
        onSkip={() => {
          // If user skips, complete onboarding anyway
          setShowMembership(false);
        }}
      />
    );
  }

  return <>{children}</>;
};

export default AuthGate;
