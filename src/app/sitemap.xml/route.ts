import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache configuration
const SITEMAP_CACHE_DURATION = 3600; // 1 hour in seconds
let cachedSitemap: string | null = null;
let cacheTimestamp: number = 0;

interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function getBaseUrl(): string {
  // Try to get from environment first
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, '');
  }
  
  // Fallback to default domain
  return 'https://ireddragonicy.vercel.app';
}

function normalizeToPosix(inputPath: string): string {
  return inputPath.split(path.sep).join('/');
}

function isDynamicOrRouteGroup(segmentName: string): boolean {
  return segmentName.includes('[') || segmentName.includes(']') || segmentName.startsWith('(');
}

function shouldSkipDir(dirName: string): boolean {
  const skipDirs = ['api', 'sitemap.xml', 'sitemap-dynamic.xml', 'node_modules', '_next', 'public'];
  return skipDirs.includes(dirName);
}

function hasPageFile(dirAbsolutePath: string): boolean {
  const pageCandidates = ['page.tsx', 'page.jsx', 'page.ts', 'page.js', 'route.ts', 'route.js'];
  return pageCandidates.some((file) => {
    try {
      return fs.existsSync(path.join(dirAbsolutePath, file));
    } catch {
      return false;
    }
  });
}

function collectStaticRoutes(): string[] {
  const discoveredRoutes = new Set<string>();
  
  // Get the app directory path
  const appDir = path.join(process.cwd(), 'src', 'app');
  
  if (!fs.existsSync(appDir)) {
    console.warn('App directory not found, using fallback routes');
    return ['/']; // Fallback to at least home page
  }

  function walk(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      const currentDirName = path.basename(currentDir);

      if (shouldSkipDir(currentDirName) || isDynamicOrRouteGroup(currentDirName)) {
        return;
      }

      // If this directory has a page file, record the route
      if (hasPageFile(currentDir)) {
        const rel = normalizeToPosix(path.relative(appDir, currentDir));
        const route = rel === '' ? '/' : `/${rel}`;
        discoveredRoutes.add(route);
      }

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (shouldSkipDir(entry.name) || isDynamicOrRouteGroup(entry.name)) continue;
          walk(path.join(currentDir, entry.name));
        }
      }
    } catch (error) {
      console.warn(`Error reading directory ${currentDir}:`, error);
    }
  }

  walk(appDir);
  return Array.from(discoveredRoutes).sort();
}

async function getBlogPosts(): Promise<{ routes: string[], lastModified: Date }> {
  try {
    // Dynamic import to get blog posts data
    const { getAllBlogPosts } = await import('../../lib/blog');
    const posts = getAllBlogPosts();
    
    const routes = posts.map(post => `/blog/${post.slug}`);
    
    // Get the most recent blog post date for lastModified
    const lastModified = posts.length > 0 
      ? new Date(Math.max(...posts.map(post => new Date(post.date).getTime())))
      : new Date();
    
    return { routes, lastModified };
  } catch (error) {
    console.warn('Error loading blog posts:', error);
    return { routes: [], lastModified: new Date() };
  }
}

async function getSocialLinks(): Promise<SitemapUrl[]> {
  try {
    const { socials } = await import('../social/data');
    const now = new Date();

    return socials.map((social) => ({
      url: social.href,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    }));
  } catch (error) {
    console.warn('Error loading social links:', error);
    return [];
  }
}

async function generateSitemapUrls(): Promise<SitemapUrl[]> {
  const baseUrl = getBaseUrl();
  const staticRoutes = collectStaticRoutes();
  const { routes: blogRoutes, lastModified: blogLastModified } = await getBlogPosts();
  const socialUrls = await getSocialLinks();
  const allRoutes = [...staticRoutes, ...blogRoutes];
  
  const now = new Date();
  
  const internalRoutes: SitemapUrl[] = allRoutes.map((route): SitemapUrl => ({
    url: `${baseUrl}${route}`,
    lastModified: route.startsWith('/blog/') ? blogLastModified : now,
    changeFrequency: route === '/' ? 'weekly' : route.startsWith('/blog/') ? 'monthly' : 'weekly',
    priority: route === '/' ? 1.0 : route.startsWith('/blog/') ? 0.7 : 0.8
  }));

  return [...internalRoutes, ...socialUrls];
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls.map(({ url, lastModified, changeFrequency, priority }) => {
    const lastMod = lastModified ? lastModified.toISOString() : new Date().toISOString();
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFrequency || 'weekly'}</changefreq>
    <priority>${priority || 0.8}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

async function getSitemap(): Promise<string> {
  const now = Date.now();
  
  // Check if we have a valid cached version
  if (cachedSitemap && (now - cacheTimestamp) < (SITEMAP_CACHE_DURATION * 1000)) {
    return cachedSitemap;
  }
  
  // Generate new sitemap
  const urls = await generateSitemapUrls();
  const sitemap = generateSitemapXml(urls);
  
  // Update cache
  cachedSitemap = sitemap;
  cacheTimestamp = now;
  
  return sitemap;
}

export async function GET(request: NextRequest) {
  try {
    const sitemap = await getSitemap();
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${SITEMAP_CACHE_DURATION}, s-maxage=${SITEMAP_CACHE_DURATION}`,
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a minimal fallback sitemap
    const baseUrl = getBaseUrl();
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Shorter cache for fallback
      },
    });
  }
}