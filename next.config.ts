import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'webstatic.hoyoverse.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  experimental: {
    // Ensure server bundles do not include large chromium binaries
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"],
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
          },
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
