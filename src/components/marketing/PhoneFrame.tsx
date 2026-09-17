import React from 'react';

type PhoneFrameSize = 'hero-main' | 'hero-secondary' | 'showcase';

interface PhoneFrameProps {
  src: string;
  alt: string;
  size?: PhoneFrameSize;
  className?: string;
  style?: React.CSSProperties;
  imageKey?: number | string;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({
  src,
  alt,
  size = 'showcase',
  className = '',
  style,
  imageKey,
}) => (
  <div
    className={`phone-frame phone-frame--${size} ${className}`.trim()}
    style={style}
  >
    <img
      key={imageKey}
      src={src}
      alt={alt}
      className="phone-frame__screen"
      loading="lazy"
      decoding="async"
    />
  </div>
);

export default PhoneFrame;
