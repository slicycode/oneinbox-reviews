import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Profile 10% of traced transactions in production
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay - only in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations:
    typeof window !== "undefined"
      ? [
          // Browser tracing for page load and navigation performance
          Sentry.browserTracingIntegration({
            enableInp: true, // Interaction to Next Paint
          }),
          // Session replay for debugging
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ]
      : [],
});
