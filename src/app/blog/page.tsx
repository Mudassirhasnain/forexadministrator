import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { dbRepo } from '@/db';
import { BookOpen, Calendar, Clock, ArrowRight, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Macroeconomic Research & Volatility Analysis | Blog',
  description:
    'Institutional macroeconomic articles, central bank policy analysis, CPI trade playbooks, and precious metals yield correlation studies.',
  alternates: {
    canonical: 'https://forexadministrator.vercel.app/blog',
  },
  openGraph: {
    title: 'Forex Administrator Research Desk',
    description: 'Institutional macroeconomic research, CPI playbooks, and FX volatility frameworks.',
    url: 'https://forexadministrator.vercel.app/blog',
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await dbRepo.getBlogPosts(true);
  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Blog Title Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <BookOpen className="h-3.5 w-3.5" />
          <span>INSTITUTIONAL MACRO DISPATCH</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Macroeconomic Research &amp; Market Insights
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          In-depth technical analysis of high-impact economic prints, central bank communication, yield curve
          distortions, and tactical execution frameworks for active traders.
        </p>
      </div>

      {/* Featured Article */}
      {featuredPost && (
        <article className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 hover:border-slate-700 transition-all shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-semibold text-amber-400 uppercase tracking-wider">Featured Analysis</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {featuredPost.publishedAt
                    ? new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'October 2026'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  5 min read
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>{featuredPost.authorName}</span>
                </div>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Read Full Dossier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 aspect-video sm:aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredPost.coverImageUrl}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </article>
      )}

      {/* Grid of Secondary Posts */}
      {secondaryPosts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Research Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'October 2026'}
                    </span>
                    <span>•</span>
                    <span>4 min read</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {post.authorName}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>Read</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
