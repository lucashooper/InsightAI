import React from 'react';
import type { PatternAlert } from '../../types/diary';
import './AlertCard.css';

interface AlertCardProps {
  alert: PatternAlert;
  onMarkAsRead: (alertId: string) => void;
  onDelete: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkAsRead, onDelete }) => {
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'THEME_STREAK':
        return '🔥';
      case 'HISTORICAL_SIMILARITY':
        return '📊';
      case 'MOOD_PATTERN':
        return '😊';
      case 'TRIGGER_PATTERN':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'THEME_STREAK':
        return 'Theme Streak';
      case 'HISTORICAL_SIMILARITY':
        return 'Historical Pattern';
      case 'MOOD_PATTERN':
        return 'Mood Pattern';
      case 'TRIGGER_PATTERN':
        return 'Trigger Pattern';
      default:
        return 'Pattern Alert';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`alert-card ${alert.is_read ? 'read' : 'unread'}`}>
      <div className="alert-header">
        <div className="alert-icon">
          {getAlertIcon(alert.alert_type)}
        </div>
        <div className="alert-meta">
          <span className="alert-type">{getAlertTypeLabel(alert.alert_type)}</span>
          <span className="alert-date">{formatDate(alert.created_at)}</span>
        </div>
        <div className="alert-actions">
          {!alert.is_read && (
            <button
              onClick={() => onMarkAsRead(alert.id)}
              className="mark-read-button"
              title="Mark as read"
            >
              ✓
            </button>
          )}
          <button
            onClick={() => onDelete(alert.id)}
            className="delete-button"
            title="Delete alert"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="alert-content">
        <p className="alert-text">{alert.alert_text}</p>
        
        {alert.related_note_ids && alert.related_note_ids.length > 0 && (
          <div className="related-notes">
            <span className="related-notes-label">
              Related entries: {alert.related_note_ids.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCard; 