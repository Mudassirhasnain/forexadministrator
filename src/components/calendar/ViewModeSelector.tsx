'use client';

import React from 'react';
import type { ViewMode } from '@/lib/calendar/filterEngine';

interface ViewModeSelectorProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export function ViewModeSelector({ currentView, onSelectView }: ViewModeSelectorProps) {
  const modes: Array<{ mode: ViewMode; label: string }> = [
    { mode: 'previous', label: 'Previous' },
    { mode: 'today', label: 'Today' },
    { mode: 'upcoming', label: 'Upcoming' },
    { mode: 'all', label: 'All' },
  ];

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 shadow-sm">
      {modes.map((item) => {
        const isActive = currentView === item.mode;
        return (
          <button
            key={item.mode}
            type="button"
            onClick={() => onSelectView(item.mode)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
