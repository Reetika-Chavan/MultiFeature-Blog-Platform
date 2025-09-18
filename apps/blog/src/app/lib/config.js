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
      destination: "/blog?page=1",
      onlyOnProd: true,
    },
    {
      source: "/blog",
      destination: "/blog/latest",
      onlyOnProd: true,
    },
  ],
};
