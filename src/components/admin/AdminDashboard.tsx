import React, { useState, useEffect } from 'react';
import { fetchGroqLimits, parseResetTime, type GroqLimits } from '../../services/groqLimitsService';
import { useAuth } from '../../contexts/AuthContext';
import { getLLMProvider, setLLMProvider, type LLMProvider } from '../../lib/llmProvider';
import { feedbackService, type Feedback } from '../../services/feedbackService';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<GroqLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentProvider, setCurrentProvider] = useState<LLMProvider>(getLLMProvider());
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const loadGroqLimits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGroqLimits();
      setLimits(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch limits');
      console.error('Error loading Groq limits:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const data = await feedbackService.getAllFeedback();
      setFeedback(data);
    } catch (err) {
      console.error('Error loading feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    loadGroqLimits();
    loadFeedback();
  }, []);

  const handleRefresh = () => {
    loadGroqLimits();
  };

  const handleProviderToggle = (provider: LLMProvider) => {
    setLLMProvider(provider);
    setCurrentProvider(provider);
    console.log(`🔄 Switched to ${provider === 'local' ? 'LOCAL (LM Studio)' : 'GROQ (Cloud)'} provider`);
  };

  const handleMarkAsRead = async (feedbackId: string) => {
    const success = await feedbackService.updateFeedbackStatus(feedbackId, 'read');
    if (success) {
      loadFeedback();
    }
  };

  const handleMarkAsResolved = async (feedbackId: string) => {
    const success = await feedbackService.updateFeedbackStatus(feedbackId, 'resolved');
    if (success) {
      loadFeedback();
    }
  };

  if (!user) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">AI Provider & API Limits</p>
      </div>

      {/* AI Provider Toggle */}
      <div className="provider-toggle-card">
        <h2>🤖 AI Provider</h2>
        <p className="provider-description">
          Switch between local LM Studio (testing) and Groq Cloud (production)
        </p>
        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${currentProvider === 'groq' ? 'active' : ''}`}
            onClick={() => handleProviderToggle('groq')}
          >
            <span className="toggle-icon">☁️</span>
            <div className="toggle-content">
              <strong>Groq Cloud</strong>
              <small>Production (openai/gpt-oss-120b)</small>
            </div>
          </button>
          <button
            className={`toggle-btn ${currentProvider === 'local' ? 'active' : ''}`}
            onClick={() => handleProviderToggle('local')}
          >
            <span className="toggle-icon">💻</span>
            <div className="toggle-content">
              <strong>LM Studio</strong>
              <small>Testing (localhost:1234)</small>
            </div>
          </button>
        </div>
        <div className="current-provider-status">
          Currently using: <strong>{currentProvider === 'groq' ? 'Groq Cloud ☁️' : 'LM Studio 💻'}</strong>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <strong>Error:</strong> {error}
          {error.includes('Not authorized') && (
            <p className="error-hint">
              Only the designated admin email can access this dashboard.
            </p>
          )}
        </div>
      )}

      {/* Analytics Link */}
      <div style={{ marginBottom: '24px' }}>
        <a 
          href="/app/admin/analytics"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          📊 View Onboarding Analytics
        </a>
      </div>

      <div className="admin-content">
        <div className="limits-card">
          <div className="card-header">
            <h2>Current API Limits</h2>
            <button 
              onClick={handleRefresh} 
              disabled={loading}
              className="refresh-button"
            >
              {loading ? '⟳ Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {loading && !limits ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading rate limits...</p>
            </div>
          ) : limits ? (
            <div className="limits-grid">
              <div className="limit-item">
                <div className="limit-icon">🔢</div>
                <div className="limit-details">
                  <h3>Remaining Requests</h3>
                  <p className="limit-value">
                    {limits.remainingRequests || 'Unknown'}
                  </p>
                  <span className="limit-label">requests left</span>
                </div>
              </div>

              <div className="limit-item">
                <div className="limit-icon">🎫</div>
                <div className="limit-details">
                  <h3>Remaining Tokens</h3>
                  <p className="limit-value">
                    {limits.remainingTokens ? 
                      parseInt(limits.remainingTokens).toLocaleString() : 
                      'Unknown'
                    }
                  </p>
                  <span className="limit-label">tokens left</span>
                </div>
              </div>

              <div className="limit-item">
                <div className="limit-icon">⏱️</div>
                <div className="limit-details">
                  <h3>Resets In</h3>
                  <p className="limit-value">
                    {parseResetTime(limits.requestsReset)}
                  </p>
                  <span className="limit-label">until reset</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No data available. Click refresh to load.</p>
            </div>
          )}

          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>ℹ️ About Rate Limits</h3>
          <ul>
            <li>
              <strong>Requests:</strong> Number of API calls you can make before hitting the limit
            </li>
            <li>
              <strong>Tokens:</strong> Total tokens (input + output) you can use
            </li>
            <li>
              <strong>Reset:</strong> Time until your limits refresh
            </li>
          </ul>
          <p className="info-note">
            💡 <strong>Tip:</strong> Groq has generous free tier limits. Monitor these to ensure 
            your application doesn't hit rate limits during peak usage.
          </p>
        </div>

        {/* User Feedback Section */}
        <div className="feedback-section">
          <div className="section-header">
            <h2>💬 User Feedback</h2>
            <button onClick={loadFeedback} className="refresh-button">
              🔄 Refresh
            </button>
          </div>

          {loadingFeedback ? (
            <div className="loading">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="no-data">
              <p>No feedback yet. Users can submit feedback from Settings.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {feedback.map((item) => (
                <div 
                  key={item.id} 
                  className={`feedback-item status-${item.status}`}
                >
                  <div className="feedback-header">
                    <div className="feedback-meta">
                      <span className="feedback-user">👤 {item.user_email}</span>
                      <span className="feedback-date">
                        📅 {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className={`feedback-status status-${item.status}`}>
                      {item.status === 'new' && '🆕 New'}
                      {item.status === 'read' && '👁️ Read'}
                      {item.status === 'resolved' && '✅ Resolved'}
                    </span>
                  </div>
                  
                  <h3 className="feedback-title">{item.title}</h3>
                  <p className="feedback-message">{item.message}</p>
                  
                  <div className="feedback-actions">
                    {item.status === 'new' && (
                      <button 
                        onClick={() => handleMarkAsRead(item.id)}
                        className="action-button read"
                      >
                        👁️ Mark as Read
                      </button>
                    )}
                    {item.status !== 'resolved' && (
                      <button 
                        onClick={() => handleMarkAsResolved(item.id)}
                        className="action-button resolve"
                      >
                        ✅ Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Onboarding Analytics Section */}
        <div className="feedback-section" style={{ marginTop: '24px' }}>
          <div className="section-header">
            <h2>📊 Onboarding Analytics</h2>
          </div>
          <div className="no-data">
            <p style={{ marginBottom: '16px' }}>View detailed onboarding funnel and user journey analytics</p>
            <a 
              href="/app/admin/analytics"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              📊 View Detailed Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
