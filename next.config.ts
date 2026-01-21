import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern image formats for better compression
    formats: ["image/avif", "image/webp"],
    // Responsive image breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "startup-template-sage.vercel.app",
      },
      // Allow S3 bucket images
      {
        protocol: "https",
        hostname: `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      },
      // Allow Google profile images
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Allow Tailus marketing images
      {
        protocol: "https",
        hostname: "html.tailus.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
    ];
  },
  experimental: {
    authInterrupts: true,
  },
};

const withMDX = createMDX();
const config = withMDX(nextConfig);

// Export without Sentry wrapper - Sentry is initialized via instrumentation.ts
// The withSentryConfig wrapper causes useContext errors during prerendering
// in Next.js 16 when combined with certain dependencies.
export default config;
