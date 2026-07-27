import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Without this, every relative URL in `openGraph`/`alternates` resolves
  // against localhost in production and social previews break.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WAVerify — Verify WhatsApp Numbers Instantly",
    template: "%s · WAVerify",
  },
  description:
    "Fast, reliable WhatsApp number verification for developers and businesses. Clean REST API, generous free tier.",
  keywords: ["WhatsApp", "phone verification", "number lookup", "REST API"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "WAVerify — Verify WhatsApp Numbers Instantly",
    description:
      "Fast, reliable WhatsApp number verification for developers and businesses.",
    url: "/",
    siteName: "WAVerify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WAVerify — Verify WhatsApp Numbers Instantly",
    description:
      "Fast, reliable WhatsApp number verification for developers and businesses.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `suppressHydrationWarning` is required by next-themes, which sets the
    // theme class on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <a
          href="#main"
          className="bg-primary text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
