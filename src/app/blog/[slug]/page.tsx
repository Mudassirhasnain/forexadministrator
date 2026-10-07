import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbRepo } from '@/db';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = await dbRepo.getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | Forex Administrator',
    };
  }

  const title = post.seoTitle || `${post.title} | Forex Administrator Research`;
  const description = post.seoDescription || post.excerpt;
  const url = `https://forexadministrator.vercel.app/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: [
        {
          url: post.coverImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.coverImageUrl],
    },
  };
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const post = await dbRepo.getBlogPostBySlug(params.slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const allPosts = await dbRepo.getBlogPosts(true);
  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Forex Administrator',
      logo: {
        '@type': 'ImageObject',
        url: 'https://forexadministrator.vercel.app/icon.svg',
      },
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.publishedAt?.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://forexadministrator.vercel.app/blog/${post.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://forexadministrator.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://forexadministrator.vercel.app/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://forexadministrator.vercel.app/blog/${post.slug}`,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Research Blog</Link>
        <span>/</span>
        <span className="text-slate-200 truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Article Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          {post.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          {post.excerpt}
        </p>

        {/* Author / Date Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-800/80 py-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <User className="h-4 w-4 text-amber-400" />
              <span>{post.authorName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'October 2026'}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>5 min read</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold tracking-wide uppercase text-[11px]">
              Institutional Grade
            </span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="aspect-16/9 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Markdown Body */}
      <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
        {post.contentMarkdown.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xl sm:text-2xl font-bold text-white pt-4">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('- ')) {
            const items = paragraph.split('\n- ');
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1.5 text-sm text-slate-300">
                {items.map((item, itemIdx) => (
                  <li key={itemIdx}>{item.replace(/^- /, '')}</li>
                ))}
              </ul>
            );
          }
          if (paragraph.startsWith('1. ')) {
            const items = paragraph.split('\n');
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
                {items.map((item, itemIdx) => (
                  <li key={itemIdx}>{item.replace(/^\d+\.\s*/, '')}</li>
                ))}
              </ol>
            );
          }
          return (
            <p key={idx} className="text-sm sm:text-base leading-relaxed text-slate-300">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Return to Blog & Related Articles */}
      <div className="pt-8 border-t border-slate-800 space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Research Directory</span>
        </Link>

        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-white">Related Research Releases</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-all block space-y-1"
                >
                  <span className="text-[11px] text-amber-400 font-semibold block uppercase">Research Note</span>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{rel.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{rel.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
