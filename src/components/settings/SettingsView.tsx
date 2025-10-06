import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import MigrationHelper from '../migration/MigrationHelper';
import { importDiaryEntries } from '../../utils/importDiaryEntries';

interface SettingsViewProps {
  setActiveView: React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings' | 'alerts'>>;
}
const SettingsView: React.FC<SettingsViewProps> = ({ setActiveView }) => {
  const { theme, setTheme } = useTheme();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

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
  }, []);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveView('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ 
          margin: 0, 
          color: 'var(--text-primary)', 
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Settings
        </h1>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          color: 'var(--text-secondary)', 
          fontSize: '1rem' 
        }}>
          Customize your InsightAI experience
        </p>
      </div>

      {/* Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🎨 Theme
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Choose your preferred color scheme
        </p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              style={{
                display: 'flex',
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
              
              <div style={{ flex: 1 }}>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem'
        }}
      >
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🔔 Daily Reminders
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}
      >
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          📥 Import Diary Entries
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
          {isImporting ? '⏳ Importing...' : '📥 Import Entries'}
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

      {/* Data Migration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}
      >
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--text-primary)', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🔄 Data Migration
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Migrate your existing diary entries from Supabase to local storage
        </p>
        
        <MigrationHelper />
      </motion.div>
    </motion.div>
  );
};

export default SettingsView;