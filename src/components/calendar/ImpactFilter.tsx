'use client';

import React from 'react';
import type { ImpactLevel } from '@/lib/calendar/filterEngine';

interface ImpactFilterProps {
  selectedImpacts: ImpactLevel[];
  onToggleImpact: (impact: ImpactLevel) => void;
  counts: { high: number; medium: number; low: number };
}

export function ImpactFilter({ selectedImpacts, onToggleImpact, counts }: ImpactFilterProps) {
  const options: Array<{ level: ImpactLevel; label: string; count: number; activeClass: string }> = [
    {
      level: 'high',
      label: 'High Impact',
      count: counts.high,
      activeClass: 'border-rose-500/80 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    },
    {
      level: 'medium',
      label: 'Medium Impact',
      count: counts.medium,
      activeClass: 'border-amber-500/80 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
    },
    {
      level: 'low',
      label: 'Low Impact',
      count: counts.low,
      activeClass: 'border-slate-500/80 bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30',
    },
  ];

  const isAllActive = selectedImpacts.length === 0 || selectedImpacts.length === 3;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Impact
        </span>
        {isAllActive && (
          <span className="text-[11px] text-slate-400">
            (All levels active)
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map((opt) => {
          const isSelected = selectedImpacts.includes(opt.level);
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => onToggleImpact(opt.level)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? opt.activeClass
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  opt.level === 'high'
                    ? 'bg-rose-500'
                    : opt.level === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <span>{opt.label}</span>
              <span className="text-[11px] tabular-nums opacity-75">
                ({opt.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
