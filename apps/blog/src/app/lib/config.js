export const redirectsConfig = {
  redirects: [
    {
      source: "/blog/ai",
      destination: "/blog/neuralink",
      statusCode: 302,
    },
  ],
  rewrites: [
    {
      source: "/latest",
      destination: "/blog/latest",
      onlyOnProd: true,
    },
    {
      source: "/blog",
      destination: "/blog/latest",
      onlyOnProd: true,
    },
    {
      source: "/blog",
      destination: "/404",
      onlyOnPreview: true,
    },
    {
      source: "/cdn-assets/:path*",
      destination: "/functions/cdn-assets/:path*",
    },
  ],
};
