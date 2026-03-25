import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme";
import { AppProviders } from "@/app/providers";

import "./globals.css";

const siteName = "Smylecards";
const siteDescription =
  "Create events, invite guests, and collect every shared moment in one beautiful memory room.";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_VERCEL_URL ??
  "http://localhost:3000";

const metadataBase = (() => {
  const normalizedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  try {
    return new URL(normalizedUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteName,
      url: metadataBase.toString(),
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: metadataBase.toString(),
      description: siteDescription,
      inLanguage: "en",
    },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  referrer: "origin-when-cross-origin",
  keywords: [
    "event invitations",
    "event management",
    "guest invitations",
    "memory sharing",
    "event photos",
    "Smylecards",
  ],
  category: "events",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
