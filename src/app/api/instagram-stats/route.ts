import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // allow headless startup on serverless

type InstagramStats = {
  username: string;
  posts: number | null;
  followers: number | null;
  following: number | null;
  source: 'instagram' | 'instagram-text' | 'unknown' | null;
  updatedAt: string;
};

function parseCompactNumber(input: string): number | null {
  try {
    const lower = input.toLowerCase().trim();
    // Support compact English and Indonesian forms (k/m, rb/jt)
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
    const digitsOnly = lower.replace(/[^0-9]/g, '');
    if (!digitsOnly) return null;
    return parseInt(digitsOnly, 10);
  } catch {
    return null;
  }
}

function extractCounts(text: string): { posts: number | null; followers: number | null; following: number | null } {
  // Normalize NBSP and similar spaces
  const normalized = text.replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\u2060]/g, ' ');

  // 1) Direct visible strings (English + Indonesian variants)
  const postsMatch =
    normalized.match(/(\d[\d\s\.,]*)\s*posts?(?!\w)/i) ||
    normalized.match(/(\d[\d\s\.,]*)\s*(kiriman|postingan)/i);
  const followersMatch =
    normalized.match(/(\d[\d\s\.,]*)\s*followers(?!\w)/i) ||
    normalized.match(/(\d[\d\s\.,]*)\s*pengikut(?!\w)/i);
  const followingMatch =
    normalized.match(/(\d[\d\s\.,]*)\s*following(?!\w)/i) ||
    normalized.match(/(\d[\d\s\.,]*)\s*mengikuti(?!\w)/i);

  let posts = postsMatch ? parseCompactNumber(postsMatch[1]) : null;
  let followers = followersMatch ? parseCompactNumber(followersMatch[1]) : null;
  let following = followingMatch ? parseCompactNumber(followingMatch[1]) : null;

  // 2) Attribute-based fallbacks: title="1,807" followers
  if (followers === null) {
    const titleFollowers = normalized.match(/title=["'](\d[\d\s\.,]*)["'][^>]{0,120}?followers/i);
    if (titleFollowers) followers = parseCompactNumber(titleFollowers[1]);
  }
  if (following === null) {
    const titleFollowing = normalized.match(/title=["'](\d[\d\s\.,]*)["'][^>]{0,120}?following/i);
    if (titleFollowing) following = parseCompactNumber(titleFollowing[1]);
  }

  // 3) JSON bootstrap fallbacks present in HTML sometimes
  if (followers === null || following === null || posts === null) {
    // Common keys from legacy/shared data and web profile info
    const jsonNumber = '(?:[0-9]{1,3}(?:[\.,][0-9]{3})+|[0-9]+(?:[\.,][0-9]+)?(?:\s*[km])?)';
    if (followers === null) {
      const m =
        normalized.match(new RegExp(`"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*("?${jsonNumber}"?)`, 'i')) ||
        normalized.match(new RegExp(`"followers(?:_count|Count)?"\s*:\s*"?${jsonNumber}"?`, 'i'));
      if (m) followers = parseCompactNumber(m[1]);
    }
    if (following === null) {
      const m =
        normalized.match(new RegExp(`"edge_follow"\s*:\s*\{\s*"count"\s*:\s*("?${jsonNumber}"?)`, 'i')) ||
        normalized.match(new RegExp(`"following(?:_count|Count)?"\s*:\s*"?${jsonNumber}"?`, 'i'));
      if (m) following = parseCompactNumber(m[1]);
    }
    if (posts === null) {
      const m =
        normalized.match(new RegExp(`"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*("?${jsonNumber}"?)`, 'i')) ||
        normalized.match(new RegExp(`"posts"\s*:\s*"?${jsonNumber}"?`, 'i'));
      if (m) posts = parseCompactNumber(m[1]);
    }
  }

  return { posts, followers, following };
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

async function crawlInstagramStats(username: string): Promise<InstagramStats> {
  const now = new Date().toISOString();

  // 1) Text-mode via r.jina.ai (bypass JS)
  for (const host of ['www.instagram.com', 'instagram.com', 'm.instagram.com']) {
    try {
      const text = await fetchText(`https://r.jina.ai/http://${host}/${username}/`);
      const { posts, followers, following } = extractCounts(text);
      if (posts !== null || followers !== null || following !== null) {
        return { username, posts, followers, following, source: 'instagram-text', updatedAt: now };
      }
    } catch {}
  }

  // 1b) Try with language hint to coax English labels
  for (const host of ['www.instagram.com', 'instagram.com', 'm.instagram.com']) {
    try {
      const text = await fetchText(`https://r.jina.ai/http://${host}/${username}/?hl=en`);
      const { posts, followers, following } = extractCounts(text);
      if (posts !== null || followers !== null || following !== null) {
        return { username, posts, followers, following, source: 'instagram-text', updatedAt: now };
      }
    } catch {}
  }

  // 2) Direct HTML
  for (const host of ['https://www.instagram.com', 'https://instagram.com', 'https://m.instagram.com']) {
    try {
      const html = await fetchText(`${host}/${username}/`);
      const { posts, followers, following } = extractCounts(html);
      if (posts !== null || followers !== null || following !== null) {
        return { username, posts, followers, following, source: 'instagram', updatedAt: now };
      }
    } catch {}
  }

  // 2b) Direct HTML with language hint (some regions localize labels)
  for (const host of ['https://www.instagram.com', 'https://instagram.com', 'https://m.instagram.com']) {
    try {
      const html = await fetchText(`${host}/${username}/?hl=en`);
      // Also try to extract from og:description
      const ogMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      let glue = html;
      if (ogMatch && ogMatch[1]) glue += `\n${ogMatch[1]}`;
      const { posts, followers, following } = extractCounts(glue);
      if (posts !== null || followers !== null || following !== null) {
        return { username, posts, followers, following, source: 'instagram', updatedAt: now };
      }
    } catch {}
  }

  // 2c) Mirrors that often expose counts without heavy JS
  for (const host of ['https://ddinstagram.com', 'https://www.ddinstagram.com']) {
    try {
      const html = await fetchText(`${host}/${username}/`);
      const { posts, followers, following } = extractCounts(html);
      if (posts !== null || followers !== null || following !== null) {
        return { username, posts, followers, following, source: 'instagram', updatedAt: now };
      }
    } catch {}
  }

  // 3) Last resort: use Puppeteer to render and extract DOM
  try {
    const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
    let puppeteer: any;
    let browser: any;
    let launchOptions: any = { headless: true };

    if (isVercel) {
      const chromium = (await import('@sparticuz/chromium')).default;
      // Hints for serverless execution
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;
      puppeteer = await import('puppeteer-core');
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
      puppeteer = (puppeteer as any).default || puppeteer;
    }

    browser = await (puppeteer as any).launch(launchOptions);
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto(`https://www.instagram.com/${username}/?hl=en`, {
      waitUntil: 'networkidle2',
      timeout: 45000,
    });

    // Wait for follower/following anchors if they appear
    await page.waitForSelector('a[href$="/followers/"], a[href$="/following/"]', { timeout: 15000 }).catch(() => undefined);

    const raw = await page.evaluate(() => {
      const q = (sel: string): string | null => {
        const el = document.querySelector(sel) as HTMLElement | null;
        return el ? (el.textContent || '').trim() : null;
      };

      // Prefer dedicated links
      const followersAnchor = document.querySelector('a[href$="/followers/"]') as HTMLElement | null;
      const followingAnchor = document.querySelector('a[href$="/following/"]') as HTMLElement | null;
      const followersText = followersAnchor ? (followersAnchor.textContent || '').trim() : q('a[href*="followers"]');
      const followingText = followingAnchor ? (followingAnchor.textContent || '').trim() : q('a[href*="following"]');

      // Posts can be a plain <li> without link; find any list item containing "post"
      let postsText: string | null = null;
      const liNodes = Array.from(document.querySelectorAll('ul li')) as HTMLElement[];
      for (const li of liNodes) {
        const txt = (li.textContent || '').toLowerCase();
        if (/\bposts?\b|\bkiriman\b|\bpostingan\b/.test(txt)) {
          // Prefer the numeric span inside
          const spanWithTitle = li.querySelector('span[title]');
          postsText = (spanWithTitle?.textContent || '').trim() || (li.textContent || '').trim();
          break;
        }
      }

      const og = (document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null)?.content || '';
      return { followersText, followingText, postsText, og };
    });

    await browser.close();

    const glue = `${raw?.followersText || ''} | ${raw?.followingText || ''} | ${raw?.postsText || ''} | ${raw?.og || ''}`;
    const { posts, followers, following } = extractCounts(glue);
    if (posts !== null || followers !== null || following !== null) {
      return { username, posts, followers, following, source: 'instagram', updatedAt: now };
    }
  } catch {
    // ignore and fallthrough
  }

  return { username, posts: null, followers: null, following: null, source: 'unknown', updatedAt: now };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || searchParams.get('username') || 'ireddragonicy').replace(/^@/, '');
  try {
    const stats = await crawlInstagramStats(username);
    const ok = stats.posts !== null || stats.followers !== null || stats.following !== null;
    const res = NextResponse.json(stats, { status: ok ? 200 : 502 });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Failed to crawl Instagram' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


