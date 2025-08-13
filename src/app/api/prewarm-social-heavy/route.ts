import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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

  // Include TikTok last because it may be slower
  const targets = [
    '/api/youtube-stats?c=@Ndik',
    '/api/instagram-stats?u=ireddragonicy',
    '/api/instagram-stats?u=ireddragonicy.code',
    '/api/pinterest-stats?u=IRedDragonICY',
    '/api/threads-stats?u=ireddragonicy',
    '/api/bluesky-stats?u=ireddragonicy.bsky.social',
    '/api/hoyolab-stats?id=10849915',
    '/api/strava-stats?id=164295314',
    '/api/x-stats?u=ireddragonicy',
    '/api/tiktok-stats?u=ireddragonicy',
  ];

  const startAll = Date.now();
  const results = await Promise.allSettled(
    targets.map(async (path): Promise<PrewarmResult> => {
      const url = `${origin}${path}`;
      const t0 = Date.now();
      try {
        const res = await fetchWithTimeout(url, 45000);
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


