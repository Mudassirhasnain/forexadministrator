'use client';

import React, { useState, useMemo } from 'react';
import type { Instrument } from '@/db/schema';
import { Search, Check, Layers } from 'lucide-react';

interface InstrumentSelectorProps {
  instruments: Instrument[];
  selectedIds: string[];
  onToggleInstrument: (id: string) => void;
  onClearInstruments: () => void;
}

export function InstrumentSelector({
  instruments,
  selectedIds,
  onToggleInstrument,
  onClearInstruments,
}: InstrumentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  const categories = ['all', 'Metals', 'Energy', 'Forex', 'Crypto'];

  const filteredInstruments = useMemo(() => {
    return instruments.filter((inst) => {
      const matchesCategory =
        activeCategoryTab === 'all' || inst.category.toLowerCase() === activeCategoryTab.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [instruments, activeCategoryTab, searchQuery]);

  const isAllEventsMode = selectedIds.length === 0;

  return (
    <div className="w-full space-y-3">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Instruments
          </span>
          {isAllEventsMode ? (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/20">
              <Layers className="h-3 w-3" />
              Showing All Events (No Filter)
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              {selectedIds.length} active ({selectedIds.join(', ')})
            </span>
          )}
        </div>

        {/* Category Tabs and Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryTab(cat)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  activeCategoryTab === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-28 sm:w-36 rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-2 text-xs text-slate-200 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Selectable Chips Row (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
        {filteredInstruments.map((inst) => {
          const isSelected = selectedIds.includes(inst.id) || selectedIds.includes(inst.symbol);
          return (
            <button
              key={inst.id}
              type="button"
              onClick={() => onToggleInstrument(inst.id)}
              className={`group flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-950/40 ring-1 ring-amber-500/30'
                  : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="font-semibold">{inst.symbol}</span>
              {isSelected && <Check className="h-3 w-3 text-amber-400 stroke-[2.5]" />}
            </button>
          );
        })}
        {filteredInstruments.length === 0 && (
          <span className="text-xs text-slate-500 py-1">No instruments found matching &quot;{searchQuery}&quot;</span>
        )}
      </div>
    </div>
  );
}
