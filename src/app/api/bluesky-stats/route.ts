import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BlueskyStats = {
  handle: string;
  followers: number | null;
  following: number | null;
  posts: number | null;
  source: 'bluesky-api' | 'unknown' | null;
  updatedAt: string;
};

async function fetchProfile(handle: string): Promise<BlueskyStats> {
  const now = new Date().toISOString();
  try {
    const url = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json,text/plain,*/*',
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      return { handle, followers: null, following: null, posts: null, source: 'unknown', updatedAt: now };
    }
    const data = (await res.json()) as {
      followersCount?: number;
      followsCount?: number;
      postsCount?: number;
      handle?: string;
    };
    return {
      handle,
      followers: typeof data.followersCount === 'number' ? data.followersCount : null,
      following: typeof data.followsCount === 'number' ? data.followsCount : null,
      posts: typeof data.postsCount === 'number' ? data.postsCount : null,
      source: 'bluesky-api',
      updatedAt: now,
    };
  } catch {
    return { handle, followers: null, following: null, posts: null, source: 'unknown', updatedAt: now };
  }
}

function normalizeHandle(input: string): string {
  const h = input.replace(/^@/, '').trim();
  if (h.includes('.')) return h;
  return `${h}.bsky.social`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('u') || searchParams.get('handle') || 'ireddragonicy.bsky.social';
  const handle = normalizeHandle(raw);
  const stats = await fetchProfile(handle);
  const ok = stats.followers !== null || stats.following !== null || stats.posts !== null;
  const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
  res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res;
}


