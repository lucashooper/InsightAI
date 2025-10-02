import React, { useState, useEffect } from 'react';
import { storageAdapter } from '../../services/storageAdapter';
import type { PatternAlert } from '../../types/diary';
import AlertCard from './AlertCard';
import { supabase } from '../../services/supabaseClient';
import './AlertsView.css';

const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For now, show empty state instead of error
        setAlerts([]);
        setLoading(false);
        return;
      }

      const userAlerts = await storageAdapter.getUserAlerts();
      setAlerts(userAlerts);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const success = await storageAdapter.markAsRead(alertId);
      if (success) {
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId ? { ...alert, is_read: true } : alert
          )
        );
      }
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const success = await storageAdapter.deleteAlert(alertId);
      if (success) {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const success = await storageAdapter.markAllAsRead();
      if (success) {
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => ({ ...alert, is_read: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="alerts-view">
        <div className="alerts-loading">
          <div className="loading-spinner"></div>
          <p>Loading your alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alerts-view">
        <div className="alerts-error">
          <p>{error}</p>
          <button onClick={fetchAlerts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const unreadAlerts = alerts.filter(alert => !alert.is_read);
  const readAlerts = alerts.filter(alert => alert.is_read);

  return (
    <div className="alerts-view">
      {unreadAlerts.length > 0 && (
        <div className="alerts-header">
          <button 
            onClick={handleMarkAllAsRead}
            className="mark-all-read-button"
          >
            Mark All as Read
          </button>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="alerts-empty">
          <div className="empty-icon">🔔</div>
          <h3>No alerts yet</h3>
          <p>Pattern alerts will appear here when we detect recurring themes or patterns in your entries.</p>
        </div>
      ) : (
        <div className="alerts-content">
          {unreadAlerts.length > 0 && (
            <div className="alerts-section">
              <h3>New Alerts ({unreadAlerts.length})</h3>
              <div className="alerts-grid">
                {unreadAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteAlert}
                  />
                ))}
              </div>
            </div>
          )}

          {readAlerts.length > 0 && (
            <div className="alerts-section">
              <h3>Previous Alerts ({readAlerts.length})</h3>
              <div className="alerts-grid">
                {readAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteAlert}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsView; 