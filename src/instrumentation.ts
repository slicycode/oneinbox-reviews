export async function register() {
  // Only initialize Sentry if DSN is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? async (
      err: Error,
      request: Request,
      context: { routerKind: string; routePath: string; routeType: string }
    ) => {
      const Sentry = await import("@sentry/nextjs");

      Sentry.captureException(err, {
        extra: {
          routerKind: context.routerKind,
          routePath: context.routePath,
          routeType: context.routeType,
          url: request.url,
          method: request.method,
        },
      });
    }
  : undefined;
