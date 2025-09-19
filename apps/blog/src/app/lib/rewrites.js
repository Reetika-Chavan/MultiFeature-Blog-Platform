export async function processRewrites(rewrites, request) {
  const url = new URL(request.url);

  for (const rule of rewrites) {
    if (rule.onlyOnProd) {
      if (url.hostname !== "blog.devcontentstackapps.com") {
        continue;
      }
    }

    if (rule.onlyOnPreview) {
      if (
        url.hostname !== "preview-blog.devcontentstackapps.com" &&
        url.hostname !== "blog-test.devcontentstackapps.com"
      ) {
        continue;
      }
    }

    if (
      rule.source === "/blog" &&
      url.pathname === "/blog" &&
      url.search === "?page=1"
    ) {
      const rewrittenUrl = `${url.origin}${rule.destination}`;
      return fetch(new Request(rewrittenUrl, request));
    } else if (url.pathname === rule.source) {
      const rewrittenUrl = `${url.origin}${rule.destination}`;
      return fetch(new Request(rewrittenUrl, request));
    }
  }

  return null;
}
