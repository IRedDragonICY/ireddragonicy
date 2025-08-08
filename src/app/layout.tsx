import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import BootGate from '@/components/BootGate';
import Script from "next/script";
import type { ReactNode } from "react";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ireddragonicy.vercel.app";
const SITE_NAME = "IRedDragonICY";
const SITE_TITLE = "IRedDragonICY | Research Scientist Portfolio";
const SITE_DESCRIPTION = "The professional portfolio of Mohammad Farid Hendianto, an aspiring Research Scientist.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: "%s | IRedDragonICY",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "IRedDragonICY",
    "Mohammad Farid Hendianto",
    "Research Scientist",
    "Portfolio",
    "AI",
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "NLP",
    "Blog",
  ],
  authors: [{ name: "Mohammad Farid Hendianto", url: siteUrl }],
  creator: "Mohammad Farid Hendianto",
  publisher: SITE_NAME,
  // Do not set a global canonical here to avoid overriding per-page canonicals
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/hero-image.png",
        width: 1200,
        height: 630,
        alt: "IRedDragonICY hero image",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/hero-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/favicon.ico" },
  referrer: "origin-when-cross-origin",
  category: "Technology",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": siteUrl,
        "description": SITE_DESCRIPTION,
        "inLanguage": "en",
      },
      {
        "@type": "Person",
        "name": "Mohammad Farid Hendianto",
        "url": siteUrl,
        "jobTitle": "Research Scientist",
        "affiliation": {
          "@type": "Organization",
          "name": SITE_NAME
        }
      }
    ]
  };

  return (
    <html lang="en">
      <body className={poppins.className}>
        <Script
          id="ld-json-site"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BootGate>
          {children}
        </BootGate>
      </body>
    </html>
  );
}