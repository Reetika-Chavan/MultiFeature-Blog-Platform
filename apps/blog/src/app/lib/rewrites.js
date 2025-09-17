export async function processRewrites(rewrites, request) {
  const url = new URL(request.url);

  for (const rule of rewrites) {
    if (rule.onlyOnProd) {
      if (
        url.hostname.includes("blog-test.devcontentstackapps.com") ||
        url.hostname.includes("preview-blog.devcontentstackapps.com")
      ) {
        continue;
      }
    }

    if (url.pathname === rule.source) {
      const rewrittenUrl = `${url.origin}${rule.destination}`;
      return fetch(new Request(rewrittenUrl, request));
    }
  }

  return null;
}
