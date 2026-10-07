'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  RefreshCw,
  Sliders,
  FileText,
  Check,
  X,
  Plus,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import type { Instrument, BlogPost, SyncState, ContactMessage } from '@/db/schema';

interface SystemStatusData {
  databaseConfigured: boolean;
  databaseProvider: string;
  finnhubConfigured: boolean;
  finnhubRpmLimit: string;
  totalEvents: number;
  totalInstruments: number;
  activeInstruments: number;
  syncState: SyncState;
  totalBlogPosts: number;
  unreadMessages: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'instruments' | 'blog'>('overview');
  const [statusData, setStatusData] = useState<SystemStatusData | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Blog Editor State
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postForm, setPostForm] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    contentMarkdown: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Forex Administrator Research',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
  });

  // Verify Auth on mount
  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) {
      router.push('/admin/login');
      return;
    }
    setToken(stored);
  }, [router]);

  const fetchStatus = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/status', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setStatusData(json.data);
      }
    } catch (err) {
      console.error('Failed to load status', err);
    }
  }, [router]);

  const fetchInstruments = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar');
      const json = await res.json();
      if (json.success) {
        setInstruments(json.instruments || []);
      }
    } catch (err) {
      console.error('Failed to load instruments', err);
    }
  }, []);

  const fetchBlogPosts = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/blog?all=true', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setBlogPosts(json.posts || []);
      }
    } catch (err) {
      console.error('Failed to load blog posts', err);
    }
  }, []);

  const loadAll = useCallback(async (authToken: string) => {
    setLoading(true);
    await Promise.all([
      fetchStatus(authToken),
      fetchInstruments(),
      fetchBlogPosts(authToken),
    ]);
    setLoading(false);
  }, [fetchStatus, fetchInstruments, fetchBlogPosts]);

  useEffect(() => {
    if (token) {
      loadAll(token);
    }
  }, [token, loadAll]);

  // Handle Sync Now
  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success) {
        if (json.isDemoMode) {
          setSyncMessage('Sync completed (Finnhub API key not configured yet).');
        } else {
          setSyncMessage(`Sync successful! Upserted: ${json.upsertedCount}, New Releases: ${json.releasedCount}`);
        }
        await fetchStatus(token);
      } else {
        setSyncMessage(`Sync error: ${json.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync request failed';
      setSyncMessage(msg);
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Instrument Active
  const handleToggleInstrumentActive = async (inst: Instrument) => {
    try {
      const res = await fetch('/api/admin/instruments', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: inst.id,
          isActive: !inst.isActive,
        }),
      });
      if (res.ok) {
        setInstruments((prev) =>
          prev.map((i) => (i.id === inst.id ? { ...i, isActive: !i.isActive } : i))
        );
      }
    } catch (err) {
      console.error('Failed to toggle instrument', err);
    }
  };

  // Save Blog Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postForm),
      });
      const json = await res.json();
      if (json.success) {
        await fetchBlogPosts(token);
        setIsEditingPost(false);
        setPostForm({
          title: '',
          slug: '',
          excerpt: '',
          contentMarkdown: '',
          coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
          authorName: 'Forex Administrator Research',
          status: 'draft',
          seoTitle: '',
          seoDescription: '',
        });
      }
    } catch (err) {
      console.error('Failed to save post', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (loading && !statusData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
          <span>Loading secure administration systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <h1 className="text-xl font-bold text-white">Administrator Command Console</h1>
          </div>
          <p className="text-xs text-slate-400">
            Internal market data telemetry, instrument management, and research dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { tab: 'overview', label: 'Calendar Engine & Status', icon: RefreshCw },
          { tab: 'instruments', label: 'Instruments Management', icon: Sliders },
          { tab: 'blog', label: 'Research Articles', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab as typeof activeTab)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & CALENDAR TOOLS */}
      {activeTab === 'overview' && statusData && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
              <span className="text-xs font-medium text-slate-400">Database Layer</span>
              <p className="text-base font-bold text-white">{statusData.databaseProvider}</p>
              <span className="text-[11px] text-slate-400">
                {statusData.databaseConfigured ? 'Connected to Neon PostgreSQL' : 'Database Connection Pending'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
              <span className="text-xs font-medium text-slate-400">Finnhub API Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    statusData.finnhubConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span className="text-base font-bold text-white">
                  {statusData.finnhubConfigured ? 'Configured & Active' : 'API Key Pending'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Rate Limit: {statusData.finnhubRpmLimit} RPM</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
              <span className="text-xs font-medium text-slate-400">Total Calendar Events</span>
              <p className="text-2xl font-bold font-mono text-amber-400">{statusData.totalEvents}</p>
              <span className="text-[11px] text-slate-400">Persistent PostgreSQL releases</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
              <span className="text-xs font-medium text-slate-400">Active Instruments</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {statusData.activeInstruments} / {statusData.totalInstruments}
              </p>
              <span className="text-[11px] text-slate-400">Available across all categories</span>
            </div>
          </div>

          {/* Sync Trigger Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Synchronize Finnhub Calendar Tape</h3>
                <p className="text-xs text-slate-400">
                  Manually triggers ingestion of macroeconomic events across foreign exchange, precious metals, and energy markets into PostgreSQL.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={syncing}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-sm shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Synchronizing Ingest...' : 'Sync Calendar Now'}</span>
              </button>
            </div>

            {syncMessage && (
              <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-amber-300 font-mono">
                {syncMessage}
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span>
                Last Successful Sync:{' '}
                <strong className="text-slate-300">
                  {statusData.syncState.lastSuccessfulSync
                    ? new Date(statusData.syncState.lastSuccessfulSync).toLocaleString()
                    : 'System initialized'}
                </strong>
              </span>
              <span>
                Engine Lock:{' '}
                <strong className="text-slate-300">
                  {statusData.syncState.isLocked ? 'Locked (Sync active)' : 'Unlocked (Ready)'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. INSTRUMENTS MANAGEMENT */}
      {activeTab === 'instruments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">All Configured Financial Instruments</h3>
            <span className="text-xs text-slate-400">{instruments.length} total</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Display Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Currencies</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white">{inst.symbol}</td>
                      <td className="px-4 py-3 text-slate-300">{inst.displayName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          {inst.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {inst.baseCurrency} / {inst.quoteCurrency}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{inst.sortOrder}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleInstrumentActive(inst)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            inst.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {inst.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>{inst.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. BLOG POSTS MANAGEMENT */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Research Dossiers &amp; Macro Articles</h3>
            <button
              type="button"
              onClick={() => {
                setPostForm({
                  title: '',
                  slug: '',
                  excerpt: '',
                  contentMarkdown: '',
                  coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
                  authorName: 'Forex Administrator Research',
                  status: 'published',
                  seoTitle: '',
                  seoDescription: '',
                });
                setIsEditingPost(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Article</span>
            </button>
          </div>

          {/* Form Drawer */}
          {isEditingPost && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">
                  {postForm.id ? 'Edit Research Article' : 'Draft New Research Article'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingPost(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Article Title</label>
                    <input
                      type="text"
                      required
                      value={postForm.title || ''}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        setPostForm({ ...postForm, title, slug: postForm.slug || slug });
                      }}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={postForm.slug || ''}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    required
                    value={postForm.excerpt || ''}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Cover Image URL</label>
                  <input
                    type="url"
                    required
                    value={postForm.coverImageUrl || ''}
                    onChange={(e) => setPostForm({ ...postForm, coverImageUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Content (Markdown)</label>
                  <textarea
                    rows={8}
                    required
                    value={postForm.contentMarkdown || ''}
                    onChange={(e) => setPostForm({ ...postForm, contentMarkdown: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Publication Status</label>
                    <select
                      value={postForm.status || 'draft'}
                      onChange={(e) => setPostForm({ ...postForm, status: e.target.value as 'draft' | 'published' })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Author Name</label>
                    <input
                      type="text"
                      value={postForm.authorName || ''}
                      onChange={(e) => setPostForm({ ...postForm, authorName: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingPost(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Save &amp; Publish Article
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Blog Posts */}
          <div className="grid grid-cols-1 gap-3">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        post.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {post.status}
                    </span>
                    <h4 className="text-sm font-bold text-white">{post.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPostForm(post);
                      setIsEditingPost(true);
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Edit
                  </button>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
