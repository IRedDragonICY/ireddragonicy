import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type HoyolabStats = {
  id: string;
  posts: number | null;
  following: number | null;
  followers: number | null;
  likes: number | null;
  source: 'hoyolab' | 'hoyolab-text' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase().trim();
    // Support 1.6k, 1.6m, 1,234, 12 345, 12.345 etc.
    const m = lower.match(/(\d{1,3}(?:[\s.,]\d{3})+|\d+(?:[\.,]\d+)?)[\s]*([km])?/i);
    if (m) {
      const valueRaw = m[1];
      const suffix = (m[2] || '').toLowerCase();
      if (suffix) {
        const numeric = parseFloat(valueRaw.replace(/,/g, '.').replace(/\s/g, ''));
        if (Number.isNaN(numeric)) return null;
        let multiplier = 1;
        if (suffix === 'k') multiplier = 1_000;
        else if (suffix === 'm') multiplier = 1_000_000;
        return Math.round(numeric * multiplier);
      }
      const digitsOnly = valueRaw.replace(/[^\d]/g, '');
      if (!digitsOnly) return null;
      return parseInt(digitsOnly, 10);
    }
    const digits = input.replace(/[^\d]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  } catch {
    return null;
  }
}

function extractCounts(text: string): { posts: number | null; following: number | null; followers: number | null; likes: number | null } {
  const normalized = text
    .replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\u2060]/g, ' ')
    .replace(/[•·]/g, ' ');

  // 1) Prefer structured pairs from HoYoLAB markup
  let posts: number | null = null;
  let following: number | null = null;
  let followers: number | null = null;
  let likes: number | null = null;
  let foundStructured = false;

  // Limit parsing scope to the first rows container to avoid capturing unrelated items
  let scope = normalized;
  try {
    const lower = normalized.toLowerCase();
    let start = lower.indexOf('account-center-basic-rows--bottom');
    if (start === -1) start = lower.indexOf('account-center-basic-rows');
    if (start !== -1) {
      const from = Math.max(0, start - 100);
      const to = Math.min(normalized.length, start + 3000);
      scope = normalized.slice(from, to);
    }
  } catch {}

  const itemRegex = /<div[^>]*class=["'][^"']*account-center-basic-item[^"']*["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*account-center-basic-num[^"']*["'][^>]*>([^<]+)<\/span>[\s\S]*?<span[^>]*class=["'][^"']*account-center-basic-name[^"']*["'][^>]*>\s*([^<]+?)\s*<\/span>[\s\S]*?<\/div>/gi;
  for (const m of scope.matchAll(itemRegex)) {
    foundStructured = true;
    const rawValue = (m[1] || '').trim().replace(/\s*([km])\b/i, '$1');
    const label = (m[2] || '').trim().toLowerCase();
    const value = parseCompactNumber(rawValue);
    if (value === null) continue;
    if (/^posts?$/.test(label) || /(postingan|kiriman)/i.test(label)) {
      // Guardrail: Posts should be a reasonably small integer (< 1e6). Large values likely false capture.
      posts = value > 1_000_000 ? null : value;
    }
    else if (/^following$/.test(label) || /mengikuti/i.test(label)) following = value;
    else if (/^followers?$/.test(label) || /pengikut/i.test(label)) followers = value;
    else if (/^likes?$/.test(label) || /suka/i.test(label)) likes = value;
  }
  if (foundStructured) {
    return { posts, following, followers, likes };
  }

  // 2) Fallback: explicit word-boundary label scans to avoid matching 'postList' etc.
  const extractByLabels = (labels: string[]): number | null => {
    for (const lab of labels) {
      // number-first: 323 Posts
      const nf = normalized.match(
        new RegExp(`\\b(\\d[\\d\\s\.,]*(?:[\\.,]\\d+)?\\s*[km]?)\\s*${lab}\\b`, 'i'),
      );
      if (nf) return parseCompactNumber(nf[1]);
      // label-first: Posts 323
      const lf = normalized.match(
        new RegExp(`\\b${lab}\\b\\s*[:\-]?\\s*(\\d[\\d\\s\.,]*(?:[\\.,]\\d+)?\\s*[km]?)`, 'i'),
      );
      if (lf) return parseCompactNumber(lf[1]);
    }
    return null;
  };

  posts = extractByLabels(['posts', 'postingan', 'kiriman']);
  if (posts !== null && posts > 1_000_000) posts = null;
  following = extractByLabels(['following', 'mengikuti']);
  followers = extractByLabels(['followers', 'pengikut']);
  likes = extractByLabels(['likes', 'suka', 'total\\s*likes']);

  return { posts, following, followers, likes };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.text();
}

async function crawlHoyolabStats(id: string): Promise<HoyolabStats> {
  const now = new Date().toISOString();

  const candidatePaths = [
    `https://www.hoyolab.com/accountCenter/postList?id=${id}&lang=en-us`,
    `https://www.hoyolab.com/accountCenter/postList?id=${id}&lang=en`,
    `https://www.hoyolab.com/accountCenter/postList?id=${id}`,
  ];

  // 1) Text-mode via r.jina.ai (bypass JS)
  for (const direct of candidatePaths) {
    try {
      const text = await fetchText(`https://r.jina.ai/http://${direct.replace(/^https?:\/\//, '')}`);
      const { posts, following, followers, likes } = extractCounts(text);
      if ([posts, following, followers, likes].some(v => v !== null)) {
        return { id, posts, following, followers, likes, source: 'hoyolab-text', updatedAt: now };
      }
    } catch {}
  }

  // 2) Direct HTML
  for (const direct of candidatePaths) {
    try {
      const html = await fetchText(direct);
      const { posts, following, followers, likes } = extractCounts(html);
      if ([posts, following, followers, likes].some(v => v !== null)) {
        return { id, posts, following, followers, likes, source: 'hoyolab', updatedAt: now };
      }
    } catch {}
  }

  return { id, posts: null, following: null, followers: null, likes: null, source: 'unknown', updatedAt: now };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = (searchParams.get('id') || '10849915').trim();
  try {
    const stats = await crawlHoyolabStats(id);
    const ok = [stats.posts, stats.following, stats.followers, stats.likes].some(v => v !== null);
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to crawl HoYoLAB';
    const res = NextResponse.json({ error: message }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


