import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { BackgroundVideo } from "@/components/background-video";
import { absoluteUrl, siteConfig, siteUrl } from "@/lib/seo";

import "./globals.css";

const headingFont = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800"]
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [
    {
      name: siteConfig.creator,
      url: "https://janni.fun"
    }
  ],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  category: "gaming",
  alternates: {
    canonical: "/"
  },
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.defaultTitle}`,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image").toString(),
        width: 1200,
        height: 630,
        alt: siteConfig.ogAlt
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.defaultTitle}`,
    description: siteConfig.description,
    images: [absoluteUrl("/twitter-image").toString()]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: "dark"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <BackgroundVideo />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
