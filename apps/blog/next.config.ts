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
        source: "/blog/latest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=40, stale-while-revalidate=20",
          },
        ],
      },

      {
        source: "/blog/gemini",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=60, stale-while-revalidate=30",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
