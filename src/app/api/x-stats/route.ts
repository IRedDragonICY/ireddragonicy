import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type XStats = {
  username: string;
  followers: number | null;
  following: number | null;
  posts?: number | null;
  source: 'mobile-x' | 'nitter' | 'twimg' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase();
    const suffixMatch = lower.match(/([km])/);
    const hasSuffix = Boolean(suffixMatch);
    if (hasSuffix) {
      const valueMatch = lower.match(/(\d+(?:[\.,]\d+)?)/);
      if (!valueMatch) return null;
      const numeric = parseFloat(valueMatch[1].replace(',', '.'));
      if (Number.isNaN(numeric)) return null;
      const suffix = suffixMatch![1];
      const multiplier = suffix === 'k' ? 1_000 : 1_000_000;
      return Math.round(numeric * multiplier);
    }
    // No suffix: strip all non-digits
    const digits = input.replace(/[^\d]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  } catch {
    return null;
  }
}

function extractCountsFromText(text: string): { followers: number | null; following: number | null; posts: number | null } {
  // Normalize exotic spaces and separators
  const normalized = text
    .replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\u2060]/g, ' ')
    .replace(/[•·]/g, ' ');

  // Try patterns like: "14 Following", "3,014 Followers" (number-first)
  // and label-first variants like: "Following 14", "Followers 3,014"
  const followingMatch =
    normalized.match(/(\d[\d\s\.,]*?)\s*Following(?!\w)/i) ||
    normalized.match(/Following(?!\w)\s*[:\-]?\s*(\d[\d\s\.,]*)/i);
  const followersMatch =
    normalized.match(/(\d[\d\s\.,]*?)\s*Followers(?!\w)/i) ||
    normalized.match(/Followers(?!\w)\s*[:\-]?\s*(\d[\d\s\.,]*)/i);

  // Posts can appear in two orders: number-first or label-first.
  // Prefer thousand-grouped forms to avoid false positives (e.g., capturing '2' from unrelated text).
  let postsMatch: RegExpMatchArray | null =
    normalized.match(/\b(\d{1,3}(?:[\.,]\d{3})+)\s*post(?:s)?\b/i) ||
    normalized.match(/\b(\d{1,3}(?:[\.,]\d{3})+)\s*tweets?\b/i) ||
    normalized.match(/\b(\d{1,3}(?:[\.,]\d{3})+)\s*statuses?\b/i);

  if (!postsMatch) {
    postsMatch =
      normalized.match(/\bpost(?:s)?\s*(\d{1,3}(?:[\.,]\d{3})+)\b/i) ||
      normalized.match(/\btweets?\s*(\d{1,3}(?:[\.,]\d{3})+)\b/i) ||
      normalized.match(/\bstatuses?\s*(\d{1,3}(?:[\.,]\d{3})+)\b/i);
  }

  // If still not found, accept compact K/M formats next
  if (!postsMatch) {
    postsMatch =
      normalized.match(/\b(\d+(?:[\.,]\d+)?)\s*[km]\s*post(?:s)?\b/i) ||
      normalized.match(/\bpost(?:s)?\s*(\d+(?:[\.,]\d+)?)\s*[km]\b/i) ||
      normalized.match(/\b(\d+(?:[\.,]\d+)?)\s*[km]\s*tweets?\b/i) ||
      normalized.match(/\btweets?\s*(\d+(?:[\.,]\d+)?)\s*[km]\b/i) ||
      normalized.match(/\b(\d+(?:[\.,]\d+)?)\s*[km]\s*statuses?\b/i) ||
      normalized.match(/\bstatuses?\s*(\d+(?:[\.,]\d+)?)\s*[km]\b/i);
  }

  const following = followingMatch ? parseCompactNumber(followingMatch[1]) : null;
  const followers = followersMatch ? parseCompactNumber(followersMatch[1]) : null;
  const posts = postsMatch ? parseCompactNumber(postsMatch[1]) : null;
  return { followers, following, posts };
}

async function fetchText(url: string, userAgent?: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
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

async function crawlXStats(username: string): Promise<XStats> {
  const nowIso = new Date().toISOString();

  // Strategy: Nitter only (requested). Prefer text-mode proxy, then direct.
  try {
    const text = await fetchText(`https://r.jina.ai/http://nitter.net/${username}`);
    const extracted = extractCountsFromText(text);
    if (extracted.followers !== null || extracted.following !== null || extracted.posts !== null) {
      return {
        username,
        followers: extracted.followers,
        following: extracted.following,
        posts: extracted.posts,
        source: 'nitter',
        updatedAt: nowIso,
      };
    }
  } catch {}

  try {
    const html = await fetchText(`https://nitter.net/${username}`);
    // Some Nitter instances present numbers within title attributes; append those to text for parsing
    const titleNums: string[] = [];
    html.replace(/title=["'](\d[\d\.,]*)["']/gi, (_, g1) => {
      titleNums.push(g1);
      return '';
    });
    const htmlPlus = titleNums.length ? `${html}\n${titleNums.join(' ')}` : html;
    const extracted = extractCountsFromText(htmlPlus);
    if (extracted.followers !== null || extracted.following !== null || extracted.posts !== null) {
      return {
        username,
        followers: extracted.followers,
        following: extracted.following,
        posts: extracted.posts,
        source: 'nitter',
        updatedAt: nowIso,
      };
    }
  } catch {}

  return { username, followers: null, following: null, posts: null, source: 'unknown', updatedAt: nowIso };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || searchParams.get('username') || 'ireddragonicy').replace(/^@/, '');

  try {
    const stats = await crawlXStats(username);
    const ok = stats.followers !== null || stats.following !== null || (typeof stats.posts === 'number' && stats.posts !== null);
    const res = NextResponse.json(stats, {
      status: ok ? 200 : 502,
    });
    // Avoid returning stale data (user requested nitter-only fresh values)
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err: any) {
    const res = NextResponse.json(
      { error: err?.message || 'Failed to crawl X stats', username },
      { status: 500 },
    );
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


