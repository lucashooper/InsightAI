import React, { useEffect, useRef } from 'react';

interface EmojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

/**
 * Emoji component that renders high-quality emojis using Twemoji CDN
 * Provides consistent Apple-style emoji rendering across all platforms
 */
const Emoji: React.FC<EmojiProps> = ({ emoji, size = 20, className = '' }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Use Twemoji CDN to parse and replace emoji with images
    if (spanRef.current && emoji) {
      // Get the codepoint of the emoji
      const codePoint = emoji.codePointAt(0)?.toString(16);
      
      if (codePoint) {
        // Construct Twemoji SVG URL
        const twemojiUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
        
        // Replace with img tag
        spanRef.current.innerHTML = `<img 
          src="${twemojiUrl}" 
          alt="${emoji}" 
          draggable="false"
          style="height: ${size}px; width: ${size}px; display: inline-block; vertical-align: middle;"
        />`;
      }
    }
  }, [emoji, size]);

  return (
    <span 
      ref={spanRef} 
      className={className}
      style={{ 
        display: 'inline-block',
        lineHeight: 1
      }}
    >
      {emoji}
    </span>
  );
};

export default Emoji;
