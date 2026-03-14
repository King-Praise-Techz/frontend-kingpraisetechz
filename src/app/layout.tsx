import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/shared/Providers";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kingpraisetechz.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "King Praise Techz | Professional Web Agency",
    template: "%s | King Praise Techz",
  },
  description:
    "King Praise Techz is a professional web agency delivering high-quality websites, web apps, and digital solutions. Track projects, manage teams, and exceed expectations.",
  keywords: [
    "web agency", "web development", "website design", "digital agency Nigeria",
    "Next.js development", "React development", "professional web services",
    "King Praise Techz", "KPT agency", "project management",
  ],
  authors: [{ name: "King Praise Techz", url: BASE_URL }],
  creator: "King Praise Techz",
  publisher: "King Praise Techz",
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
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "King Praise Techz",
    title: "King Praise Techz | Professional Web Agency",
    description:
      "Build. Deliver. Exceed. Your professional web agency management platform — tracking projects, managing teams, and delighting clients.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "King Praise Techz – Professional Web Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Praise Techz | Professional Web Agency",
    description: "Build. Deliver. Exceed. Professional web development and project management platform.",
    images: ["/og-image.png"],
    creator: "@kingpraisetechz",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#1a4dff" }],
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <meta name="google-site-verification" content="gs4tSMtK0ZcQ986t0Ul65oHijKJIZZAcs5y3gMjU3wU" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body className="noise-overlay mesh-bg min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(26,26,46,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
                fontFamily: "'Satoshi', 'DM Sans', sans-serif",
                fontSize: "14px",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#f1f5f9" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}