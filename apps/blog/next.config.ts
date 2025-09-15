import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev11-images.csnonprod.com",
      },
      {
        protocol: "https",
        hostname: "images.contentstack.io",
      },
      {
        protocol: "https",
        hostname: "assets.contentstack.io",
      },
    ],
    // Enable image optimization for our CDN proxy
    domains: ["dev11-images.csnonprod.com"],
    // Configure image optimization settings
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configure rewrites for CDN assets
  async rewrites() {
    return [
      {
        source: "/cdn-assets/:path*",
        destination: "/api/cdn-assets/:path*",
      },
    ];
  },

  // Configure headers for better caching and security
  async headers() {
    return [
      {
        source: "/cdn-assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },

  // Configure webpack for better asset handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
