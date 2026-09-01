import React from 'react';
import { Volume2 } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';
import { playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

interface VesselSVGProps {
  ml: number;
  maxMl?: number;
  goalMl?: number;
  width?: number;
  height?: number;
  color?: string;
  lightColor?: string;
  showLabels?: boolean;
  showMarks?: boolean;
  label?: string;
  vocalizedLabel?: string;
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
}

export const VesselSVG: React.FC<VesselSVGProps> = ({
  ml,
  maxMl = 1000,
  goalMl,
  width = 105,
  height = 220,
  color = '#0284c7',
  lightColor = '#e0f2fe',
  showLabels = true,
  showMarks = true,
  label,
  vocalizedLabel,
  onClick,
  interactive = false,
  className = '',
}) => {
  const { language, t } = useLanguage();

  const bw = width - 14;
  const bh = height - 32;
  const bx = 7;
  const by = 26;
  const neckW = bw * 0.45;
  const neckH = 20;
  const neckX = bx + (bw - neckW) / 2;

  const pct = Math.max(0, Math.min(1, ml / maxMl));
  const waterH = Math.round(bh * pct);
  const waterY = by + bh - waterH;

  const formatShort = (val: number) => {
    if (language === 'en') {
      if (val === 1000) return '1 L';
      if (val === 750) return '¾ L';
      if (val === 500) return '½ L';
      if (val === 250) return '¼ L';
      return val > 0 ? `${val} mL` : t.emptyVessel;
    }
    if (val === 1000) return '1 لتر';
    if (val === 750) return '¾ لتر';
    if (val === 500) return '½ لتر';
    if (val === 250) return '¼ لتر';
    return val > 0 ? `${val} مل` : t.emptyVessel;
  };

  const displayLabel = label || formatShort(ml);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    const textToSpeak = vocalizedLabel || `${displayLabel}`;
    speechEngine.speak(textToSpeak);
  };

  // Marks at 1L, 3/4L, 1/2L, 1/4L
  const marks = language === 'en'
    ? [
        { p: 1.0, text: '1 L' },
        { p: 0.75, text: '¾ L' },
        { p: 0.5, text: '½ L' },
        { p: 0.25, text: '¼ L' },
      ]
    : [
        { p: 1.0, text: '1 لتر' },
        { p: 0.75, text: '¾ لتر' },
        { p: 0.5, text: '½ لتر' },
        { p: 0.25, text: '¼ لتر' },
      ];

  return (
    <div 
      className={`inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="relative">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="transition-transform duration-200 group-hover:scale-105"
        >
          <defs>
            {/* Glass gradient */}
            <linearGradient id={`glass-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="30%" stopColor={lightColor} stopOpacity="0.35" />
              <stop offset="70%" stopColor={lightColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
            </linearGradient>

            {/* Liquid gradient */}
            <linearGradient id={`water-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.92" />
              <stop offset="50%" stopColor={color} stopOpacity="0.82" />
              <stop offset="100%" stopColor={color} stopOpacity="0.95" />
            </linearGradient>

            {/* Shimmer clip */}
            <clipPath id={`vessel-clip-${width}-${height}`}>
              <rect x={bx} y={by} width={bw} height={bh} rx="14" />
            </clipPath>
          </defs>

          {/* Bottle Neck & Cap */}
          <rect
            x={neckX}
            y={5}
            width={neckW}
            height={neckH}
            rx={5}
            fill="#e2e8f0"
            stroke={color}
            strokeWidth="2.5"
          />
          <rect
            x={neckX - 2}
            y={2}
            width={neckW + 4}
            height={6}
            rx={3}
            fill={color}
          />

          {/* Bottle Body Background */}
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={14}
            fill={`url(#glass-${color.replace('#','')})`}
            stroke={color}
            strokeWidth="3"
          />

          {/* Water fill with animation */}
          {pct > 0 && (
            <g clipPath={`url(#vessel-clip-${width}-${height})`}>
              <rect
                x={bx}
                y={waterY}
                width={bw}
                height={waterH}
                fill={`url(#water-${color.replace('#','')})`}
                className="transition-all duration-500 ease-out"
              />
              {/* Wave surface highlight */}
              <ellipse
                cx={bx + bw / 2}
                cy={waterY}
                rx={bw / 2 - 1}
                ry={4}
                fill="#ffffff"
                opacity="0.6"
              />
              {/* Bubble particle */}
              {pct > 0.25 && (
                <circle
                  cx={bx + bw * 0.35}
                  cy={waterY + waterH * 0.5}
                  r="3"
                  fill="#ffffff"
                  opacity="0.8"
                >
                  <animate
                    attributeName="cy"
                    values={`${waterY + waterH * 0.8};${waterY + 4}`}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Measurement graduation marks */}
          {showMarks &&
            marks.map((m, idx) => {
              const my = by + bh - bh * m.p;
              return (
                <g key={idx} opacity="0.95">
                  <line
                    x1={bx + 3}
                    y1={my}
                    x2={bx + bw * 0.42}
                    y2={my}
                    stroke="#1e293b"
                    strokeWidth="2"
                    strokeDasharray="3,2"
                  />
                  <text
                    x={bx + bw * 0.46}
                    y={my + 4.5}
                    fontSize={width > 80 ? '12' : '10'}
                    fontWeight="900"
                    fill="#0f172a"
                  >
                    {m.text}
                  </text>
                </g>
              );
            })}

          {/* Glass reflection highlight overlay */}
          <path
            d={`M ${bx + 5} ${by + 8} L ${bx + 5} ${by + bh - 10}`}
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Foreground Border */}
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={14}
            fill="none"
            stroke={color}
            strokeWidth="3"
          />

          {/* Goal Marker Indicator if specified */}
          {goalMl && goalMl > 0 && goalMl <= maxMl && (
            <g className="animate-pulse">
              <line
                x1={bx - 2}
                y1={by + bh - bh * (goalMl / maxMl)}
                x2={bx + bw + 2}
                y2={by + bh - bh * (goalMl / maxMl)}
                stroke="#ea580c"
                strokeWidth="2.5"
                strokeDasharray="4,2"
              />
              <circle
                cx={bx - 1}
                cy={by + bh - bh * (goalMl / maxMl)}
                r="3.5"
                fill="#ea580c"
              />
              <circle
                cx={bx + bw + 1}
                cy={by + bh - bh * (goalMl / maxMl)}
                r="3.5"
                fill="#ea580c"
              />
            </g>
          )}

          {/* Inner label on liquid */}
          {showLabels && pct > 0.08 && (
            <text
              x={bx + bw / 2}
              y={waterY + Math.min(waterH / 2 + 5, waterH - 7)}
              textAnchor="middle"
              fontSize={width > 80 ? '14' : '11'}
              fontWeight="900"
              fill="#ffffff"
              className="drop-shadow-md"
            >
              {displayLabel}
            </text>
          )}
        </svg>

        {/* Quick Speaker Button */}
        <button
          type="button"
          onClick={handleSpeak}
          title={t.listenVessel}
          className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-white shadow-md border-2 border-slate-200 flex items-center justify-center text-sky-600 hover:bg-sky-50 hover:scale-110 active:scale-95 transition-transform"
        >
          <Volume2 size={15} />
        </button>
      </div>

      {label && (
        <span 
          className="mt-2 text-sm sm:text-base font-black text-slate-800 text-center px-1"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
