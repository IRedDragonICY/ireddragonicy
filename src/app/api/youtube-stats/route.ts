import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type YouTubeStats = {
  channel: string;
  subscribers: number | null;
  videos: number | null;
  views: number | null;
  source: 'youtube' | 'youtube-text' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase().trim();
    // Support: 1.6k, 1.6 m, 1.6b, 1,124,985, 7.111
    // Also support Indonesian suffixes: rb (ribu, thousand), jt (juta, million), milyar/miliar (billion)
    const m = lower.match(/(\d{1,3}(?:[\s.,]\d{3})+|\d+(?:[\.,]\d+)?)[\s]*([kmbt]|rb|jt|milyar|miliar|billion|million|thousand)?/i);
    if (m) {
      const valueRaw = m[1];
      const suffix = (m[2] || '').toLowerCase();

      if (suffix) {
        // Keep decimal dot; convert comma to dot. Do NOT strip dots here.
        const numeric = parseFloat(valueRaw.replace(/,/g, '.').replace(/\s/g, ''));
        if (Number.isNaN(numeric)) return null;
        let multiplier = 1;
        if (suffix === 'k' || suffix === 'rb' || suffix === 'thousand') multiplier = 1_000;
        else if (suffix === 'm' || suffix === 'jt' || suffix === 'million') multiplier = 1_000_000;
        else if (suffix === 'b' || suffix === 'milyar' || suffix === 'miliar' || suffix === 'billion') multiplier = 1_000_000_000;
        else if (suffix === 't') multiplier = 1_000_000_000_000;
        return Math.round(numeric * multiplier);
      }

      // No compact suffix: treat as a plain integer with thousand separators
      const digitsOnly = valueRaw.replace(/[^\d]/g, '');
      if (!digitsOnly) return null;
      return parseInt(digitsOnly, 10);
    }

    // Fallback: strip everything but digits
    const digits = input.replace(/[^\d]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  } catch {
    return null;
  }
}

function extractCounts(text: string): { subscribers: number | null; videos: number | null; views: number | null } {
  type Collected = { value: number; compact: boolean };

  // Helper to scan a given scope of text
  const scan = (scope: string) => {
    const out: { subs: Collected[]; vids: Collected[]; views: Collected[] } = { subs: [], vids: [], views: [] };
    const pushMaybe = (arr: Collected[], str?: string) => {
      if (!str) return;
      const num = parseCompactNumber(str);
      if (typeof num === 'number') {
        const compact = /(?:\b|\s)(k|m|b|t|rb|jt|milyar|miliar|billion|million|thousand)\b/i.test(str);
        arr.push({ value: num, compact });
      }
    };

    // 1) Plain text around labels
    for (const m of scope.matchAll(/([\d\s\.,kmbjt]+)\s*subscribers(?!\w)/gi)) pushMaybe(out.subs, m[1]);
    for (const m of scope.matchAll(/([\d\s\.,kmbjt]+)\s*videos(?!\w)/gi)) pushMaybe(out.vids, m[1]);
    for (const m of scope.matchAll(/([\d\s\.,kmbjt]+)\s*views(?!\w)/gi)) pushMaybe(out.views, m[1]);

    // 2) JSON variants
    for (const m of scope.matchAll(/subscriberCountText\"?\s*:\s*\{[^}]*?simpleText\"?\s*:\s*\"([^\"]+?)\"/gi)) pushMaybe(out.subs, (m[1] || '').replace(/[^\d\.,kmbjtrb\s]/gi, ''));
    for (const m of scope.matchAll(/subscriberCountText[\s\S]*?\{\s*\"runs\"\s*:\s*\[\s*\{\s*\"text\"\s*:\s*\"([^\"]+?)\"/gi)) pushMaybe(out.subs, m[1]);
    for (const m of scope.matchAll(/videoCountText[\s\S]*?simpleText\"?\s*:\s*\"([^\"]+?)\"/gi)) pushMaybe(out.vids, (m[1] || '').replace(/[^\d\.,kmbjtrb\s]/gi, ''));
    for (const m of scope.matchAll(/videoCountText[\s\S]*?\{\s*\"runs\"\s*:\s*\[\s*\{\s*\"text\"\s*:\s*\"([^\"]+?)\"/gi)) pushMaybe(out.vids, m[1]);
    for (const m of scope.matchAll(/viewCountText[\s\S]*?simpleText\"?\s*:\s*\"([^\"]+?)\"/gi)) pushMaybe(out.views, (m[1] || '').replace(/[^\d\.,kmbjtrb\s]/gi, ''));
    for (const m of scope.matchAll(/viewCountText[\s\S]*?\{\s*\"runs\"\s*:\s*\[\s*\{\s*\"text\"\s*:\s*\"([^\"]+?)\"/gi)) pushMaybe(out.views, m[1]);
    return out;
  };

  // Try to narrow to the About section to avoid unrelated snippets
  let scope = text;
  try {
    const lower = text.toLowerCase();
    const start = lower.indexOf('id="about-container"');
    if (start !== -1) {
      let end = lower.indexOf('id="button-container"', start);
      if (end === -1) end = lower.indexOf('id="additional-info-container"', start);
      if (end === -1) end = Math.min(text.length, start + 15000);
      scope = text.slice(start, end);
    }
  } catch {}

  const primary = scan(scope);
  const fallback = scope === text ? primary : scan(text);

  const pickFirst = (arr: Collected[]): number | null => (arr.length ? arr[0].value : null);
  const pickMax = (arr: Collected[]): number | null => (arr.length ? Math.max(...arr.map(a => a.value)) : null);
  const pickPreferExact = (primaryArr: Collected[], fallbackArr: Collected[]): number | null => {
    const pExact = primaryArr.find(a => !a.compact);
    if (pExact) return pExact.value;
    const fExact = fallbackArr.find(a => !a.compact);
    if (fExact) return fExact.value;
    const pAny = pickFirst(primaryArr);
    if (pAny !== null) return pAny;
    return pickFirst(fallbackArr);
  };
  const pickMaxExactAcrossElseMax = (primaryArr: Collected[], fallbackArr: Collected[]): number | null => {
    const exact = [...primaryArr, ...fallbackArr].filter(a => !a.compact);
    if (exact.length) return Math.max(...exact.map(a => a.value));
    return pickMax([...primaryArr, ...fallbackArr]);
  };

  const subscribers = pickPreferExact(primary.subs, fallback.subs) ?? pickMax(primary.subs);
  const videos = pickMaxExactAcrossElseMax(primary.vids, fallback.vids);
  // Views: keep earlier behavior — global maximum across page
  const views = pickMax(fallback.views);
  return { subscribers, videos, views };
}

async function fetchText(url: string, ua?: 'bot' | 'default'): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': ua === 'bot' ? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.text();
}

async function crawlYouTubeStats(channel: string): Promise<YouTubeStats> {
  const now = new Date().toISOString();

  // Build candidate paths: try provided path, then attempt resolving @handle from the channel page
  const candidatePaths = new Set<string>([channel.replace(/^\//, '')]);
  try {
    // Try to resolve @handle from channel page via text-mode to avoid JS
    const probe = await fetchText(`https://r.jina.ai/http://www.youtube.com/${channel.replace(/^\//, '')}`);
    const handleMatch = probe.match(/(^|\s)@([A-Za-z0-9._-]{3,64})/);
    if (handleMatch) {
      candidatePaths.add(`@${handleMatch[2]}`);
    }
  } catch {}

  // Attempt for each candidate: text-mode then direct HTML with bot UA
  for (const path of candidatePaths) {
    const textTargets = [
      `https://r.jina.ai/http://www.youtube.com/${path}/about`,
      `https://r.jina.ai/http://www.youtube.com/${path}`,
      `https://r.jina.ai/http://youtube.com/${path}`,
    ];
    for (const url of textTargets) {
      try {
        const text = await fetchText(url, 'default');
        const { subscribers, videos, views } = extractCounts(text);
        if (subscribers !== null || videos !== null || views !== null) {
          return { channel: path, subscribers, videos, views, source: 'youtube-text', updatedAt: now };
        }
      } catch {}
    }

    const directTargets = [
      `https://www.youtube.com/${path}/about`,
      `https://www.youtube.com/${path}`,
      `https://youtube.com/${path}`,
    ];
    for (const url of directTargets) {
      try {
        const html = await fetchText(url, 'bot');
        const { subscribers, videos, views } = extractCounts(html);
        if (subscribers !== null || videos !== null || views !== null) {
          return { channel: path, subscribers, videos, views, source: 'youtube', updatedAt: now };
        }
      } catch {}
    }
  }

  return { channel, subscribers: null, videos: null, views: null, source: 'unknown', updatedAt: now };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // support ?c=channel/<id> or @handle
  const channel = (searchParams.get('c') || searchParams.get('channel') || 'channel/UCb-5o4_6ci9QCW2dHgasLEg').replace(/^\//, '');
  try {
    const stats = await crawlYouTubeStats(channel);
    const ok = stats.subscribers !== null || stats.videos !== null;
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to crawl YouTube';
    const res = NextResponse.json({ error: message }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


