import React, { useState, useRef, useEffect } from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';
import { aiService } from '../../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CoWriterChatProps {
  entryContent: string;
  onClose?: () => void;
  autoStart?: boolean; // If true, automatically probe the entry content on mount
}

export const CoWriterChat: React.FC<CoWriterChatProps> = ({ entryContent, onClose, autoStart = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-start conversation if autoStart is true
  useEffect(() => {
    if (autoStart && entryContent.trim()) {
      // Automatically send the entry content to AI
      handleAutoStart();
    }
  }, [autoStart]); // Only run once on mount

  const handleAutoStart = async () => {
    if (isLoading || !entryContent.trim()) return;

    setIsLoading(true);

    try {
      // Call AI service with a probing question based on the entry
      const response = await aiService.probeDeeper(
        entryContent,
        'Help me explore what I\'ve written. What stands out to you?',
        ''
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };

      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error in auto-start:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error starting our conversation. Please try asking me a question.'
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Build conversation context
      const conversationContext = messages.map(m => 
        `${m.role === 'user' ? 'User' : 'Prism'}: ${m.content}`
      ).join('\n\n');

      // Call AI service with context
      const response = await aiService.probeDeeper(
        entryContent,
        userMessage.content,
        conversationContext
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in co-writer chat:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1.5rem',
      background: 'rgba(139, 92, 246, 0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      animation: 'slideDown 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            🔮
          </div>
          <div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#E5E7EB'
            }}>
              Prism Co-Writer
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
              fontStyle: 'italic'
            }}>
              Ask questions about your thoughts
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
          >
            <PremiumIcons.X size={20} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        marginBottom: '1rem',
        paddingRight: '0.5rem'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: '#9CA3AF',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💭</div>
            <p style={{ margin: 0 }}>
              Ask Prism anything about what you've written.<br />
              I can help you explore your thoughts more deeply.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: message.role === 'user' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {message.role === 'user' ? '👤' : '🔮'}
              </div>
              
              {/* Message Bubble */}
              <div style={{
                padding: '0.75rem 1rem',
                background: message.role === 'user'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(139, 92, 246, 0.15)',
                borderRadius: '12px',
                border: `1px solid ${message.role === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                maxWidth: '80%',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: '#E5E7EB'
              }}>
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              🔮
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end'
      }}>
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your thoughts..."
          style={{
            flex: 1,
            minHeight: '44px',
            maxHeight: '120px',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#E5E7EB',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
        />
        <button
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
          style={{
            padding: '0.75rem',
            background: userInput.trim() && !isLoading
              ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
              : 'rgba(139, 92, 246, 0.3)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: userInput.trim() && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: '44px',
            height: '44px'
          }}
          onMouseEnter={(e) => {
            if (userInput.trim() && !isLoading) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <PremiumIcons.ChevronRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .typing-dots {
          display: flex;
          gap: 0.3rem;
        }
        
        .typing-dot {
          width: 6px;
          height: 6px;
          background: #8b5cf6;
          borderRadius: 50%;
          animation: typingDot 1.4s infinite;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typingDot {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CoWriterChat;
