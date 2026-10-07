'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to dispatch message');
      }
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Communication error';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Mail className="h-3.5 w-3.5" />
          <span>INQUIRIES &amp; MARKET FEEDBACK</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Contact the Desk</h1>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          Have an inquiry regarding macroeconomic feed coverage, API status, or custom institutional instrument
          mappings? Transmit your message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Information Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Operational Desk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our market operations and research team monitors releases around the clock throughout active global trading
              sessions (Sydney, Tokyo, London, and New York).
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Production Desk:</span>
              <span className="text-slate-200 font-mono">desk@forexadministrator.com</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Headquarters:</span>
              <span className="text-slate-200">Global Financial Markets Intelligence</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Data Refresh Cadence:</span>
              <span className="text-emerald-400 font-semibold">Continuous Ingestion</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
          {status === 'success' ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Message Transmitted</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Thank you for reaching out. Your submission has been securely recorded in our database. An operations analyst will review your note.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field for anti-spam (hidden from users) */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs font-medium text-slate-300">
                    Trader Name *
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Marcus Vance"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-medium text-slate-300">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="trader@hedgefund.com"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="block text-xs font-medium text-slate-300">
                  Subject *
                </label>
                <input
                  id="subject"
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Feed question regarding FOMC dot-plot coverage"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="block text-xs font-medium text-slate-300">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide context regarding your market inquiry..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{status === 'loading' ? 'Transmitting...' : 'Send Message to Desk'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
