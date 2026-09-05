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
  width = 110,
  height = 230,
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

  const bw = width - 16;
  const bh = height - 36;
  const bx = 8;
  const by = 28;
  const neckW = bw * 0.45;
  const neckH = 20;
  const neckX = bx + (bw - neckW) / 2;

  const pct = Math.max(0, Math.min(1, ml / maxMl));
  const waterH = Math.round(bh * pct);
  const waterY = by + bh - waterH;

  const displayLabel = label !== undefined ? label : `${ml} ${t.mlUnit}`;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    const textToSpeak = vocalizedLabel || label || `${ml} ${t.mlUnit}`;
    speechEngine.speak(textToSpeak);
  };

  // Graduation marks
  const marks = language === 'en'
    ? [
        { p: 1.0, label: '1 L' },
        { p: 0.75, label: '¾ L' },
        { p: 0.5, label: '½ L' },
        { p: 0.25, label: '¼ L' },
      ]
    : [
        { p: 1.0, label: '1 ل' },
        { p: 0.75, label: '¾ ل' },
        { p: 0.5, label: '½ ل' },
        { p: 0.25, label: '¼ ل' },
      ];

  return (
    <div 
      className={`inline-flex flex-col items-center justify-center select-none max-h-full max-w-full min-h-0 ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center max-h-full max-w-full min-h-0">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="transition-transform duration-200 group-hover:scale-105 max-h-full max-w-full w-auto h-auto object-contain"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        >
          <defs>
            {/* Glass gradient */}
            <linearGradient id={`glass-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor={lightColor} stopOpacity="0.3" />
              <stop offset="75%" stopColor={lightColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
            </linearGradient>

            {/* Liquid gradient */}
            <linearGradient id={`water-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.95" />
              <stop offset="50%" stopColor={color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={color} stopOpacity="0.98" />
            </linearGradient>

            {/* Vessel clip boundary */}
            <clipPath id={`vessel-clip-${width}-${height}`}>
              <rect x={bx} y={by} width={bw} height={bh} rx="12" />
            </clipPath>
          </defs>

          {/* Bottle Neck & Cap */}
          <rect
            x={neckX}
            y={6}
            width={neckW}
            height={neckH}
            rx={4}
            fill="#e2e8f0"
            stroke={color}
            strokeWidth="2"
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
            rx={12}
            fill={`url(#glass-${color.replace('#','')})`}
            stroke={color}
            strokeWidth="2.5"
          />

          {/* Water fill */}
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
                ry={3}
                fill="#ffffff"
                opacity="0.6"
              />
              {/* Floating bubbles */}
              {pct > 0.2 && (
                <circle
                  cx={bx + bw * 0.3}
                  cy={waterY + waterH * 0.5}
                  r="2.5"
                  fill="#ffffff"
                  opacity="0.7"
                >
                  <animate
                    attributeName="cy"
                    values={`${waterY + waterH * 0.8};${waterY + 2}`}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Graduation lines & labels */}
          {showMarks &&
            marks.map((m, idx) => {
              const my = by + bh - bh * m.p;
              const isFilled = pct >= m.p - 0.01;

              return (
                <g key={idx} className="transition-opacity duration-200">
                  {/* Left tick */}
                  <line
                    x1={bx}
                    y1={my}
                    x2={bx + 12}
                    y2={my}
                    stroke={isFilled ? '#ffffff' : color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Right tick */}
                  <line
                    x1={bx + bw - 12}
                    y1={my}
                    x2={bx + bw}
                    y2={my}
                    stroke={isFilled ? '#ffffff' : color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Dashed guide */}
                  <line
                    x1={bx + 14}
                    y1={my}
                    x2={bx + bw - 14}
                    y2={my}
                    stroke={isFilled ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.18)'}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {/* Mark text badge */}
                  <rect
                    x={bx + (bw - 30) / 2}
                    y={my - 7}
                    width={30}
                    height={14}
                    rx="3"
                    fill={isFilled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.85)'}
                  />
                  <text
                    x={bx + bw / 2}
                    y={my + 3.5}
                    textAnchor="middle"
                    fill={isFilled ? color : '#0f172a'}
                    fontSize="9.5"
                    fontWeight="800"
                    className="select-none pointer-events-none"
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}

          {/* Glass reflection */}
          <path
            d={`M ${bx + 4} ${by + 6} L ${bx + 4} ${by + bh - 8}`}
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Foreground Border */}
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={12}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
          />
        </svg>

        {/* Quick Speaker Button */}
        <button
          type="button"
          onClick={handleSpeak}
          title={t.listenVessel}
          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-sky-600 hover:bg-sky-50 hover:scale-110 active:scale-95 transition-transform"
        >
          <Volume2 size={13} />
        </button>
      </div>

      {/* Label under the vessel */}
      {showLabels && (
        <span 
          className="mt-2 text-xs sm:text-sm font-black text-slate-800 text-center"
          style={{ color }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
};
