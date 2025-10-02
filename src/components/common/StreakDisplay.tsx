import React from 'react';
import { motion } from 'framer-motion';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, longestStreak, lastEntryDate }) => {
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your journey today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "Building momentum!";
    if (streak < 14) return "You're on fire! 🔥";
    if (streak < 30) return "Incredible dedication!";
    if (streak < 60) return "You're unstoppable!";
    return "Legendary consistency! 🌟";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "💭";
    return "🔥";
  };

  const isStreakActive = () => {
    if (!lastEntryDate) return false;
    const lastEntry = new Date(lastEntryDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return lastEntry.toDateString() === today.toDateString() || 
           lastEntry.toDateString() === yesterday.toDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(56, 189, 248, 0.05) 100%)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <span style={{ 
          fontSize: '1.5rem',
          filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))',
          textShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
          animation: currentStreak > 0 ? 'glow 2s ease-in-out infinite alternate' : 'none'
        }}>
          {getStreakEmoji(currentStreak)}
        </span>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          {currentStreak} Day{currentStreak !== 1 ? 's' : ''} Streak
        </span>
      </div>
      
      <p style={{
        margin: '0 0 0.5rem 0',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        {getStreakMessage(currentStreak)}
      </p>
      
      {longestStreak > currentStreak && (
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          fontStyle: 'italic'
        }}>
          Longest: {longestStreak} days
        </p>
      )}
      
      {!isStreakActive() && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'var(--accent-warning)',
            fontWeight: '500'
          }}>
            ⚠️ Don't break your streak! Write today to keep it going.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakDisplay; 