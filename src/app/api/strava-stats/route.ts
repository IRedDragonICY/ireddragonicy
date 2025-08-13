import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type StravaStats = {
  id: string;
  followers: number | null;
  following: number | null;
  distanceKm: number | null; // current month
  movingTime: string | null; // HH:MM:SS, current month
  movingTimeSeconds: number | null;
  source: 'strava' | 'strava-text' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase().trim();
    const m = lower.match(/(\d{1,3}(?:[\s.,]\d{3})+|\d+(?:[\.,]\d+)?)[\s]*([km])?/i);
    if (m) {
      const valueRaw = m[1];
      const suffix = (m[2] || '').toLowerCase();
      if (suffix) {
        const numeric = parseFloat(valueRaw.replace(/,/g, '.').replace(/\s/g, ''));
        if (Number.isNaN(numeric)) return null;
        const multiplier = suffix === 'k' ? 1_000 : 1_000_000;
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

function parseDistanceKm(text: string): number | null {
  try {
    const m = text.match(/([\d.,]+)\s*(km|mi)\b/i);
    if (!m) return null;
    const value = parseFloat(m[1].replace(/,/g, '.'));
    if (Number.isNaN(value)) return null;
    const unit = m[2].toLowerCase();
    if (unit === 'km') return value;
    if (unit === 'mi') return Math.round(value * 1.60934 * 1000) / 1000;
    return null;
  } catch {
    return null;
  }
}

function parseDurationToSeconds(text: string): number | null {
  // Formats like 25:20:31 or 5:23
  const parts = text.trim().split(':').map(p => p.trim());
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map(p => parseInt(p, 10));
  if (nums.some(n => Number.isNaN(n))) return null;
  let seconds = 0;
  if (nums.length === 3) seconds = nums[0] * 3600 + nums[1] * 60 + nums[2];
  else seconds = nums[0] * 60 + nums[1];
  return seconds;
}

function extractCounts(html: string): { followers: number | null; following: number | null; distanceKm: number | null; movingTime: string | null; movingTimeSeconds: number | null } {
  const normalized = html.replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\u2060]/g, ' ');

  // Followers
  const followersMatch = normalized.match(/data-testid=["']details-stat-followers["'][\s\S]{0,400}?Stat_statValue[^>]*>([^<]+)/i);
  const followers = followersMatch ? parseCompactNumber(followersMatch[1]) : null;

  // Following
  const followingMatch = normalized.match(/data-testid=["']details-stat-following["'][\s\S]{0,400}?Stat_statValue[^>]*>([^<]+)/i);
  const following = followingMatch ? parseCompactNumber(followingMatch[1]) : null;

  // Current month distance and moving time
  // Restrict scope to monthly-stats section
  let monthScope = '';
  const monthlyStart = normalized.search(/data-testid=["']monthly-stats["']/i);
  if (monthlyStart !== -1) {
    monthScope = normalized.slice(monthlyStart, Math.min(normalized.length, monthlyStart + 8000));
  }

  const distanceMatch = monthScope.match(/data-cy=["']monthly-stat-distance["'][\s\S]{0,300}?Stat_statValue[^>]*>([^<]+)/i);
  const distanceKm = distanceMatch ? parseDistanceKm(distanceMatch[1]) : null;

  const timeMatch = monthScope.match(/data-cy=["']monthly-stat-time["'][\s\S]{0,300}?Stat_statValue[^>]*>([^<]+)/i);
  const movingTime = timeMatch ? timeMatch[1].trim() : null;
  const movingTimeSeconds = movingTime ? parseDurationToSeconds(movingTime) : null;

  return { followers, following, distanceKm, movingTime, movingTimeSeconds };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.text();
}

async function crawlStravaStats(id: string): Promise<StravaStats> {
  const now = new Date().toISOString();
  const paths = [
    `https://www.strava.com/athletes/${id}`,
  ];

  // 1) Text-mode via r.jina.ai
  for (const url of paths) {
    try {
      const text = await fetchText(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`);
      const { followers, following, distanceKm, movingTime, movingTimeSeconds } = extractCounts(text);
      if ([followers, following, distanceKm, movingTime].some(v => v !== null)) {
        return { id, followers, following, distanceKm, movingTime, movingTimeSeconds, source: 'strava-text', updatedAt: now };
      }
    } catch {}
  }

  // 2) Direct HTML
  for (const url of paths) {
    try {
      const html = await fetchText(url);
      const { followers, following, distanceKm, movingTime, movingTimeSeconds } = extractCounts(html);
      if ([followers, following, distanceKm, movingTime].some(v => v !== null)) {
        return { id, followers, following, distanceKm, movingTime, movingTimeSeconds, source: 'strava', updatedAt: now };
      }
    } catch {}
  }

  return { id, followers: null, following: null, distanceKm: null, movingTime: null, movingTimeSeconds: null, source: 'unknown', updatedAt: now };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = (searchParams.get('id') || searchParams.get('athlete') || '164295314').trim();
  try {
    const stats = await crawlStravaStats(id);
    const ok = [stats.followers, stats.following, stats.distanceKm, stats.movingTime].some(v => v !== null);
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Failed to crawl Strava' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}



