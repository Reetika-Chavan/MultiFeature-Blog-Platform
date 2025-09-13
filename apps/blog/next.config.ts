import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev11-images.csnonprod.com", 
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/cdn-assets/:path*",  
        destination: "/cdn-assets/:path*", 
      },
    ];
  },
};

export default nextConfig;
