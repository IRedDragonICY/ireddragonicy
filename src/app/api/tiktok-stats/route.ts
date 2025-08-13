import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type TikTokStats = {
  username: string;
  followers: number | null;
  following: number | null;
  likes: number | null;
  source: 'tiktok-puppeteer' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string | null | undefined): number | null {
  try {
    if (!input) return null;
    const lower = input.toLowerCase().trim();
    // Supports formats like 2,345 · 1.2k · 3.4m · 1.2b
    const m = lower.match(/(\d{1,3}(?:[\.,]\d{3})+|\d+(?:[\.,]\d+)?)(?:\s*([kmb]))?/i);
    if (!m) return null;
    const raw = m[1].replace(/[,\s]/g, '.');
    let value = parseFloat(raw);
    if (Number.isNaN(value)) return null;
    const suffix = m[2]?.toLowerCase();
    if (suffix === 'k') value *= 1_000;
    else if (suffix === 'm') value *= 1_000_000;
    else if (suffix === 'b') value *= 1_000_000_000;
    return Math.round(value);
  } catch {
    return null;
  }
}

async function crawlTikTokStats(username: string): Promise<TikTokStats> {
  const now = new Date().toISOString();

  try {
    const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
    let puppeteer: any;
    let browser: any;
    let launchOptions: any = { headless: true };

    if (isVercel) {
      const chromium = (await import('@sparticuz/chromium')).default;
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;
      puppeteer = await import('puppeteer-core');
      const p: any = (puppeteer as any).default || puppeteer;
      launchOptions = {
        ...launchOptions,
        args: [...chromium.args, '--lang=en-US,en'],
        executablePath: await chromium.executablePath(),
        defaultViewport: { width: 1280, height: 900 },
      };
      puppeteer = p;
    } else {
      puppeteer = await import('puppeteer');
      puppeteer = (puppeteer as any).default || puppeteer;
    }

    browser = await (puppeteer as any).launch(launchOptions);
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto(`https://www.tiktok.com/@${username}?lang=en`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Try to wait for the header counts to be present
    await page
      .waitForSelector('strong[data-e2e="followers-count"], strong[data-e2e="following-count"], strong[data-e2e="likes-count"]', {
        timeout: 20000,
      })
      .catch(() => undefined);

    // Extract counts
    const raw = await page.evaluate(() => {
      const pick = (sel: string) => (document.querySelector(sel)?.textContent || '').trim();
      const followers = pick('strong[data-e2e="followers-count"]');
      const following = pick('strong[data-e2e="following-count"]');
      const likes = pick('strong[data-e2e="likes-count"]');

      // Fallback: try to find within the h3 container with units
      const container = document.querySelector('h3 [data-e2e="followers"], h3 [data-e2e="following"], h3 [data-e2e="likes"]')
        ?.closest('h3') || document.querySelector('h3');
      const text = container ? (container.textContent || '').trim() : '';
      return { followers, following, likes, text };
    });

    await browser.close();

    // Parse values from either direct data-e2e or fallback text
    let followers = parseCompactNumber(raw.followers);
    let following = parseCompactNumber(raw.following);
    let likes = parseCompactNumber(raw.likes);

    if (followers === null || following === null || likes === null) {
      const t = raw.text || '';
      const f1 = t.match(/followers\D*(\d[\d\.,kmb]*)/i) || t.match(/(\d[\d\.,kmb]*)\D*followers/i);
      const f2 = t.match(/following\D*(\d[\d\.,kmb]*)/i) || t.match(/(\d[\d\.,kmb]*)\D*following/i);
      const f3 = t.match(/likes\D*(\d[\d\.,kmb]*)/i) || t.match(/(\d[\d\.,kmb]*)\D*likes/i);
      if (followers === null && f1) followers = parseCompactNumber(f1[1]);
      if (following === null && f2) following = parseCompactNumber(f2[1]);
      if (likes === null && f3) likes = parseCompactNumber(f3[1]);
    }

    return { username, followers, following, likes, source: 'tiktok-puppeteer', updatedAt: now };
  } catch (err) {
    return { username, followers: null, following: null, likes: null, source: 'unknown', updatedAt: now };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || searchParams.get('username') || 'ireddragonicy').replace(/^@/, '');
  try {
    const stats = await crawlTikTokStats(username);
    const ok = stats.followers !== null || stats.following !== null || stats.likes !== null;
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Failed to crawl TikTok' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


