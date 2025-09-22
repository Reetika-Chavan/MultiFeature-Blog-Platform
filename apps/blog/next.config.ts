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
  // Configure headers for better caching
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
    ];
  },
};

export default nextConfig;
