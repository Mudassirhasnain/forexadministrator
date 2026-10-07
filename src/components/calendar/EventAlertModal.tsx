'use client';

import React, { useState } from 'react';
import { Bell, X, Check, Clock } from 'lucide-react';
import type { EnrichedEvent } from '@/lib/calendar/filterEngine';

interface EventAlertModalProps {
  event: EnrichedEvent;
  onClose: () => void;
  onSaveAlert: (eventId: string, minutesBefore: number) => void;
  existingMinutes?: number | null;
}

export function EventAlertModal({ event, onClose, onSaveAlert, existingMinutes }: EventAlertModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(
    existingMinutes !== undefined && existingMinutes !== null ? existingMinutes : 5
  );
  const [statusMessage, setStatusMessage] = useState<string>('');

  const requestAndSave = async (mins: number) => {
    setSelectedMinutes(mins);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setStatusMessage('Browser notifications blocked. Alert saved locally in-tab.');
          onSaveAlert(event.id, mins);
          setTimeout(onClose, 1200);
          return;
        }
      }
    }
    setStatusMessage('Alert active! Notification set.');
    onSaveAlert(event.id, mins);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Event Reminder</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-200">{event.eventName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {event.currency} • Scheduled {event.localTimeString} ({event.localDateHeading})
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">Trigger Alert:</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { mins: 0, label: 'At release time' },
              { mins: 5, label: '5 minutes before' },
              { mins: 15, label: '15 minutes before' },
            ].map((opt) => (
              <button
                key={opt.mins}
                type="button"
                onClick={() => requestAndSave(opt.mins)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selectedMinutes === opt.mins
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{opt.label}</span>
                </div>
                {selectedMinutes === opt.mins && <Check className="h-3.5 w-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {statusMessage && (
          <p className="text-xs text-amber-400 text-center font-medium">{statusMessage}</p>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
