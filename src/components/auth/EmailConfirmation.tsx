import React from 'react';
import { Mail, ArrowLeft, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import './auth.css';

interface EmailConfirmationProps {
  email: string;
  onBack: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ email, onBack }) => {
  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative' }}
      >
        <button 
          onClick={onBack}
          className="back-button"
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'color 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 2rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Mail size={48} style={{ color: '#8b5cf6' }} />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ 
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}
        >
          Check Your Email
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ 
            color: 'rgba(156, 163, 175, 0.7)',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}
        >
          We've sent a confirmation link to
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'rgba(88, 28, 135, 0.3)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2.5rem',
            textAlign: 'center'
          }}
        >
          <p style={{ 
            color: 'rgba(196, 181, 253, 1)', 
            fontWeight: '600',
            margin: 0,
            fontSize: '1rem',
            letterSpacing: '0.3px'
          }}>
            {email}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '2rem'
          }}
        >
          <h3 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Mail size={20} style={{ color: '#8b5cf6' }} />
            Next Steps:
          </h3>
          <ol style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.9rem',
            lineHeight: '2',
            paddingLeft: '1.5rem',
            margin: 0
          }}>
            <li>Open your email inbox</li>
            <li>Look for an email from InsightAI</li>
            <li>Click the confirmation link</li>
            <li>You'll be redirected back to sign in</li>
          </ol>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            textAlign: 'left',
            padding: '1.25rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}
        >
          <p style={{ 
            color: '#93c5fd', 
            fontSize: '0.9rem',
            margin: 0,
            lineHeight: '1.7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <Lightbulb size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
            </span>
          </p>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ 
            textAlign: 'center', 
            color: 'rgba(156, 163, 175, 0.8)',
            fontSize: '0.9rem',
            margin: 0,
            paddingTop: '0.5rem'
          }}
        >
          Didn't receive the email?{' '}
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#a78bfa',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'underline',
              fontSize: '0.9rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#c4b5fd'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a78bfa'}
          >
            Try again
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default EmailConfirmation;
