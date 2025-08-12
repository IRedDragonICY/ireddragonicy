import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type PinterestStats = {
  username: string;
  followers: number | null;
  following: number | null;
  source: 'pinterest' | 'pinterest-text' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase().trim();
    // Support: k, m, and Indonesian rb (ribu), jt (juta)
    const suffixMatch = lower.match(/(\d+(?:[\.,]\d+)?)\s*(k|m|rb|jt)/);
    if (suffixMatch) {
      const numeric = parseFloat(suffixMatch[1].replace(',', '.'));
      if (Number.isNaN(numeric)) return null;
      const suffix = suffixMatch[2];
      let multiplier = 1;
      if (suffix === 'k' || suffix === 'rb') multiplier = 1_000;
      else if (suffix === 'm' || suffix === 'jt') multiplier = 1_000_000;
      return Math.round(numeric * multiplier);
    }
    const valueMatch = lower.match(/(\d+(?:[\.,]\d+)?)/);
    if (!valueMatch) return null;
    const digitsOnly = valueMatch[1].replace(/[\.,\s]/g, '');
    if (!digitsOnly) return null;
    return parseInt(digitsOnly, 10);
  } catch {
    return null;
  }
}

function extractCounts(text: string): { followers: number | null; following: number | null } {
  // Normalize special spaces that often appear in SSR text snapshots
  const normalized = text.replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\u2060]/g, ' ');

  // 1) Obvious visual strings rendered on profile: "20 followers", "0 following"
  const followersMatch =
    normalized.match(/([\d\s\.,]+)\s*followers(?!\w)/i) ||
    normalized.match(/([\d\s\.,]+)\s*pengikut(?!\w)/i);
  const followingMatch =
    normalized.match(/([\d\s\.,]+)\s*following(?!\w)/i) ||
    normalized.match(/([\d\s\.,]+)\s*mengikuti(?!\w)/i);
  let followers = followersMatch ? parseCompactNumber(followersMatch[1]) : null;
  let following = followingMatch ? parseCompactNumber(followingMatch[1]) : null;

  // 2) Fallbacks: meta tags sometimes include followers count
  if (followers === null) {
    const metaFollowers = normalized.match(/<meta[^>]+pinterestapp:followers[^>]+content=["'](\d+[\d\.,]*)["'][^>]*>/i);
    if (metaFollowers) followers = parseCompactNumber(metaFollowers[1]);
  }

  // 3) Fallbacks: JSON bootstrap (e.g., __PWS_DATA__) frequently contains *_count fields
  // Look for any of these keys and grab a number right after the colon
  const numberPattern = "([0-9]{1,3}(?:[\.,][0-9]{3})+|[0-9]+(?:[\.,][0-9]+)?(?:\s*[km])?)";
  if (followers === null) {
    const jsonFollowersPatterns = [
      new RegExp(`"followers_count"\s*:\s*"?${numberPattern}"?`, 'i'),
      new RegExp(`"follower_count"\s*:\s*"?${numberPattern}"?`, 'i'),
      new RegExp(`"followers"\s*:\s*"?${numberPattern}"?`, 'i'),
      new RegExp(`"totalFollowers"\s*:\s*"?${numberPattern}"?`, 'i'),
    ];
    for (const re of jsonFollowersPatterns) {
      const m = normalized.match(re);
      if (m) {
        followers = parseCompactNumber(m[1]);
        if (followers !== null) break;
      }
    }
  }

  if (following === null) {
    const jsonFollowingPatterns = [
      new RegExp(`"following_count"\s*:\s*"?${numberPattern}"?`, 'i'),
      new RegExp(`"following"\s*:\s*"?${numberPattern}"?`, 'i'),
    ];
    for (const re of jsonFollowingPatterns) {
      const m = normalized.match(re);
      if (m) {
        following = parseCompactNumber(m[1]);
        if (following !== null) break;
      }
    }
  }

  return { followers, following };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.text();
}

async function crawlPinterestStats(username: string): Promise<PinterestStats> {
  const now = new Date().toISOString();

  // 1) Text-mode via r.jina.ai
  for (const host of ['www.pinterest.com', 'pinterest.com', 'id.pinterest.com']) {
    try {
      const text = await fetchText(`https://r.jina.ai/http://${host}/${username}/`);
      const { followers, following } = extractCounts(text);
      if (followers !== null || following !== null) {
        return { username, followers, following, source: 'pinterest-text', updatedAt: now };
      }
    } catch {}
  }

  // 1b) Try a couple of common subpages that sometimes include visible counts
  for (const host of ['www.pinterest.com', 'pinterest.com', 'id.pinterest.com']) {
    for (const sub of ['', 'about', '_followers', '_following']) {
      try {
        const text = await fetchText(`https://r.jina.ai/http://${host}/${username}/${sub ? sub + '/' : ''}`);
        const { followers, following } = extractCounts(text);
        if (followers !== null || following !== null) {
          return { username, followers, following, source: 'pinterest-text', updatedAt: now };
        }
      } catch {}
    }
  }

  // 2) Direct HTML (may be JS-heavy; still try as last resort)
  for (const host of ['https://www.pinterest.com', 'https://id.pinterest.com']) {
    try {
      const html = await fetchText(`${host}/${username}/`);
      const { followers, following } = extractCounts(html);
      if (followers !== null || following !== null) {
        return { username, followers, following, source: 'pinterest', updatedAt: now };
      }
    } catch {}
  }

  return { username, followers: null, following: null, source: 'unknown', updatedAt: now };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || searchParams.get('username') || 'IRedDragonICY').replace(/^@/, '');
  try {
    const stats = await crawlPinterestStats(username);
    const ok = stats.followers !== null || stats.following !== null;
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Failed to crawl Pinterest' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


