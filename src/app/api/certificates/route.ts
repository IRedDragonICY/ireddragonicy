import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PROFILE_URL = 'https://www.skills.google/public_profiles/a0d99021-862b-40d4-b668-c5a85a2b0f85';

// --- Simple In-Memory Cache ---
let CACHE: {
    data: any;
    timestamp: number;
} | null = null;

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 Hours Cache

const FALLBACK_CERTIFICATES = [
  {
    title: "Share Data Using Google Data Cloud",
    date: "Nov 13, 2025",
    image: "https://cdn.qwiklabs.com/YULGXibeJJ%2BL6cEHtaainTo%2B56dXFcYw1DEFf7JqX70%3D",
    link: "https://www.skills.google/public_profiles/a0d99021-862b-40d4-b668-c5a85a2b0f85/badges/20171981",
    id: "20171981"
  },
  {
    title: "Deploy and Manage Apigee X",
    date: "Nov 13, 2025",
    image: "https://cdn.qwiklabs.com/ysN2zHV01iIBGj78FNxXZxzVCeFXqE3MTlMwBPprPSo%3D",
    link: "https://www.skills.google/public_profiles/a0d99021-862b-40d4-b668-c5a85a2b0f85/badges/20170984",
    id: "20170984"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('force') === 'true';

  // 1. Check Cache
  if (CACHE && !forceRefresh) {
      const age = Date.now() - CACHE.timestamp;
      if (age < CACHE_DURATION) {
          return NextResponse.json({
              ...CACHE.data,
              source: 'cache_memory',
              cached_at: new Date(CACHE.timestamp).toISOString()
          });
      }
  }

  let browser;
  try {
    let executablePath;
    
    if (process.env.NODE_ENV === 'development') {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } else {
      executablePath = await chromium.executablePath();
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    
    // Robust Request Interception
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.isInterceptResolutionHandled()) return;

        const resourceType = req.resourceType();
        if (['stylesheet', 'font', 'image', 'media'].includes(resourceType)) {
            req.abort().catch(() => {});
        } else {
            req.continue().catch(() => {});
        }
    });

    await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    
    try {
      await page.waitForSelector('.profile-badge', { timeout: 5000 });
    } catch {
      // Ignore timeout
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certificates = await (page as any).evaluate(() => {
      const items = document.querySelectorAll('.profile-badge');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.from(items).map((item: any) => {
        const titleEl = item.querySelector('.ql-title-medium');
        const dateEl = item.querySelector('.ql-body-medium');
        const imgEl = item.querySelector('img');
        const linkEl = item.querySelector('a.badge-image');

        const src = imgEl ? imgEl.getAttribute('src') || '' : '';
        const link = linkEl ? linkEl.getAttribute('href') || '' : '';
        
        const idMatch = link.match(/\/badges\/(\d+)/);
        const id = idMatch ? idMatch[1] : Math.random().toString(36).substr(2, 9);

        return {
          title: titleEl ? titleEl.textContent?.trim() || '' : '',
          date: dateEl ? dateEl.textContent?.replace('Earned ', '').trim() || '' : '',
          image: src,
          link: link.startsWith('http') ? link : `https://www.skills.google${link}`,
          id
        };
      }).filter((cert: any) => cert.title && cert.image);
    });

    await browser.close();

    const responseData = {
        certificates: certificates.length > 0 ? certificates : FALLBACK_CERTIFICATES,
        total: certificates.length > 0 ? certificates.length : FALLBACK_CERTIFICATES.length,
    };

    // Update Cache
    if (certificates.length > 0) {
        CACHE = {
            data: responseData,
            timestamp: Date.now()
        };
    }

    return NextResponse.json({ 
      ...responseData,
      source: certificates.length > 0 ? 'google_skills_live' : 'fallback_data'
    });

  } catch (error) {
    console.error('Puppeteer error:', error);
    if (browser) {
        try {
            await browser.close();
        } catch (e) {
            console.error('Failed to close browser', e);
        }
    }
    
    // Return cache if available even if expired in case of error
    if (CACHE) {
        return NextResponse.json({
            ...CACHE.data,
            source: 'cache_stale_error_fallback',
            error: String(error)
        });
    }

    return NextResponse.json({ 
        certificates: FALLBACK_CERTIFICATES,
        total: FALLBACK_CERTIFICATES.length,
        source: 'fallback_error',
        error: String(error)
    });
  }
}
