import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Ensure server bundles do not include large chromium binaries
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"],
};

export default nextConfig;
