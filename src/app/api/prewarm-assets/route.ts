import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type PrewarmResult = {
  path: string;
  status: number | null;
  ok: boolean;
  tookMs: number | null;
  error?: string;
};

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: Request) {
  const base = new URL(req.url);
  const origin = `${base.protocol}//${base.host}`;

  const pixivUser = (base.searchParams.get('user') || '63934020').replace(/[^0-9]/g, '');

  const targets = [
    // Fetch full list and aggressively resolve thumbnails for many items
    `/api/pixiv-assets?user=${pixivUser}&maxDetails=1200&concurrency=10`,
  ];

  const startAll = Date.now();
  const results = await Promise.allSettled(
    targets.map(async (path): Promise<PrewarmResult> => {
      const url = `${origin}${path}`;
      const t0 = Date.now();
      try {
        const res = await fetchWithTimeout(url, 40000);
        const tookMs = Date.now() - t0;
        try { await res.clone().json().catch(() => res.text().catch(() => undefined)); } catch {}
        return { path, status: res.status, ok: res.ok, tookMs };
      } catch (e: any) {
        const tookMs = Date.now() - t0;
        return { path, status: null, ok: false, tookMs, error: e?.message || 'fetch failed' };
      }
    })
  );

  const payload = {
    startedAt: new Date(startAll).toISOString(),
    elapsedMs: Date.now() - startAll,
    results: results.map(r => (r.status === 'fulfilled' ? r.value : r.reason)).slice(0, targets.length),
  };

  const res = NextResponse.json(payload, { status: 200 });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}


