import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { userProfileService } from '../../services/userProfileService';

/**
 * DEBUG PANEL - Shows current user session info
 * Add this temporarily to see which account you're logged into
 * 
 * To use: Import and add <UserDebugPanel /> at the top of App.tsx
 */
const UserDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadDebugInfo = async () => {
      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session?.user || null);

      // Get profile
      if (session?.user) {
        const userProfile = await userProfileService.getUserProfile(session.user.id);
        setProfile(userProfile);
      }
    };

    loadDebugInfo();
  }, [user]);

  const handleClearSessions = async () => {
    if (confirm('This will sign you out and clear all sessions. Continue?')) {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '350px',
      zIndex: 99999,
      border: '2px solid #8b5cf6',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#8b5cf6' }}>
        🔍 DEBUG: User Session Info
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Context User ID:</strong>
        <div style={{ color: user?.id === sessionUser?.id ? '#22c55e' : '#ef4444' }}>
          {user?.id || 'null'}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Session User ID:</strong>
        <div style={{ color: '#22c55e' }}>
          {sessionUser?.id || 'null'}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Email:</strong>
        <div>{sessionUser?.email || 'null'}</div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Profile Username:</strong>
        <div style={{ color: '#fbbf24' }}>
          {profile?.username || 'Loading...'}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Profile Email:</strong>
        <div>{profile?.email || 'Loading...'}</div>
      </div>

      {user?.id !== sessionUser?.id && (
        <div style={{
          padding: '8px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          marginBottom: '8px',
          color: '#ef4444'
        }}>
          ⚠️ MISMATCH DETECTED!
        </div>
      )}

      <button
        onClick={handleClearSessions}
        style={{
          width: '100%',
          padding: '8px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '8px'
        }}
      >
        🚪 Force Logout & Clear All
      </button>

      <div style={{
        marginTop: '8px',
        fontSize: '10px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        Remove this component when done debugging
      </div>
    </div>
  );
};

export default UserDebugPanel;
