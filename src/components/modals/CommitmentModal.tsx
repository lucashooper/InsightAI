import React from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';

interface CommitmentModalProps {
  isOpen: boolean;
  strategyTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({ 
  isOpen, 
  strategyTitle, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '480px',
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          animation: 'modalSlideIn 0.3s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{
              padding: '0.5rem',
              background: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PremiumIcons.Target size={20} color="#8b5cf6" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#E5E7EB',
            }}>
              Activate a New Strategy?
            </h3>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: '1.5rem',
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#9CA3AF',
          }}>
            You're about to add <strong style={{ color: '#E5E7EB' }}>"{strategyTitle}"</strong> to your active strategies.
          </p>
          <p style={{
            margin: '1rem 0 0 0',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#9CA3AF',
          }}>
            Committing to a new habit is the first step to growth.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          padding: '1rem 1.5rem 1.5rem 1.5rem',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'transparent',
              border: '1px solid rgba(156, 163, 175, 0.3)',
              borderRadius: '8px',
              color: '#9CA3AF',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
              e.currentTarget.style.borderColor = '#9CA3AF';
              e.currentTarget.style.color = '#E5E7EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.625rem 1.5rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            <PremiumIcons.Check size={16} />
            Activate Strategy
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};
