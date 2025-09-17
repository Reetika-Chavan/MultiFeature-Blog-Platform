import { processRedirects } from '../apps/blog/lib/redirects.js';
import { processRewrites } from '../apps/blog/lib/rewrites.js';
import { redirectsConfig } from '../apps/blog/lib/config.js';

export default async function handler(request, context) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.startsWith("/author-tools")) {
    const allowedIPs = ["27.107.90.206"];

    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "";

    const clientIPList = clientIP.split(",").map((ip) => ip.trim());
    const isAllowed = clientIPList.some((ip) => allowedIPs.includes(ip));

    if (!isAllowed) {
      return new Response(
        JSON.stringify({
          error: "Access Denied",
          message:
            "The Author Tools section is only accessible from authorized IP addresses.",
          status: 403,
          allowedIPs,
          clientIP,
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
    }
  }

  const redirectResponse = processRedirects(redirectsConfig, request);
  if (redirectResponse) {
    return redirectResponse;
  }

  const rewriteResponse = await processRewrites(redirectsConfig, request);
  if (rewriteResponse) {
    return rewriteResponse;
  }

  return fetch(request);
}
