import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Edit2, LogOut, Trash2, Palette, Bell, Download, Check, X, Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import type { UserProfile } from '../../services/userProfileService';
import { importDiaryEntries } from '../../utils/importDiaryEntries';
import './settings.css';
import '../../styles/page-layout.css';
import '../../styles/settings-layout.css';

const SettingsView: React.FC = () => {
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

  useEffect(() => {
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

    // Load user profile using FRESH SESSION
    const loadUserProfile = async () => {
      // Import supabase to get fresh session
      const { supabase } = await import('../../services/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Settings: Loading profile for user:', session.user.id);
        const profile = await userProfileService.getUserProfile(session.user.id);
        if (profile) {
          setUserProfile(profile);
          setNewUsername(profile.username);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleThemeChange = (newTheme: 'midnight' | 'dusk' | 'light') => {
    setTheme(newTheme);
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
          new Notification('InsightAI Reminder', {
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
      id: 'midnight' as const,
      name: 'Midnight',
      description: 'Deep, calming darkness',
      preview: {
        primary: '#111827',
        secondary: '#1F2937',
        accent: '#38BDF8'
      }
    },
    {
      id: 'dusk' as const,
      name: 'Dusk',
      description: 'Mystical purple twilight',
      preview: {
        primary: '#1C162C',
        secondary: '#2D2A46',
        accent: '#C482FF'
      }
    },
    {
      id: 'light' as const,
      name: 'Light',
      description: 'Clean, minimal brightness',
      preview: {
        primary: '#F8F8F8',
        secondary: '#FFFFFF',
        accent: '#3b82f6'
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

        {/* Profile Management */}
        <motion.div
          className="settings-section profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
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
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
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

      {/* Theme Selection */}
      <motion.div
        className="settings-section theme-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
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
          display: 'flex', 
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
                gap: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                border: `2px solid ${theme === themeOption.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: theme === themeOption.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (theme !== themeOption.id) {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== themeOption.id) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'transparent';
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
          background: 'rgba(255, 255, 255, 0.03)',
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
          background: 'rgba(255, 255, 255, 0.03)',
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

      </div>
      </div>
    </div>
  );
};

export default SettingsView;