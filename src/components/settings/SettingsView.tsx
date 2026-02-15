import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Edit2, LogOut, Trash2, Palette, Bell, Download, Check, X, Loader, MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import type { UserProfile } from '../../services/userProfileService';
import { importDiaryEntries } from '../../utils/importDiaryEntries';
import { usageTrackingService } from '../../services/usageTrackingService';
import { feedbackService } from '../../services/feedbackService';
import { MigrationButton } from './MigrationButton';
import SubscriptionModal from './SubscriptionModal';
import './settings.css';
import '../../styles/page-layout.css';
import '../../styles/settings-layout.css';

const SettingsView: React.FC = () => {
  console.log('🎨 [SettingsView] Component rendering');
  
  const { theme, setTheme } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, setPrivacyMode] = useState(false);
  const [usageStats, setUsageStats] = useState<{ count: number; limit: number; tier: string } | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Load settings only once on mount
  useEffect(() => {
    console.log(' [SettingsView] Initial mount - loading settings');

    // Load saved settings
    const savedReminders = localStorage.getItem('insightai-reminders-enabled');
    const savedTime = localStorage.getItem('insightai-reminder-time');
    
    if (savedReminders) {
      setRemindersEnabled(JSON.parse(savedReminders));
    }
    if (savedTime) {
      setReminderTime(savedTime);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load privacy mode setting
    const savedPrivacyMode = localStorage.getItem('insightai-privacy-mode');
    setPrivacyMode(savedPrivacyMode === 'true');
  }, []); // Only run once on mount

  // Load user profile when user changes
  useEffect(() => {
    if (!user) {
      console.log('⏭️ [SettingsView] No user, skipping profile load');
      return;
    }

    console.log('📥 [SettingsView] Loading user profile for:', user.id);
    
    const loadUserProfile = async () => {
      try {
        const profile = await userProfileService.getUserProfile(user.id);
        console.log('✅ [SettingsView] Profile loaded:', profile);
        if (profile) {
          setUserProfile(profile);
          setNewUsername(profile.username);
        }
      } catch (error) {
        console.error('❌ [SettingsView] Error loading profile:', error);
      }
    };
    
    loadUserProfile();
  }, [user?.id]); // Only re-run when user ID changes

  // Load usage statistics once on mount
  useEffect(() => {
    console.log(' [SettingsView] Loading usage stats');
    
    const loadUsageStats = async () => {
      try {
        const stats = await usageTrackingService.getTodayUsage('ai_analysis');
        console.log(' [SettingsView] Stats loaded:', stats);
        console.log(' [SettingsView] Tier from stats:', stats.tier);
        console.log(' [SettingsView] Is Pro?', stats.tier === 'pro');
        setUsageStats(stats);
      } catch (error) {
        console.error(' [SettingsView] Error loading stats:', error);
      }
    };
    
    loadUsageStats();
  }, []); // Only run once on mount

  const handleThemeChange = (newTheme: 'dark' | 'vibrant' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'light') => {
    setTheme(newTheme);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTitle.trim() || !feedbackMessage.trim()) {
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackSuccess(false);

    const result = await feedbackService.submitFeedback(feedbackTitle, feedbackMessage);

    setSubmittingFeedback(false);

    if (result.success) {
      setFeedbackSuccess(true);
      setFeedbackTitle('');
      setFeedbackMessage('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setFeedbackSuccess(false);
      }, 3000);
    }
  };

  const handleRemindersToggle = async () => {
    if (!remindersEnabled) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          setRemindersEnabled(true);
          localStorage.setItem('insightai-reminders-enabled', 'true');
          scheduleReminder();
        }
      }
    } else {
      setRemindersEnabled(false);
      localStorage.setItem('insightai-reminders-enabled', 'false');
      // Clear existing reminders
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
    }
  };

  const handleTimeChange = (newTime: string) => {
    setReminderTime(newTime);
    localStorage.setItem('insightai-reminder-time', newTime);
    if (remindersEnabled) {
      scheduleReminder();
    }
  };

  const scheduleReminder = () => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        // Schedule daily notification
        const [hours, minutes] = reminderTime.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();
        
        setTimeout(() => {
          new Notification('Insight Reminder', {
            body: 'Time to reflect on your day. How are you feeling?',
            icon: '/vite.svg',
            tag: 'daily-reminder'
          });
        }, delay);
      });
    }
  };

  const handleImportDiaryEntries = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importDiaryEntries();
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;
    
    const updatedProfile = await userProfileService.updateUserProfile(user.id, {
      username: newUsername.trim()
    });
    
    if (updatedProfile) {
      setUserProfile(updatedProfile);
      setIsEditingUsername(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    setUploadingImage(true);
    
    const imageUrl = await userProfileService.uploadProfilePicture(user.id, file);
    
    if (imageUrl && userProfile) {
      setUserProfile({ ...userProfile, profile_picture_url: imageUrl });
    }
    
    setUploadingImage(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    const { error } = await deleteAccount();
    
    if (error) {
      alert('Failed to delete account: ' + (error.message || 'Unknown error'));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
    // If successful, user will be logged out automatically
  };

  const themes = [
    {
      id: 'dark' as const,
      name: 'Dark',
      description: 'Pure black elegance',
      preview: {
        primary: '#000000',
        secondary: '#0a0a0a',
        accent: '#8b5cf6'
      }
    },
    {
      id: 'vibrant' as const,
      name: 'Vibrant',
      description: 'Bold purple energy',
      preview: {
        primary: '#0f0a1f',
        secondary: '#1a0f2e',
        accent: '#a855f7'
      }
    },
    {
      id: 'ocean' as const,
      name: 'Ocean',
      description: 'Deep blue serenity',
      preview: {
        primary: '#0a1628',
        secondary: '#0f1f3a',
        accent: '#3b82f6'
      }
    },
    {
      id: 'forest' as const,
      name: 'Forest',
      description: 'Natural green calm',
      preview: {
        primary: '#0a1f0f',
        secondary: '#0f2e1a',
        accent: '#10b981'
      }
    },
    {
      id: 'sunset' as const,
      name: 'Sunset',
      description: 'Warm orange glow',
      preview: {
        primary: '#1f0a0f',
        secondary: '#2e0f1a',
        accent: '#f97316'
      }
    },
    {
      id: 'midnight' as const,
      name: 'Midnight',
      description: 'Deep indigo night',
      preview: {
        primary: '#0a0a1f',
        secondary: '#0f0f2e',
        accent: '#6366f1'
      }
    },
    {
      id: 'light' as const,
      name: 'Light',
      description: 'Warm minimalism',
      preview: {
        primary: '#FAF8F3',
        secondary: '#FFFFFF',
        accent: '#FFA726'
      }
    }
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <SettingsIcon className="header-icon" size={24} />
            <div>
              <h1>Settings</h1>
              <p className="header-subtitle">Manage your preferences and account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <div className="settings-grid">

        {/* Migration Button - Shows if local data exists */}
        <MigrationButton />

        {/* Profile Management */}
        <motion.div
          className="settings-section profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: 'rgba(10, 10, 10, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px 32px'
          }}
        >
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <User size={24} style={{ color: 'var(--accent-primary)' }} />
          Profile
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
          {/* Profile Picture */}
          <label 
            htmlFor="profile-picture-upload"
            style={{ 
              position: 'relative',
              cursor: uploadingImage ? 'wait' : 'pointer',
              display: 'block'
            }}
          >
            <img 
              src={userProfile?.profile_picture_url || '/Ocean-Swirl.webp'} 
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                transition: 'all 0.2s ease',
                opacity: uploadingImage ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!uploadingImage) {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploadingImage) {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            />
            {uploadingImage && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2rem'
              }}>
                ⏳
              </div>
            )}
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              disabled={uploadingImage}
              style={{ display: 'none' }}
            />
          </label>
          
          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '1rem' }}>
              {isEditingUsername ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(userProfile?.username || '');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                    {userProfile?.username || 'User'}
                  </h3>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {userProfile?.email || user?.email}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(156, 163, 175, 0.2)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: showDeleteConfirm ? '2px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.3)',
                  background: showDeleteConfirm ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.05)',
                  color: '#ef4444',
                  cursor: isDeleting ? 'wait' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: showDeleteConfirm ? '600' : '500'
                }}
              >
                {isDeleting ? (
                  <><Loader size={16} className="spinner" /> Deleting...</>
                ) : showDeleteConfirm ? (
                  <><Trash2 size={16} /> Confirm Delete?</>
                ) : (
                  <><Trash2 size={16} /> Delete Account</>
                )}
              </button>
              {showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription & Usage */}
      <motion.div
        className="settings-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>💎</span>
          Subscription & Usage
        </h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            padding: '1.25rem',
            background: usageStats?.tier === 'pro' 
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: usageStats?.tier === 'pro'
              ? '1px solid rgba(139, 92, 246, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Plan</span>
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: usageStats?.tier === 'pro' ? '#a78bfa' : 'var(--text-primary)',
                textTransform: 'capitalize'
              }}>
                {usageStats?.tier === 'pro' ? '✨ Pro' : 'Free'}
              </span>
            </div>
            
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a78bfa', lineHeight: '1.5' }}>
                {usageStats?.tier === 'pro' ? (
                  <>
                    ✨ <strong>Pro Plan Includes:</strong><br />
                    • 2 AI analyses per day<br />
                    • Unlimited journal entries<br />
                    • Premium insights & features
                  </>
                ) : (
                  <>
                    💡 <strong>Free Plan Includes:</strong><br />
                    • 0 AI analyses per day<br />
                    • Unlimited journal entries<br />
                    • Basic insights
                  </>
                )}
              </p>
            </div>
            
            {usageStats?.tier === 'pro' ? (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'transparent',
                  color: '#a78bfa',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }}
              >
                Manage Subscription
              </button>
            ) : (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                ✨ View Plans & Upgrade
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Theme Selection */}
      <motion.div
        className="settings-section theme-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Palette size={24} style={{ color: 'var(--accent-primary)' }} />
          Theme
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Choose your preferred color scheme
        </p>
        
        <div className="theme-options" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${theme === themeOption.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                background: theme === themeOption.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (theme !== themeOption.id) {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== themeOption.id) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {/* Theme Preview */}
              <div style={{
                width: '60px',
                height: '40px',
                borderRadius: '6px',
                background: `linear-gradient(135deg, ${themeOption.preview.primary} 0%, ${themeOption.preview.secondary} 100%)`,
                border: `2px solid ${themeOption.preview.accent}`,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: themeOption.preview.accent
                }} />
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ 
                  margin: '0 0 0.25rem 0', 
                  color: 'var(--text-primary)', 
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {themeOption.name}
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.875rem' 
                }}>
                  {themeOption.description}
                </p>
              </div>
              
              {theme === themeOption.id && (
                <div style={{
                  color: 'var(--accent-primary)',
                  fontSize: '1.2rem'
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
        </motion.div>

        {/* Daily Reminders */}
        <motion.div
        className="settings-section reminders-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Bell size={24} style={{ color: 'var(--accent-primary)' }} />
          Daily Reminders
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Get gentle reminders to reflect on your day
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={handleRemindersToggle}
              disabled={notificationPermission === 'denied'}
              style={{ width: '18px', height: '18px' }}
            />
            Enable daily reminders
          </label>
        </div>
        
        {remindersEnabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ color: 'var(--text-primary)' }}>
              Reminder time:
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        )}
        
        {notificationPermission === 'denied' && (
          <p style={{ 
            margin: '1rem 0 0 0', 
            color: 'var(--accent-danger)', 
            fontSize: '0.875rem' 
          }}>
            ⚠️ Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
        
        {notificationPermission === 'granted' && remindersEnabled && (
          <p style={{ 
            margin: '1rem 0 0 0', 
            color: 'var(--accent-secondary)', 
            fontSize: '0.875rem' 
          }}>
            ✅ Daily reminders are active! You'll receive a notification at {reminderTime}.
          </p>
        )}
      </motion.div>

      {/* Import Diary Entries */}
      <motion.div
        className="settings-section import-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Download size={24} style={{ color: 'var(--accent-primary)' }} />
          Import Diary Entries
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Import all diary entries from the Diary_entries folder into your notes
        </p>
        
        <button
          onClick={handleImportDiaryEntries}
          disabled={isImporting}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            background: isImporting ? 'var(--text-secondary)' : 'var(--accent-primary)',
            color: 'white',
            cursor: isImporting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            opacity: isImporting ? 0.6 : 1
          }}
        >
          {isImporting ? (
            <><Loader size={18} className="spinner" /> Importing...</>
          ) : (
            <><Download size={18} /> Import Entries</>
          )}
        </button>

        {importResult && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            background: importResult.failed === 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${importResult.failed === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            <p style={{ 
              margin: '0 0 0.5rem 0', 
              color: 'var(--text-primary)', 
              fontWeight: '600' 
            }}>
              {importResult.failed === 0 ? '✅ Import Successful!' : '⚠️ Import Completed with Errors'}
            </p>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
              Successfully imported: <strong>{importResult.success}</strong> entries
            </p>
            {importResult.failed > 0 && (
              <>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  Failed: <strong>{importResult.failed}</strong> entries
                </p>
                {importResult.errors.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Errors:
                    </p>
                    {importResult.errors.map((error, idx) => (
                      <p key={idx} style={{ 
                        margin: '0.25rem 0', 
                        color: 'var(--accent-danger)', 
                        fontSize: '0.875rem',
                        fontFamily: 'monospace'
                      }}>
                        • {error}
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
            <p style={{ 
              margin: '0.75rem 0 0 0', 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem' 
            }}>
              💡 Refresh the page to see your imported entries in the notes list
            </p>
          </div>
        )}
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        className="settings-section feedback-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <MessageSquare size={24} />
          Send Feedback
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Have a suggestion or found a bug? Let us know!
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Title
          </label>
          <input
            type="text"
            value={feedbackTitle}
            onChange={(e) => setFeedbackTitle(e.target.value)}
            placeholder="Brief summary of your feedback"
            maxLength={100}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Message
          </label>
          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            placeholder="Tell us more about your feedback, suggestion, or issue..."
            rows={6}
            maxLength={1000}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          <p style={{
            margin: '0.5rem 0 0 0',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem'
          }}>
            {feedbackMessage.length}/1000 characters
          </p>
        </div>

        <button
          onClick={handleSubmitFeedback}
          disabled={submittingFeedback || !feedbackTitle.trim() || !feedbackMessage.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: submittingFeedback || !feedbackTitle.trim() || !feedbackMessage.trim()
              ? 'rgba(139, 92, 246, 0.3)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: submittingFeedback || !feedbackTitle.trim() || !feedbackMessage.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            opacity: submittingFeedback || !feedbackTitle.trim() || !feedbackMessage.trim() ? 0.5 : 1
          }}
        >
          {submittingFeedback ? (
            <>
              <Loader size={18} className="spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={18} />
              Send Feedback
            </>
          )}
        </button>

        {feedbackSuccess && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Check size={18} style={{ color: '#22c55e' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#22c55e' }}>
              Thank you! Your feedback has been sent successfully.
            </p>
          </div>
        )}
      </motion.div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentTier={usageStats?.tier === 'pro' ? 'pro' : 'free'}
      />

      </div>
      </div>
    </div>
  );
};

export default SettingsView;