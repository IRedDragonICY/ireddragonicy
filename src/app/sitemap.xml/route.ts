export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ireddragonicy.vercel.app";
  const lastMod = new Date().toISOString();

  const entries: Array<{
    path: string;
    changefreq: "weekly" | "monthly" | "daily" | "yearly" | "always" | "never" | "hourly";
    priority: number;
  }> = [
    { path: "/", changefreq: "weekly", priority: 1 },
    { path: "/blog", changefreq: "weekly", priority: 0.8 },
    { path: "/social", changefreq: "monthly", priority: 0.6 },
    { path: "/education", changefreq: "monthly", priority: 0.7 },
    { path: "/donate", changefreq: "monthly", priority: 0.7 },
    { path: "/terminal", changefreq: "monthly", priority: 0.5 },
  ];

  const urlset = entries
    .map(({ path, changefreq, priority }) => {
      return (
        `<url>` +
        `<loc>${baseUrl}${path}</loc>` +
        `<lastmod>${lastMod}</lastmod>` +
        `<changefreq>${changefreq}</changefreq>` +
        `<priority>${priority}</priority>` +
        `</url>`
      );
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urlset +
    `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}


