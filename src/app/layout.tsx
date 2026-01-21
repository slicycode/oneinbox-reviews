import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { appConfig } from "@/lib/config";
import Providers from "./Providers";

// Force dynamic rendering globally to avoid prerendering issues with context providers
// This is a workaround for Next.js 16 + React 19 prerendering bugs
// See: https://github.com/vercel/next.js/issues/85668
export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${appConfig.projectName}`,
    absolute: appConfig.projectName,
  },
  description: appConfig.description,
  keywords: appConfig.keywords,
  openGraph: {
    title: appConfig.projectName,
    description: appConfig.description,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: appConfig.projectName,
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} antialiased bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
