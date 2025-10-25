import React from 'react';

// Base skeleton shimmer effect
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
  backgroundSize: '1000px 100%',
  animation: 'shimmer 2s infinite linear'
};

// Skeleton Card - for dashboard story box
export const SkeletonCard: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.5rem',
      height,
      ...shimmerStyle
    }}>
      <div style={{
        width: '60%',
        height: '24px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        marginBottom: '1rem'
      }} />
      <div style={{
        width: '40%',
        height: '16px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '4px',
        marginBottom: '1.5rem'
      }} />
      <div style={{
        width: '90%',
        height: '14px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '4px',
        marginBottom: '0.75rem'
      }} />
      <div style={{
        width: '85%',
        height: '14px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '4px',
        marginBottom: '0.75rem'
      }} />
      <div style={{
        width: '70%',
        height: '14px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '4px'
      }} />
    </div>
  </>
);

// Skeleton Graph - for dashboard charts
export const SkeletonGraph: React.FC<{ height?: string }> = ({ height = '300px' }) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.5rem',
      height,
      ...shimmerStyle
    }}>
      {/* Title skeleton */}
      <div style={{
        width: '50%',
        height: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        marginBottom: '1.5rem'
      }} />
      
      {/* Graph bars skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        height: 'calc(100% - 50px)',
        paddingTop: '1rem'
      }}>
        {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${height}%`,
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px 4px 0 0'
            }}
          />
        ))}
      </div>
    </div>
  </>
);

// Skeleton Note Card - for My Notes grid
export const SkeletonNoteCard: React.FC = () => (
  <>
    <style>{shimmerKeyframes}</style>
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '1.5rem',
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      ...shimmerStyle
    }}>
      {/* Title */}
      <div style={{
        width: '70%',
        height: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      }} />
      
      {/* Content lines */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '3px'
        }} />
        <div style={{
          width: '95%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '3px'
        }} />
        <div style={{
          width: '85%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '3px'
        }} />
        <div style={{
          width: '90%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '3px'
        }} />
      </div>
      
      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div style={{
          width: '100px',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '3px'
        }} />
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '50%'
          }} />
          <div style={{
            width: '24px',
            height: '24px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '50%'
          }} />
        </div>
      </div>
    </div>
  </>
);

// Skeleton Grid - collection of note cards with proper responsive grid
export const SkeletonNoteGrid: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
    width: '100%'
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonNoteCard key={i} />
    ))}
  </div>
);

// Dashboard skeleton - full dashboard layout matching wide container
export const SkeletonDashboard: React.FC = () => (
  <div style={{ 
    width: '100%',
    height: '100%',
    padding: '0.5rem 1.5rem 2rem 1.5rem' 
  }}>
    {/* Story Card - Full width */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonCard height="280px" />
    </div>
    
    {/* Charts Grid - Two columns */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
      marginBottom: '2rem'
    }}>
      <SkeletonGraph height="400px" />
      <SkeletonGraph height="400px" />
    </div>
    
    {/* Insight Boxes - Two columns */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem'
    }}>
      <SkeletonCard height="350px" />
      <SkeletonCard height="350px" />
    </div>
  </div>
);
