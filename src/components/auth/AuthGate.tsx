import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import { supabase } from '../../services/supabaseClient';
import Login from './Login';
import Signup from './Signup';
import WelcomeScreen from './WelcomeScreen';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        console.log('=== CHECKING USER PROFILE ===');
        console.log('Current user ID:', user.id);
        console.log('Current user email:', user.email);
        console.log('User metadata:', user.user_metadata);
        
        // Get fresh session to verify we have the correct user
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Fresh session user ID:', session?.user?.id);
        
        if (session?.user?.id && session.user.id !== user.id) {
          console.error('⚠️ USER ID MISMATCH DETECTED!');
          console.error('Context user ID:', user.id);
          console.error('Session user ID:', session.user.id);
          console.error('This indicates a session conflict - using session user');
        }
        
        try {
          let profile = await userProfileService.getUserProfile(user.id);
          console.log('Profile lookup result:', profile ? 'Found' : 'Not found');
          if (profile) {
            console.log('Profile user_id:', profile.user_id);
            console.log('Profile email:', profile.email);
          }
          
          if (!profile) {
            // Create profile if it doesn't exist
            console.log('Creating user profile for:', user.id);
            profile = await userProfileService.createUserProfile(
              user.id,
              user.user_metadata.username || user.email?.split('@')[0] || 'User',
              user.email || ''
            );
            
            if (profile) {
              setShowWelcome(true);
            } else {
              console.error('Failed to create user profile');
              setShowWelcome(false);
            }
          } else if (!profile.has_completed_welcome) {
            setShowWelcome(true);
          } else {
            setShowWelcome(false);
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

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
};

export default AuthGate;
