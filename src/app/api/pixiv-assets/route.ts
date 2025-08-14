import { NextResponse } from 'next/server';
import { crawlWithPuppeteer } from './puppeteer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type PixivArtwork = {
  id: string;
  href: string;
  thumb: string | null;
  title: string | null;
  alt: string | null;
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    cache: 'no-store',
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

function extractMaxPage(html: string): number {
  const matches = Array.from(html.matchAll(/\busers\/(\d+)\/artworks\?p=(\d+)\b/g));
  const pages = matches.map(m => parseInt(m[2], 10)).filter(n => Number.isFinite(n));
  const max = pages.length ? Math.max(...pages) : 1;
  return Math.max(1, max);
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractArtworkIds(text: string): string[] {
  const ids = new Set<string>();
  const re = /\b\/en\/artworks\/(\d+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return Array.from(ids);
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    cache: 'no-store',
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

async function resolveArtworkDetails(ids: string[], concurrency: number): Promise<Map<string, { thumb: string | null; title: string | null; alt: string | null }>> {
  const results = new Map<string, { thumb: string | null; title: string | null; alt: string | null }>();
  let index = 0;
  async function worker() {
    while (true) {
      const cur = index++;
      if (cur >= ids.length) break;
      const id = ids[cur];
      try {
        // 1) Prefer JSON API via text proxy to get direct pximg URLs
        try {
          const jsonRaw = await fetchText(`https://r.jina.ai/http://www.pixiv.net/ajax/illust/${id}`);
          const parsed = JSON.parse(jsonRaw);
          const body = parsed?.body || {};
          const urls = body?.urls || {};
          const candidates: string[] = [
            urls.regular,
            urls.small,
            urls.thumb,
            urls.thumb_mini,
            urls.mini,
            urls.original,
          ].filter(Boolean);
          const chosen = candidates.find((u: string) => typeof u === 'string' && u.includes('pximg.net')) || candidates[0] || null;
          const title = body?.title || null;
          if (chosen) {
            results.set(id, { thumb: String(chosen), title, alt: title });
            continue;
          }
        } catch {}

        // 2) Fallback to direct page meta and meta-preload-data
        const direct = await fetch(`https://www.pixiv.net/en/artworks/${id}`, {
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
        let html = '';
        if (direct.ok) {
          html = await direct.text();
        } else {
          html = await fetchText(`https://r.jina.ai/http://www.pixiv.net/en/artworks/${id}`);
        }
        // Try meta-preload-data first for direct pximg URLs
        let ogImage = null as string | null;
        try {
          const preload = html.match(/<meta[^>]+id=["']meta-preload-data["'][^>]+content=["']([^"']+)["']/i)?.[1];
          if (preload) {
            const decoded = decodeHtmlEntities(preload);
            const parsed = JSON.parse(decoded);
            // Look for illust data for this id
            const illustMap = parsed?.illust || parsed?.preload || {};
            const ill = illustMap?.[id] || Object.values(illustMap || {})[0];
            const urls = (ill as any)?.urls || {};
            const candidates: string[] = [urls.regular, urls.small, urls.thumb, urls.thumb_mini, urls.mini, urls.original].filter(Boolean);
            const chosen = candidates.find((u: string) => u.includes('pximg.net')) || candidates[0];
            if (chosen) {
              ogImage = String(chosen);
            }
          }
        } catch {}
        if (!ogImage) {
          ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
        }
        const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
        const twTitle = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
        const title = ogTitle || twTitle || null;
        if (ogImage) ogImage = ogImage.replace(/&amp;/g, '&');
        results.set(id, { thumb: ogImage, title, alt: title });
        if (ogImage) continue;

        // 3) Last resort: embed page
        try {
          const embed = await fetch(`https://embed.pixiv.net/artwork.php?illust_id=${id}`, {
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
          const t = await embed.text();
          const img = t.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
            || t.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
          if (img) {
            results.set(id, { thumb: img.replace(/&amp;/g, '&'), title, alt: title });
            continue;
          }
        } catch {}
      } catch {
        results.set(id, { thumb: null, title: null, alt: null });
      }
    }
  }
  const workers = Array.from({ length: Math.max(1, Math.min(16, concurrency || 6)) }, () => worker());
  await Promise.all(workers);
  return results;
}

function extractArtworksFromHtml(html: string): PixivArtwork[] {
  const items: PixivArtwork[] = [];
  // Find anchors to artwork detail pages; then capture an img nearby
  const anchorRegex = /<a[^>]+href=["'](\/en\/artworks\/(\d+))["'][^>]*>([\s\S]{0,800}?)(<\/a>)/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRegex.exec(html)) !== null) {
    const href = m[1];
    const id = m[2];
    const inner = m[3] || '';
    // Try to capture an <img> inside anchor
    const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/i)
      || inner.match(/<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/i);

    let thumb: string | null = null;
    let alt: string | null = null;
    if (imgMatch) {
      // Normalize order depending on which regex matched
      if (imgMatch.length >= 3) {
        if (imgMatch[1]?.startsWith('http')) {
          thumb = imgMatch[1];
          alt = imgMatch[2] || null;
        } else {
          alt = imgMatch[1] || null;
          thumb = imgMatch[2] || null;
        }
      }
    }

    // Title often appears as a sibling anchor beneath; try to capture it from nearby HTML (post-card footer)
    // Search forward up to 600 chars after current anchor closing tag for a title anchor linking to the same artwork id
    const lookaheadSlice = html.slice(anchorRegex.lastIndex, anchorRegex.lastIndex + 600);
    const hrefEscaped = escapeRegExp(href);
    const titleMatch = lookaheadSlice.match(new RegExp(`<a[^>]+href=["']${hrefEscaped}["'][^>]*>([^<]{1,160})<\\/a>`, 'i'));
    const title = titleMatch ? (titleMatch[1] || '').trim() : null;

    items.push({ id, href, thumb, title, alt });
  }
  return items;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = (searchParams.get('user') || '63934020').replace(/[^0-9]/g, '');
  const limitPagesParam = searchParams.get('limitPages');
  const limitPages = limitPagesParam ? Math.max(1, Math.min(50, parseInt(limitPagesParam, 10) || 1)) : null;
  const stepParam = searchParams.get('step');
  const step = stepParam ? Math.max(1, Math.min(5, parseInt(stepParam, 10) || 1)) : 1;
  const prefer = (searchParams.get('mode') || 'puppeteer').toLowerCase();

  try {
    const baseHost = 'www.pixiv.net';
    const basePath = `/en/users/${userId}/artworks`;
    let pageHtmls: string[] = [];
    let html1 = '';

    const tryJina = async () => {
      const page1Url = `https://r.jina.ai/http://${baseHost}${basePath}`;
      const first = await fetchHtml(page1Url);
      const maxPage = limitPages ?? extractMaxPage(first);
      const pageNumbers = Array.from({ length: maxPage }, (_, i) => i + 1).filter(p => (p - 1) % step === 0 || step === 1);
      const pageUrls = pageNumbers.map(p => p === 1 ? page1Url : `https://r.jina.ai/http://${baseHost}${basePath}?p=${p}`);
      const htmls = await Promise.all(pageUrls.map(u => fetchHtml(u).catch(() => '')));
      return { first, htmls };
    };

    if (prefer !== 'puppeteer') {
      try {
        const r = await tryJina();
        html1 = r.first;
        pageHtmls = r.htmls;
      } catch {
        pageHtmls = [];
      }
    }

    if (pageHtmls.length === 0) {
      const r = await crawlWithPuppeteer({ userId, limitPages: limitPages ?? undefined, step });
      html1 = r.firstHtml;
      pageHtmls = r.pageHtmls;
    }
    let allItems = pageHtmls.flatMap(extractArtworksFromHtml);

    // Fallback: if list parsing yields nothing, extract IDs from text and resolve details
    if (allItems.length === 0) {
    let ids = Array.from(new Set(pageHtmls.flatMap(extractArtworkIds)));
    // Secondary fallback: use Pixiv AJAX profile listing to get ids
    if (ids.length === 0) {
      try {
        const profileAllRaw = await fetchText(`https://r.jina.ai/http://www.pixiv.net/ajax/user/${userId}/profile/all`);
        const profileAll = JSON.parse(profileAllRaw);
        const illustIds = Object.keys(profileAll?.body?.illusts || {});
        const mangaIds = Object.keys(profileAll?.body?.manga || {});
        ids = Array.from(new Set([...illustIds, ...mangaIds]));
      } catch {}
    }
      if (ids.length) {
        const partialItems: PixivArtwork[] = ids.map(id => ({ id, href: `/en/artworks/${id}`, thumb: null, title: null, alt: null }));
        allItems = partialItems;
      }
    }

    // If thumbs are missing, resolve details for a subset to populate images and titles
    const maxDetailsParam = searchParams.get('maxDetails');
    // Default: crawl all missing thumbs up to 1200 to cover full galleries
    const maxDetails = maxDetailsParam ? Math.max(0, Math.min(2000, parseInt(maxDetailsParam, 10) || 0)) : 1200;
    const concurrencyParam = searchParams.get('concurrency');
    const concurrency = concurrencyParam ? Math.max(1, Math.min(16, parseInt(concurrencyParam, 10) || 6)) : 6;
    // Resolve details in chunks to avoid timeouts
    const missingIds = allItems.filter(it => !it.thumb).map(it => it.id);
    const chunkSize = Math.max(concurrency * 4, 24);
    let processed = 0;
    while (processed < Math.min(missingIds.length, maxDetails)) {
      const slice = missingIds.slice(processed, processed + chunkSize);
      const details = await resolveArtworkDetails(slice, concurrency);
      allItems = allItems.map(it => {
        const d = details.get(it.id);
        return d ? { ...it, thumb: d.thumb || it.thumb, title: d.title || it.title, alt: d.alt || it.alt } : it;
      });
      processed += slice.length;
    }

    // De-duplicate by artwork id
    const idToItem = new Map<string, PixivArtwork>();
    for (const it of allItems) {
      if (!idToItem.has(it.id)) idToItem.set(it.id, it);
    }

    const items = Array.from(idToItem.values()).map(it => ({
      ...it,
      // Make href absolute
      href: `https://www.pixiv.net${it.href}`,
      // Some thumbnails use pximg custom paths; leave as-is and let image proxy fetch them
    }));

    const payload = {
      userId,
      count: items.length,
      items,
      updatedAt: new Date().toISOString()
    };

    const res = NextResponse.json(payload, { status: 200 });
    // Cache at the CDN so subsequent users hit cache; allow long SWR
    res.headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=604800');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Failed to fetch Pixiv assets' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}


