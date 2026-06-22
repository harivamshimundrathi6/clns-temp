import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLNS | Centralised Legal Network Solutions",
  description: "The first unified legal-tech ecosystem connecting clients, students, and advocates through a single digital platform.",
  keywords: ["legal tech", "lawyer consultation", "law student internships", "advocate directory", "legal platform India"],
  authors: [{ name: "CLNS Team" }],
  metadataBase: new URL('https://clns.in'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: "mIQHtGgmnQ2ONxoppb4auEvWGe73E3iO7vkLznP5khc",
  },
  openGraph: {
    title: "CLNS | Centralised Legal Network Solutions",
    description: "Connect with verified advocates, find legal internships, and manage cases in one unified ecosystem.",
    url: "https://clns.in",
    siteName: "CLNS",
    images: [
      {
        url: "/clns-logo.png",
        width: 1200,
        height: 630,
        alt: "CLNS Platform Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLNS | Centralised Legal Network Solutions",
    description: "The first unified legal-tech ecosystem connecting clients, students, and advocates.",
    images: ["/clns-logo.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="mIQHtGgmnQ2ONxoppb4auEvWGe73E3iO7vkLznP5khc" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preload" as="image" href="/clns-logo.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/video-hero/image_for_supremcort.jpg?v=2" fetchPriority="high" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

