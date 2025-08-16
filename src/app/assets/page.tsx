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
  const [loadError, setLoadError] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<PixivItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const items = useMemo(() => (data?.items ?? []).filter(item => item.thumb && loaded[item.id] && !loadError[item.id]), [data, loaded, loadError]);

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

  const openFullscreen = (item: PixivItem) => {
    setSelectedItem(item);
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setSelectedItem(null);
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    document.body.style.overflow = 'auto';
  };

  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    const newZoom = Math.max(0.5, Math.min(5, zoomLevel + delta));
    if (clientX !== undefined && clientY !== undefined) {
      // Zoom towards cursor position
      const rect = document.querySelector('.fullscreen-image')?.getBoundingClientRect();
      if (rect) {
        const offsetX = (clientX - rect.left - rect.width / 2) / zoomLevel;
        const offsetY = (clientY - rect.top - rect.height / 2) / zoomLevel;
        setDragOffset({
          x: dragOffset.x - offsetX * (newZoom - zoomLevel),
          y: dragOffset.y - offsetY * (newZoom - zoomLevel)
        });
      }
    }
    setZoomLevel(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(delta, e.clientX, e.clientY);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return;
      
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoom(0.2);
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoom(-0.2);
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, zoomLevel, dragOffset]);

  useEffect(() => {
    fetchAssets(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navigation personalInfo={{ alias: 'IRedDragonICY' }} />
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Assets</h1>
          <p className="text-gray-400 mt-1">
            A curated snapshot of my illustration work on Pixiv — blending software craftsmanship with visual art.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800/50">
            <label htmlFor="userId" className="text-sm text-gray-400">User:</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-transparent text-cyan-400 text-sm w-20 outline-none"
              placeholder="User ID"
            />
          </div>
          <button
            onClick={() => fetchAssets(userId, true)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 p-6 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-gray-300">
            {progress ? `Loading assets ${progress.done}/${progress.total}...` : 'Syncing portfolio assets...'}
          </span>
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Hidden loader for images */}
      {data && (
        <div className="hidden">
          {data.items.filter(item => item.thumb && !loaded[item.id] && !loadError[item.id]).map(item => (
            <img
              key={item.id}
              src={`/api/pixiv-img?src=${encodeURIComponent(item.thumb!)}`}
              alt=""
              onLoad={() => setLoaded(prev => ({ ...prev, [item.id]: true }))}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                let retried = false;
                try {
                  const u = new URL(target.src, window.location.href);
                  const srcParam = u.searchParams.get('src');
                  if (srcParam && !retried) {
                    const real = new URL(srcParam.replace(/&amp;/g, '&'));
                    if (real.hostname === 'i.pximg.net') {
                      real.hostname = 'i-cf.pximg.net';
                      target.src = `/api/pixiv-img?src=${encodeURIComponent(real.toString())}`;
                      retried = true;
                      return;
                    } else if (real.hostname === 'i-cf.pximg.net') {
                      real.hostname = 'i.pximg.net';
                      target.src = `/api/pixiv-img?src=${encodeURIComponent(real.toString())}`;
                      retried = true;
                      return;
                    }
                  }
                } catch {}
                setLoadError(prev => ({ ...prev, [item.id]: true }));
              }}
            />
          ))}
        </div>
      )}

      {data && items.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-6">Last updated {new Date(data.updatedAt).toLocaleString()} • {items.length} loaded of {data.count} total</div>
          
          {/* Instagram-like masonry grid */}
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
            {items.map(item => (
              <div key={item.id} className="group block break-inside-avoid cursor-pointer">
                <div 
                  className="relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/30"
                  onClick={() => openFullscreen(item)}
                >
                  <img
                    src={`/api/pixiv-img?src=${encodeURIComponent(item.thumb!)}`}
                    alt={item.alt || item.title || `Artwork ${item.id}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  
                  {/* Gradient overlay with modern styling */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Title and metadata overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="text-sm font-medium truncate mb-1">{item.title || 'Untitled'}</div>
                    <div className="flex items-center justify-between text-xs opacity-80">
                      <span>#{item.id}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        <span>Pixiv</span>
                      </div>
                    </div>
                  </div>

                  {/* Modern corner accent */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Click indicator */}
                  <div className="absolute top-2 left-2 p-1 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data && (data.items?.length ?? 0) === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Assets Found</h3>
          <p className="text-gray-500">No artwork items could be loaded. Try refreshing or check the user ID.</p>
        </div>
      )}

      {/* Fullscreen Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={closeFullscreen}
          />
          
          {/* Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                onClick={closeFullscreen}
                className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="px-3 py-1 rounded-lg bg-black/50 text-white text-sm">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
            
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => handleZoom(-0.2)}
                className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                title="Zoom Out (-)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <button
                onClick={() => { setZoomLevel(1); setDragOffset({ x: 0, y: 0 }); }}
                className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                title="Reset Zoom (0)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => handleZoom(0.2)}
                className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                title="Zoom In (+)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              <a
                href={selectedItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                title="Open in Pixiv"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Image Container */}
          <div 
            className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              src={`/api/pixiv-img?src=${encodeURIComponent(selectedItem.thumb!)}`}
              alt={selectedItem.alt || selectedItem.title || `Artwork ${selectedItem.id}`}
              className="fullscreen-image absolute inset-0 m-auto max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${zoomLevel}) translate(${dragOffset.x / zoomLevel}px, ${dragOffset.y / zoomLevel}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              draggable={false}
            />
          </div>

          {/* Info Panel */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="px-4 py-2 rounded-lg bg-black/50 text-white pointer-events-auto">
              <div className="font-medium">{selectedItem.title || 'Untitled'}</div>
              <div className="text-sm opacity-70">#{selectedItem.id} • Pixiv</div>
            </div>
            <div className="text-xs text-gray-400 px-3 py-1 rounded-lg bg-black/30">
              ESC to close • Scroll to zoom • Drag to pan
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}


