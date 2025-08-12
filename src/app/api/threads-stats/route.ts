import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ThreadsStats = {
  username: string;
  followers: number | null;
  source: 'threads' | 'threads-text' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase();
    const suffixMatch = lower.match(/([km])/);
    if (suffixMatch) {
      const valueMatch = lower.match(/(\d+(?:[\.,]\d+)?)/);
      if (!valueMatch) return null;
      const numeric = parseFloat(valueMatch[1].replace(',', '.'));
      if (Number.isNaN(numeric)) return null;
      const suffix = suffixMatch[1];
      const multiplier = suffix === 'k' ? 1_000 : 1_000_000;
      return Math.round(numeric * multiplier);
    }
    const digits = input.replace(/[^\d]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  } catch {
    return null;
  }
}

function extractFollowers(text: string): number | null {
  // Match patterns like "1,288 followers" or title="1,288" followers
  const m = text.match(/(\d[\d\s\.,]*?)\s*followers(?!\w)/i);
  if (m) {
    const num = parseCompactNumber(m[1]);
    if (typeof num === 'number') return num;
  }
  // Also try "followers\":\"1,288\"" if present in JSON blobs
  const m2 = text.match(/followers\"?\s*[:=]\s*\"?(\d[\d\s\.,]*)/i);
  if (m2) {
    const num = parseCompactNumber(m2[1]);
    if (typeof num === 'number') return num;
  }
  return null;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }
  return res.text();
}

async function crawlThreadsStats(username: string): Promise<ThreadsStats> {
  const nowIso = new Date().toISOString();

  // 1) Try text-mode via r.jina.ai for threads.net
  try {
    const textUrl = `https://r.jina.ai/http://www.threads.net/@${username}`;
    const text = await fetchText(textUrl);
    const followers = extractFollowers(text);
    if (followers !== null) {
      return { username, followers, source: 'threads-text', updatedAt: nowIso };
    }
  } catch {}

  // 1b) Alternative domain path
  try {
    const textUrl2 = `https://r.jina.ai/http://threads.net/@${username}`;
    const text2 = await fetchText(textUrl2);
    const followers2 = extractFollowers(text2);
    if (followers2 !== null) {
      return { username, followers: followers2, source: 'threads-text', updatedAt: nowIso };
    }
  } catch {}

  // 2) Direct HTML fetch
  try {
    const html = await fetchText(`https://www.threads.net/@${username}`);
    const followers = extractFollowers(html);
    if (followers !== null) {
      return { username, followers, source: 'threads', updatedAt: nowIso };
    }
  } catch {}

  return { username, followers: null, source: 'unknown', updatedAt: nowIso };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || searchParams.get('username') || 'ireddragonicy').replace(/^@/, '');
  try {
    const stats = await crawlThreadsStats(username);
    const ok = stats.followers !== null;
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    return res;
  } catch (err: any) {
    const res = NextResponse.json(
      { error: err?.message || 'Failed to crawl Threads stats', username },
      { status: 500 },
    );
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


