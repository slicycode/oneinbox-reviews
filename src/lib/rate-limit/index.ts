import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Create Redis client - will be null if not configured
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Rate limit configurations for different endpoint types
export const rateLimiters = {
  // Auth endpoints - strict limits (5 requests per minute)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "ratelimit:auth",
      })
    : null,

  // Email sending endpoints (3 requests per minute)
  email: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 m"),
        analytics: true,
        prefix: "ratelimit:email",
      })
    : null,

  // Search endpoints (30 requests per minute)
  search: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
        prefix: "ratelimit:search",
      })
    : null,

  // Export endpoints - very strict (5 requests per hour)
  export: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        analytics: true,
        prefix: "ratelimit:export",
      })
    : null,

  // General API endpoints (100 requests per minute)
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "ratelimit:api",
      })
    : null,
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";

  return `ip:${ip}`;
}

/**
 * Check rate limit and return appropriate response if exceeded
 */
export async function checkRateLimit(
  req: NextRequest,
  type: RateLimitType = "api",
  userId?: string
): Promise<{ success: boolean; response?: NextResponse }> {
  const limiter = rateLimiters[type];

  // Skip rate limiting if not configured (development or missing env vars)
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`Rate limiting not configured for type: ${type}`);
    }
    return { success: true };
  }

  const identifier = getIdentifier(req, userId);

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      console.warn(`Rate limit exceeded for ${identifier} on ${type} endpoint`);

      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Too Many Requests",
            message: "Rate limit exceeded. Please try again later.",
            retryAfter,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": retryAfter.toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch (error) {
    // Log error but don't block requests if rate limiting fails
    console.error("Rate limiting error:", error);
    return { success: true };
  }
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T,
  type: RateLimitType = "api",
  getUserId?: (req: NextRequest) => string | undefined
) {
  return async (req: NextRequest, ...args: unknown[]): Promise<Response> => {
    const userId = getUserId?.(req);
    const { success, response } = await checkRateLimit(req, type, userId);

    if (!success && response) {
      return response;
    }

    return handler(req, ...args);
  };
}
