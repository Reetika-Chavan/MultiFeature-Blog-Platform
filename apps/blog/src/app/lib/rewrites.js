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
      console.log(`Checking domain restrictions for: ${url.hostname}`);
      console.log(
        `Contains blog-test: ${url.hostname.includes("blog-test.devcontentstackapps.com")}`
      );
      console.log(
        `Contains preview-blog: ${url.hostname.includes("preview-blog.devcontentstackapps.com")}`
      );

      if (url.hostname !== "blog.devcontentstackapps.com") {
        console.log(
          `Rewrite skipped for non-production domain: ${url.hostname}`
        );
        continue;
      }
      console.log(
        `Domain check passed, rewrite will execute for: ${url.hostname}`
      );
    }

    if (
      rule.source === "/blog" &&
      url.pathname === "/blog" &&
      url.search === "?page=1"
    ) {
      const rewrittenUrl = `${url.origin}${rule.destination}`;
      console.log(`Rewriting ${url.pathname}${url.search} to ${rewrittenUrl}`);
      return fetch(new Request(rewrittenUrl, request));
    } else if (url.pathname === rule.source) {
      const rewrittenUrl = `${url.origin}${rule.destination}`;
      console.log(`Rewriting ${url.pathname} to ${rewrittenUrl}`);
      return fetch(new Request(rewrittenUrl, request));
    }
  }

  console.log(`No rewrite matched for ${url.pathname}`);
  return null;
}
