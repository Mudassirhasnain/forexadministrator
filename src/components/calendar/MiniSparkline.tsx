'use client';

import React from 'react';

interface MiniSparklineProps {
  values?: Array<number | string>;
  width?: number;
  height?: number;
  className?: string;
}

export function MiniSparkline({ values = [], width = 56, height = 20, className = '' }: MiniSparklineProps) {
  // Parse numeric values from strings (e.g. "0.3%", "49.8", "-1.45M")
  const numericPoints = values
    .map((v) => {
      if (typeof v === 'number') return v;
      if (!v) return null;
      const clean = String(v).replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? null : parsed;
    })
    .filter((v): v is number => v !== null);

  if (numericPoints.length < 2) {
    return <span className="text-[10px] text-slate-600 font-mono">—</span>;
  }

  const min = Math.min(...numericPoints);
  const max = Math.max(...numericPoints);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 2;
  const usableHeight = height - padding * 2;
  const step = (width - padding * 2) / (numericPoints.length - 1);

  const points = numericPoints.map((val, idx) => {
    const x = padding + idx * step;
    // Invert y: higher values closer to 0
    const y = padding + usableHeight - ((val - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const isRising = numericPoints[numericPoints.length - 1] >= numericPoints[0];
  const strokeColor = isRising ? '#10B981' : '#F43F5E';

  return (
    <svg width={width} height={height} className={`inline-block overflow-visible ${className}`}>
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="2"
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
