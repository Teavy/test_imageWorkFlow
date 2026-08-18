import React from 'react';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';

interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive?: boolean;
  label?: string;
  sourceType: string;
  targetType: string;
  onClickPlus?: () => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  isActive = false,
  label,
  sourceType,
  targetType,
  onClickPlus,
}) => {
  const deltaX = endX - startX;
  const controlPointOffset = Math.max(deltaX * 0.45, 60);

  const cp1X = startX + controlPointOffset;
  const cp1Y = startY;
  const cp2X = endX - controlPointOffset;
  const cp2Y = endY;

  const path = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  // Midpoint along the curve
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const gradientId = `lineGrad-${Math.round(startX)}-${Math.round(endX)}`;

  return (
    <g className="transition-all duration-300">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={isActive ? '0.8' : '0.35'} />
          <stop offset="50%" stopColor="#a855f7" stopOpacity={isActive ? '1' : '0.6'} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={isActive ? '0.8' : '0.35'} />
        </linearGradient>
      </defs>

      {/* Background shadow path */}
      <path
        d={path}
        fill="none"
        stroke="#050508"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Base connecting line with Immersive gradient */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeDasharray="5 5"
        strokeLinecap="round"
        className="transition-colors duration-300"
      />

      {/* Animated active energy pulse when generating */}
      {isActive && (
        <path
          d={path}
          fill="none"
          stroke="#c084fc"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="8 12"
          className="animate-pulse"
          style={{
            animation: 'dashAnimation 1.2s linear infinite',
          }}
        />
      )}

      {/* Central Plus Icon Button matching Immersive UI */}
      <foreignObject
        x={midX - 16}
        y={midY - 16}
        width="32"
        height="32"
        className="overflow-visible"
      >
        <div className="group relative flex items-center justify-center">
          <button
            onClick={onClickPlus}
            title={`连接管道: ${sourceType} ➜ ${targetType}`}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              isActive
                ? 'bg-indigo-600 text-white border border-indigo-400 ring-4 ring-indigo-500/20 scale-110'
                : 'bg-[#0f0f1a] hover:bg-[#1a1a2e] text-slate-300 hover:text-white border border-white/10 hover:border-indigo-400 hover:scale-110'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Tooltip badge on hover */}
          <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 px-3 py-1 bg-[#0a0a12] border border-white/10 backdrop-blur-md rounded-xl text-[11px] text-slate-200 shadow-2xl whitespace-nowrap z-50 pointer-events-none">
            <span className="text-indigo-400 font-medium">{sourceType}</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-purple-400 font-medium">{targetType}</span>
            {label && <span className="text-slate-400">({label})</span>}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
