import React from 'react';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`chat-message-line ${isAssistant ? 'assistant-line' : 'user-line'}`}>
      {!isAssistant && (
        <div className="avatar-container">
          <div className="user-avatar">
            <span className="user-icon">👤</span>
          </div>
        </div>
      )}
      <div className="bubble-content">
        {!isAssistant && (
          <span className="sender-name">You</span>
        )}
        <div className={`chat-bubble ${isAssistant ? 'assistant' : 'user'}`}>
          <div className="message-content">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble; 