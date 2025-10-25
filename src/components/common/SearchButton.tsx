import React from 'react';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Search notes (Cmd/Ctrl + K)"
      style={{
        position: 'fixed',
        top: '24px',
        left: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        padding: 0,
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px',
        color: '#8b5cf6',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: '0 2px 12px rgba(139, 92, 246, 0.15)',
        zIndex: 101
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(139, 92, 246, 0.15)';
      }}
    >
      <Search size={18} strokeWidth={2.5} />
    </button>
  );
};

export default SearchButton;
