/*
  Generates public/sitemap.xml at build time by scanning static routes in src/app.
  Run manually with: `node scripts/generate-sitemap.js`
*/

const fs = require('fs');
const path = require('path');

function normalizeToPosix(inputPath) {
  return inputPath.split(path.sep).join('/');
}

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, '');
  return 'https://ireddragonicy.vercel.app';
}

function isDynamicOrRouteGroup(segmentName) {
  return segmentName.includes('[') || segmentName.includes(']') || segmentName.startsWith('(');
}

function shouldSkipDir(dirName) {
  if (dirName === 'api') return true;
  if (dirName === 'sitemap.xml') return true;
  if (dirName === 'node_modules') return true;
  return false;
}

function hasPageFile(dirAbsolutePath) {
  const pageCandidates = ['page.tsx', 'page.jsx', 'page.ts', 'page.js'];
  return pageCandidates.some((file) => fs.existsSync(path.join(dirAbsolutePath, file)));
}

function collectStaticRoutes(appDir) {
  const discoveredRoutes = new Set();

  function walk(currentDir) {
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
  }

  walk(appDir);
  return Array.from(discoveredRoutes).sort();
}

function buildSitemapXml(baseUrl, routes) {
  const lastMod = new Date().toISOString();
  const urlset = routes
    .map((routePath) => {
      const priority = routePath === '/' ? 1.0 : 0.8;
      const changefreq = 'weekly';
      return (
        '<url>' +
        `<loc>${baseUrl}${routePath}</loc>` +
        `<lastmod>${lastMod}</lastmod>` +
        `<changefreq>${changefreq}</changefreq>` +
        `<priority>${priority}</priority>` +
        '</url>'
      );
    })
    .join('');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urlset +
    '</urlset>'
  );
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const appDir = path.join(projectRoot, 'src', 'app');
  const publicDir = path.join(projectRoot, 'public');

  if (!fs.existsSync(appDir)) {
    console.error('Could not find src/app directory. Aborting sitemap generation.');
    process.exit(1);
  }

  const baseUrl = getBaseUrl();
  const routes = collectStaticRoutes(appDir);
  const xml = buildSitemapXml(baseUrl, routes);

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');

  console.log(`Sitemap generated with ${routes.length} routes at: ${outputPath}`);
}

main();


