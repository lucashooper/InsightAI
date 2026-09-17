import React from 'react';

type Props = {
  size?: number;
  className?: string;
  tint?: string;
};

/** Soft cloud mascot for the marketing site — matches the in-app companion. */
export default function CloudMascotMark({ size = 120, className = '', tint = '#CDBBFF' }: Props) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-hi`} cx="76" cy="74" r="74" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.92} />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0.35} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
      </defs>
      <ellipse cx={100} cy={170} rx={56} ry={9} fill="#2A2438" opacity={0.08} />
      <path
        d="M 42 118 C 42 88 68 68 100 68 C 118 52 148 58 158 82 C 178 84 188 102 184 122 C 196 132 192 152 172 158 C 168 178 142 188 118 182 C 98 196 68 188 58 168 C 38 162 32 138 42 118 Z"
        fill={tint}
        filter={`url(#${id}-blur)`}
        opacity={0.55}
      />
      <path
        d="M 42 118 C 42 88 68 68 100 68 C 118 52 148 58 158 82 C 178 84 188 102 184 122 C 196 132 192 152 172 158 C 168 178 142 188 118 182 C 98 196 68 188 58 168 C 38 162 32 138 42 118 Z"
        fill={tint}
      />
      <path d="M 42 118 C 42 88 68 68 100 68 C 118 52 148 58 158 82 C 178 84 188 102 184 122 C 196 132 192 152 172 158 C 168 178 142 188 118 182 C 98 196 68 188 58 168 C 38 162 32 138 42 118 Z" fill={`url(#${id}-hi)`} />
      <circle cx={70} cy={116} r={7} fill="#FF9EC4" opacity={0.32} />
      <circle cx={130} cy={116} r={7} fill="#FF9EC4" opacity={0.32} />
      <ellipse cx={84} cy={100} rx={4.6} ry={6.2} fill="#2A2438" />
      <ellipse cx={116} cy={100} rx={4.6} ry={6.2} fill="#2A2438" />
      <path d="M 85 114 Q 100 128 115 114" stroke="#2A2438" strokeWidth={4.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}
