'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, Check, RotateCcw } from 'lucide-react';
import type { DateFilterConfig } from '@/lib/calendar/filterEngine';

interface DatePickerModalProps {
  currentFilter: DateFilterConfig | null;
  onApply: (config: DateFilterConfig | null) => void;
}

export function DatePickerModal({ currentFilter, onApply }: DatePickerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'single' | 'range' | 'multiple'>(
    currentFilter?.mode || 'range'
  );

  // Form states
  const [singleDate, setSingleDate] = useState(
    currentFilter?.mode === 'single' ? currentFilter.values[0] || '' : ''
  );
  const [rangeFrom, setRangeFrom] = useState(
    currentFilter?.mode === 'range' ? currentFilter.values[0] || '' : ''
  );
  const [rangeTo, setRangeTo] = useState(
    currentFilter?.mode === 'range' ? currentFilter.values[1] || '' : ''
  );
  const [multipleDatesStr, setMultipleDatesStr] = useState(
    currentFilter?.mode === 'multiple' ? currentFilter.values.join(', ') : ''
  );

  const handleOpen = () => {
    if (currentFilter) {
      setMode(currentFilter.mode);
      if (currentFilter.mode === 'single') setSingleDate(currentFilter.values[0] || '');
      if (currentFilter.mode === 'range') {
        setRangeFrom(currentFilter.values[0] || '');
        setRangeTo(currentFilter.values[1] || '');
      }
      if (currentFilter.mode === 'multiple') setMultipleDatesStr(currentFilter.values.join(', '));
    }
    setIsOpen(true);
  };

  const handleApply = () => {
    if (mode === 'single' && singleDate) {
      onApply({ mode: 'single', values: [singleDate] });
    } else if (mode === 'range' && (rangeFrom || rangeTo)) {
      onApply({ mode: 'range', values: [rangeFrom, rangeTo] });
    } else if (mode === 'multiple' && multipleDatesStr) {
      const dates = multipleDatesStr
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
      if (dates.length > 0) {
        onApply({ mode: 'multiple', values: dates });
      } else {
        onApply(null);
      }
    } else {
      onApply(null);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSingleDate('');
    setRangeFrom('');
    setRangeTo('');
    setMultipleDatesStr('');
    onApply(null);
    setIsOpen(false);
  };

  const formatButtonLabel = () => {
    if (!currentFilter || currentFilter.values.length === 0) {
      return '📅 Select dates';
    }
    if (currentFilter.mode === 'single') {
      return `📅 ${currentFilter.values[0]}`;
    }
    if (currentFilter.mode === 'range') {
      return `📅 ${currentFilter.values[0] || 'Start'} → ${currentFilter.values[1] || 'End'}`;
    }
    if (currentFilter.mode === 'multiple') {
      return `📅 ${currentFilter.values.length} dates selected`;
    }
    return '📅 Select dates';
  };

  const isFilterActive = Boolean(currentFilter && currentFilter.values.length > 0);

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Date
        </span>
        <button
          type="button"
          onClick={handleOpen}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            isFilterActive
              ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
              : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
        >
          <span>{formatButtonLabel()}</span>
        </button>

        {isFilterActive && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear date filter"
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Date Window Selection</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'single' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'range' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Date Range
              </button>
              <button
                type="button"
                onClick={() => setMode('multiple')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'multiple' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Multiple Dates
              </button>
            </div>

            {/* Inputs based on Mode */}
            <div className="space-y-4">
              {mode === 'single' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Single Release Date
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              {mode === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">From Date</label>
                    <input
                      type="date"
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">To Date</label>
                    <input
                      type="date"
                      value={rangeTo}
                      onChange={(e) => setRangeTo(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {mode === 'multiple' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Comma-separated dates (YYYY-MM-DD)
                  </label>
                  <input
                    type="text"
                    placeholder="2026-10-07, 2026-10-08, 2026-10-10"
                    value={multipleDatesStr}
                    onChange={(e) => setMultipleDatesStr(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter explicit release days separated by commas.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Apply Filter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
