"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/swr/fetcher";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense>
        <SessionProvider>
          <SWRConfig value={{ fetcher }}>
            {children}
            <Analytics />
            <SpeedInsights />
            <Toaster position="top-center" className="dark:hidden" richColors />
            <Toaster
              position="top-center"
              className="hidden dark:block"
              richColors
            />
          </SWRConfig>
        </SessionProvider>
      </Suspense>
    </ThemeProvider>
  );
}

export default Providers;
