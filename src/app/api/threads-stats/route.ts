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
  // Normalize exotic spaces and bullets
  const normalized = text
    .replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\u2060]/g, ' ')
    .replace(/[•·]/g, ' ');

  // Visible labels (EN + ID)
  const labelFirst = normalized.match(/\bfollowers\b\s*[:\-]?\s*(\d[\d\s\.,kmb]*)/i) || normalized.match(/\bpengikut\b\s*[:\-]?\s*(\d[\d\s\.,kmb]*)/i);
  if (labelFirst) {
    const n = parseCompactNumber(labelFirst[1]);
    if (typeof n === 'number') return n;
  }
  const numberFirst = normalized.match(/(\d[\d\s\.,kmb]*)\s*(followers|pengikut)(?!\w)/i);
  if (numberFirst) {
    const n = parseCompactNumber(numberFirst[1]);
    if (typeof n === 'number') return n;
  }

  // JSON-like keys
  const jsonKeys = [
    /"followers_count"\s*:\s*"?(\d[\d\s\.,kmb]*)"?/i,
    /"followersCount"\s*:\s*"?(\d[\d\s\.,kmb]*)"?/i,
    /"follower_count"\s*:\s*"?(\d[\d\s\.,kmb]*)"?/i,
    /\bfollowers\b\s*[:=]\s*"?(\d[\d\s\.,kmb]*)"?/i,
  ];
  for (const re of jsonKeys) {
    const m = normalized.match(re);
    if (m) {
      const n = parseCompactNumber(m[1]);
      if (typeof n === 'number') return n;
    }
  }

  // og:description style
  const og = normalized.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  if (og && og[1]) {
    const n1 = extractFollowers(og[1]);
    if (typeof n1 === 'number') return n1;
  }

  return null;
}

const defaultUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const botUA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

async function fetchText(url: string, userAgent: string = defaultUA): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': userAgent,
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

async function fetchTextWithRetry(url: string, userAgents: string[] = [defaultUA, botUA], attempts: number = 4): Promise<string> {
  let error: unknown;
  // round-robin UA per attempt
  for (let i = 0; i < attempts; i++) {
    const ua = userAgents[i % userAgents.length];
    try {
      return await fetchText(url, ua);
    } catch (e: unknown) {
      error = e;
      const backoffMs = 300 * Math.pow(2, i); // 300, 600, 1200, 2400
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  throw error || new Error(`Failed to fetch after ${attempts} attempts: ${url}`);
}

async function crawlThreadsStats(username: string): Promise<ThreadsStats> {
  const nowIso = new Date().toISOString();

  // Candidate URLs (text-mode proxies + direct) with language hints
  const candidates = [
    `https://r.jina.ai/http://www.threads.net/@${username}`,
    `https://r.jina.ai/http://www.threads.net/@${username}?hl=en`,
    `https://r.jina.ai/http://threads.net/@${username}`,
    `https://r.jina.ai/http://threads.net/@${username}?hl=en`,
    `https://www.threads.net/@${username}`,
    `https://www.threads.net/@${username}?hl=en`,
  ];

  for (const url of candidates) {
    try {
      const text = await fetchTextWithRetry(url, [defaultUA, botUA]);
      const followers = extractFollowers(text);
      if (followers !== null) {
        const source: ThreadsStats['source'] = url.includes('r.jina.ai') ? 'threads-text' : 'threads';
        return { username, followers, source, updatedAt: nowIso };
      }
    } catch {}
  }

  // Optional headless fallback: read og:description on rendered page (if allowed)
  try {
    if (process.env.ALLOW_PUPPETEER_THREADS === '1') {
      const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let puppeteer: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let launchOptions: any = { headless: true };

      if (isVercel) {
        const chromium = (await import('@sparticuz/chromium')).default;
        chromium.setHeadlessMode = true;
        chromium.setGraphicsMode = false;
        puppeteer = await import('puppeteer-core');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p: any = (puppeteer as any).default || puppeteer;
        launchOptions = {
          ...launchOptions,
          args: [...chromium.args, '--lang=en-US,en'],
          executablePath: await chromium.executablePath(),
          defaultViewport: { width: 1200, height: 900 },
        };
        puppeteer = p;
      } else {
        puppeteer = await import('puppeteer');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        puppeteer = (puppeteer as any).default || puppeteer;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const browser = await (puppeteer as any).launch(launchOptions);
      const page = await browser.newPage();
      await page.setUserAgent(defaultUA);
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
      await page.goto(`https://www.threads.net/@${username}?hl=en`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Try to read meta first; Threads often blocks DOM for anon
      const meta = await page.evaluate(() => {
        const m = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
        return m?.content || '';
      });
      await browser.close();
      const followers = extractFollowers(meta || '');
      if (followers !== null) {
        return { username, followers, source: 'threads', updatedAt: nowIso };
      }
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
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to crawl Threads stats';
    const res = NextResponse.json(
      { error: message, username },
      { status: 500 },
    );
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


