import React from 'react';

export const AlgeriaFlag: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.75)}
      viewBox="0 0 900 600"
      className={`inline-block rounded-xs shadow-xs shrink-0 overflow-hidden ${className}`}
      aria-label="علم الجزائر (Algeria Flag)"
    >
      <rect width="450" height="600" fill="#006633" />
      <rect x="450" width="450" height="600" fill="#ffffff" />
      <circle cx="450" cy="300" r="150" fill="#d21034" />
      <circle cx="486" cy="300" r="120" fill="#ffffff" />
      <polygon
        fill="#d21034"
        points="495,204 468,260 411,260 456,295 439,352 486,318 533,352 516,295 561,260 504,260"
      />
    </svg>
  );
};

export const UkFlag: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.75)}
      viewBox="0 0 60 30"
      className={`inline-block rounded-xs shadow-xs shrink-0 overflow-hidden ${className}`}
      aria-label="علم بريطانيا (UK Flag)"
    >
      <clipPath id="uk-clip">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30" stroke="#C8102E" strokeWidth="2" />
        <path d="M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
};
