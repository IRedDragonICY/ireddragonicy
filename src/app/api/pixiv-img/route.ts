import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_HOSTS = new Set([
  'i.pximg.net',
  's.pximg.net',
  'imgaz.pixiv.net',
  'i-cf.pximg.net',
  'embed.pixiv.net',
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let src = searchParams.get('src');
  if (!src) {
    const res = NextResponse.json({ error: 'Missing src parameter' }, { status: 400 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  let url: URL;
  try {
    // Helper: aggressively upgrade ANY non-original pximg URL to full-ratio original
    const upgradeToOriginal = (u: URL): URL => {
      try {
        if (!/(^|\.)pximg\.net$/i.test(u.hostname)) return u;
        let p = u.pathname;
        // Aggressively rewrite ANY non-original path to img-original
        // Remove ALL crop segments: /c/WxH/, /custom-thumb/, size suffixes, etc.
        if (/\/c\/\d+x\d+(_\d+)?\//i.test(p)) {
          p = p.replace(/\/c\/\d+x\d+(_\d+)?\//i, '/');
        }
        if (/\/custom-thumb\//i.test(p)) {
          p = p.replace(/\/custom-thumb\//i, '/img-original/');
        }
        // Rewrite img-master path to img-original and strip ALL size suffixes
        if (/\/img-master\//i.test(p) || /_(square1200|master1200|custom1200|480mw)/i.test(p)) {
          p = p
            .replace(/\/img-master\//i, '/img-original/')
            .replace(/_(square1200|master1200|custom1200|480mw)/i, '');
        }
        // If not already img-original, force it
        if (!/\/img-original\//i.test(p) && /\/img\//i.test(p)) {
          p = p.replace(/\/img\//i, '/img-original/');
        }
        // Remove any remaining size markers
        p = p.replace(/_(thumb|small|regular|mini)\d*/i, '');
        
        const upgraded = new URL(u.toString());
        upgraded.pathname = p;
        return upgraded;
      } catch {
        return u;
      }
    };

    // Normalize HTML-encoded ampersands that may appear in og:image URLs
    src = src.replace(/&amp;/g, '&');
    url = new URL(src);
    // If the source is pximg, try to upgrade to original full-ratio first
    if (/(^|\.)pximg\.net$/i.test(url.hostname)) {
      url = upgradeToOriginal(url);
    }
  } catch {
    const res = NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  // If host is embed.pixiv.net we resolve below; block anything else not in whitelist
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    const res = NextResponse.json({ error: 'Host not allowed' }, { status: 400 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  try {
    // If this is an embed page, resolve the real image URL first
    if (url.hostname === 'embed.pixiv.net') {
      const illustId = url.searchParams.get('illust_id');
      if (illustId) {
        // Prefer JSON API which includes direct pximg URLs
        try {
          const jsonRes = await fetch(`https://r.jina.ai/http://www.pixiv.net/ajax/illust/${illustId}`, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'application/json,text/plain,*/*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://www.pixiv.net/',
            },
            cache: 'no-store',
          });
          const raw = await jsonRes.text();
          const parsed = JSON.parse(raw);
          const urls = parsed?.body?.urls || {};
          const candidates: string[] = [urls.small, urls.thumb, urls.thumb_mini, urls.regular, urls.original, urls.mini].filter(Boolean);
          const chosen = candidates.find((u: string) => u.includes('pximg.net')) || candidates[0];
          if (chosen) {
            url = new URL(String(chosen));
          }
        } catch {
          // Fallback: scrape embed page meta
          const embedRes = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://www.pixiv.net/',
            },
            cache: 'no-store',
            redirect: 'follow',
          });
          const text = await embedRes.text();
          let img = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
            || text.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
          if (img) {
            url = new URL(img.replace(/&amp;/g, '&'));
          }
        }
      } else {
        // No illust_id param; try meta as last resort
        const embedRes = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.pixiv.net/',
          },
          cache: 'no-store',
          redirect: 'follow',
        });
        const text = await embedRes.text();
        const img = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
          || text.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
        if (img) {
          url = new URL(img.replace(/&amp;/g, '&'));
        }
      }
    }

    // Some Pixiv images are behind Cloudflare and may require a referer and no-cors preflight bypass; we just forward with proper headers
    // Fetch with fallback: if original doesn't exist with current extension, try common ones
    const tryFetch = async (target: URL): Promise<Response> => fetch(target.toString(), {
      method: 'GET',
      headers: {
        'Referer': 'https://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
      redirect: 'follow',
    });

    let upstream = await tryFetch(url);
    if (!upstream.ok && /(^|\.)pximg\.net$/i.test(url.hostname)) {
      // If 404 on original, rotate through likely extensions
      const extOrder = ['.jpg', '.png', '.gif'];
      for (const ext of extOrder) {
        const u2 = new URL(url.toString());
        u2.pathname = u2.pathname.replace(/\.(jpg|jpeg|png|gif|webp)(?=$|\?)/i, ext);
        upstream = await tryFetch(u2);
        if (upstream.ok) { url = u2; break; }
      }
    }
    if (!upstream.ok) {
      const res = NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstream.arrayBuffer();
    const response = new NextResponse(arrayBuffer, { status: 200 });
    response.headers.set('Content-Type', contentType);
    // Aggressive CDN cache for images
    response.headers.set('Cache-Control', 'public, s-maxage=2592000, immutable');
    return response;
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Fetch failed' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


