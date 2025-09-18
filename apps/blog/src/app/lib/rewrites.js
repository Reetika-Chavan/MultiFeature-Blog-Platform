export async function processRewrites(rewrites, request) {
  const url = new URL(request.url);
  console.log(
    `Processing rewrites for hostname: ${url.hostname}, pathname: ${url.pathname}`
  );

  for (const rule of rewrites) {
    console.log(
      `Checking rule: ${rule.source} -> ${rule.destination}, onlyOnProd: ${rule.onlyOnProd}`
    );

    if (rule.onlyOnProd) {
      if (
        url.hostname.includes("blog-test.devcontentstackapps.com") ||
        url.hostname.includes("preview-blog.devcontentstackapps.com")
      ) {
        console.log(`Rewrite skipped for test domain: ${url.hostname}`);
        continue; 
      }
    }

    if (url.pathname === rule.source) {
      const rewrittenUrl = `${url.origin}${rule.destination}`;
      console.log(`Rewriting ${url.pathname} to ${rewrittenUrl}`);
      return fetch(new Request(rewrittenUrl, request));
    }
  }

  console.log(`No rewrite matched for ${url.pathname}`);
  return null;
}
