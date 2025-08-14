'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

type PixivItem = {
  id: string;
  href: string;
  thumb: string | null;
  title: string | null;
  alt: string | null;
};

type PixivResponse = {
  userId: string;
  count: number;
  items: PixivItem[];
  updatedAt: string;
};

export default function AssetsPage() {
  const [userId, setUserId] = useState<string>('63934020');
  const [data, setData] = useState<PixivResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const items = useMemo(() => (data?.items ?? []), [data]);

  const fetchAssets = async (uid: string, force = false) => {
    setLoading(true);
    setError(null);
    setProgress(null);
    let attempts = 0;
    let latest: PixivResponse | null = null;
    try {
      while (attempts < 6) {
        const params = new URLSearchParams({ user: uid, maxDetails: '2000', concurrency: '10' });
        if (force || attempts > 0) params.set('rev', String(Date.now()))
        const res = await fetch(`/api/pixiv-assets?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PixivResponse = await res.json();
        latest = json;
        const missing = json.items.filter(it => !it.thumb).length;
        setProgress({ done: json.items.length - missing, total: json.items.length });
        setData(json);
        if (missing === 0) break;
        attempts += 1;
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      if (latest) setData(latest);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navigation personalInfo={{ alias: 'IRedDragonICY' }} />
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">Assets</h1>
          <p className="text-sm text-gray-400">
            A curated snapshot of my illustration work on Pixiv — blending software craftsmanship with visual art.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-gray-400">
          Syncing portfolio assets{progress ? ` — ${progress.done}/${progress.total}` : '...'}
        </div>
      )}
      {error && (
        <div className="text-red-400">{error}</div>
      )}

      {data && items.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-4">Last updated {new Date(data.updatedAt).toLocaleString()} • Items {data.count}</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {items.map(item => (
              <Link key={item.id} href={item.href} target="_blank" className="group block">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
                  {item.thumb ? (
                    <>
                      <img
                        src={`/api/pixiv-img?src=${encodeURIComponent(item.thumb)}`}
                        alt={item.alt || item.title || `Artwork ${item.id}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded[item.id] ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setLoaded(prev => ({ ...prev, [item.id]: true }))}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          try {
                            const u = new URL(target.src, window.location.href);
                            const srcParam = u.searchParams.get('src');
                            if (srcParam) {
                              const real = new URL(srcParam.replace(/&amp;/g, '&'));
                              if (real.hostname === 'i.pximg.net') {
                                real.hostname = 'i-cf.pximg.net';
                              } else if (real.hostname === 'i-cf.pximg.net') {
                                real.hostname = 'i.pximg.net';
                              } else if (real.hostname === 'embed.pixiv.net') {
                                // leave to proxy resolver
                              }
                              target.src = `/api/pixiv-img?src=${encodeURIComponent(real.toString())}`;
                            }
                          } catch {}
                        }}
                      />
                      {/* Skeleton shimmer */}
                      {!loaded[item.id] && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800/40 to-gray-700/40" />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800/40 to-gray-700/40" />
                  )}
                  {/* Overlay title on hover */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-[10px] sm:text-xs text-gray-200 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="truncate">{item.title || 'Untitled'}</div>
                    <div className="opacity-70">#{item.id}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {data && (data.items?.length ?? 0) === 0 && (
        <div className="text-gray-400">No items found. Try Refresh or a different user ID.</div>
      )}
      </main>
    </>
  );
}


