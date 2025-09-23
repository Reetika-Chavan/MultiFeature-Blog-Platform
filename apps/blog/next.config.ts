import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev11-images.csnonprod.com",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    staleTimes: {
      dynamic: 3600,
      static: 86400,
    },
  },
  async headers() {
    return [
      {
        // 1 hour
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
        // 40 seconds
        source: "/blog/latest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=40, s-maxage=40, stale-while-revalidate=80",
          },
        ],
      },
      {
        // 50 seconds
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
        // 50 seconds
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
