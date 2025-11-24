'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DiffusionBackground from '@/app/social/components/diffusion/DiffusionBackground';
import { AssetCard } from './components/AssetCard';
import { AssetDashboard } from './components/AssetDashboard';
import { AssetViewer } from './components/AssetViewer';

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
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<PixivItem | null>(null);

  const items = useMemo(() => (data?.items ?? []).filter(item => item.thumb), [data]);

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load';
      setError(message);
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
      <DiffusionBackground />
      
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto relative z-10">
        <AssetDashboard 
          userId={userId}
          onUserIdChange={setUserId}
          onRefresh={() => fetchAssets(userId, true)}
          loading={loading}
          totalAssets={data?.count || 0}
          loadedCount={items.length}
          progress={progress}
        />

        {error && (
          <div className="p-4 mb-8 rounded-xl bg-destructive border border-destructive-foreground/20 text-destructive-foreground flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
            <span className="font-mono text-sm">ERROR: {error}</span>
          </div>
        )}

        {items.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
            {items.map((item) => (
              <AssetCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
               <div className="w-16 h-16 mb-4 rounded-full bg-card flex items-center justify-center">
                  <span className="font-mono text-2xl">?</span>
               </div>
               <h3 className="text-lg font-mono text-muted-foreground mb-2">NO_ASSETS_FOUND</h3>
               <p className="text-sm text-muted-foreground">Try a different User ID or sync again.</p>
            </div>
          )
        )}
      </main>

      <AnimatePresence>
        {selectedItem && (
          <AssetViewer 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
