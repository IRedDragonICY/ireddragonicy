import type { Browser } from 'puppeteer-core';

export type PuppeteerCrawlResult = {
	firstHtml: string;
	pageHtmls: string[];
};

async function launchChromium(): Promise<{ browser: Browser }>
{
	const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
	let puppeteer: any;
	let browser: Browser;
	if (isVercel) {
		const chromium = (await import('@sparticuz/chromium')).default;
		chromium.setHeadlessMode = true as any;
		chromium.setGraphicsMode = false as any;
		const core = await import('puppeteer-core');
		const P = (core as any).default || core;
		browser = await P.launch({
			args: [...chromium.args, '--lang=en-US,en', '--no-sandbox', '--disable-dev-shm-usage'],
			executablePath: await chromium.executablePath(),
			headless: true,
			defaultViewport: { width: 1280, height: 960 },
		});
	} else {
		const full = await import('puppeteer');
		const P = (full as any).default || full;
		browser = await P.launch({ headless: true, args: ['--lang=en-US,en'] });
	}
	return { browser };
}

export async function crawlWithPuppeteer({ userId, limitPages, step = 1 }: { userId: string; limitPages?: number | null; step?: number }): Promise<PuppeteerCrawlResult> {
	const { browser } = await launchChromium();
	try {
		const page = await browser.newPage();
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
		await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
		const base = `https://www.pixiv.net/en/users/${userId}/artworks`;
		await page.goto(base, { waitUntil: 'networkidle2', timeout: 60000 });
		const firstHtml = await page.content();
		// Determine number of pages by reading pagination
		const maxPage = await page.evaluate(() => {
			const anchors = Array.from(document.querySelectorAll('a[href*="/artworks?p="]')); 
			const nums = anchors.map(a => {
				const m = (a.getAttribute('href') || '').match(/\?p=(\d+)/);
				return m ? parseInt(m[1]!, 10) : 0;
			}).filter(Boolean);
			return nums.length ? Math.max(...nums) : 1;
		});
		const targetMax = limitPages ? Math.min(limitPages, maxPage) : maxPage;
		const pages: number[] = [];
		for (let p = 1; p <= targetMax; p++) {
			if (step === 1 || ((p - 1) % step) === 0) pages.push(p);
		}
		const htmls: string[] = [];
		for (const p of pages) {
			if (p === 1) {
				htmls.push(firstHtml);
				continue;
			}
			await page.goto(`${base}?p=${p}`, { waitUntil: 'networkidle2', timeout: 60000 });
			htmls.push(await page.content());
		}
		return { firstHtml, pageHtmls: htmls };
	} finally {
		await browser.close();
	}
}


