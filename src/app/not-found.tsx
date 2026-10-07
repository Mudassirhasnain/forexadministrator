import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="rounded-full bg-slate-900 border border-slate-800 p-4">
        <span className="text-2xl font-mono text-amber-400 font-bold">404</span>
      </div>
      <h1 className="text-xl font-bold text-white">Page or Research Dossier Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested macroeconomic release or research URL does not exist or has been archived.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
      >
        Return to Calendar Tape
      </Link>
    </div>
  );
}
