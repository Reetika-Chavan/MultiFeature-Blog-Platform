import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev11-images.csnonprod.com",
      },
    ],
    unoptimized: true,
  },
  // Enable experimental features for better caching
  experimental: {
    staleTimes: {
      dynamic: 3600, // 1 hour for dynamic pages
      static: 86400, // 24 hours for static pages
    },
  },
  async headers() {
    return [
      {
        // Generative AI content - balanced caching (1 hour)
        source: "/blog/generativeai",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Latest content - frequent updates (40 seconds)
        source: "/blog/latest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=40, s-maxage=40, stale-while-revalidate=80",
          },
        ],
      },
      {
        // AI/Gemini content - moderate cache (50 seconds)
        source: "/blog/gemini",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=50, s-maxage=50, stale-while-revalidate=100",
          },
        ],
      },
      {
        // AI content - moderate cache (50 seconds)
        source: "/blog/ai",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=50, s-maxage=50, stale-while-revalidate=100",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
