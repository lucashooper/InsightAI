import React from 'react';
import { Search, Bookmark, Menu } from 'lucide-react';

interface LeftToolbarProps {
  onSearchClick: () => void;
  onBookmarkClick: () => void;
  bookmarkButtonRef: React.RefObject<HTMLButtonElement | null>;
  onMobileMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

const LeftToolbar: React.FC<LeftToolbarProps> = ({ 
  onSearchClick, 
  onBookmarkClick, 
  bookmarkButtonRef,
  onMobileMenuClick,
  isMobileMenuOpen 
}) => {
  return (
    <div 
      className="left-toolbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '240px', // Match sidebar width
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 16px',
        background: 'rgba(10, 10, 15, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        zIndex: 102
      }}>
      {/* Mobile Menu Button - Only visible on mobile */}
      {onMobileMenuClick && (
        <button
          className="mobile-menu-button"
          onClick={onMobileMenuClick}
          aria-label="Toggle menu"
          style={{
            display: 'none', // Hidden on desktop, shown via CSS on mobile
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            padding: 0,
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>
      )}

      {/* Search Icon */}
      <button
        className="toolbar-search-btn"
        onClick={onSearchClick}
        title="Search notes (Cmd/Ctrl + K)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          padding: 0,
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = '#9ca3af';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        <Search size={18} strokeWidth={2} />
      </button>

      {/* Bookmark Icon */}
      <button
        className="toolbar-bookmark-btn"
        ref={bookmarkButtonRef}
        onClick={onBookmarkClick}
        title="Bookmarks"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          padding: 0,
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = '#9ca3af';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        <Bookmark size={18} strokeWidth={2} />
      </button>
    </div>
  );
};

export default LeftToolbar;
