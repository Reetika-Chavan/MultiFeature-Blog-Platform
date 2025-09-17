import { processRedirects } from '../apps/blog/src/app/lib/redirects.js';
import { processRewrites } from '../apps/blog/src/app/lib/rewrites.js';
import { redirectsConfig } from '../apps/blog/src/app/lib/config.js';

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 🔒 Restrict access to /author-tools
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

  // 🔀 Redirects
  const redirectResponse = processRedirects(redirectsConfig, request);
  if (redirectResponse) return redirectResponse;

  // 🔀 Rewrites
  const rewriteResponse = await processRewrites(redirectsConfig, request);
  if (rewriteResponse) return rewriteResponse;

  // Default
  return fetch(request);
}
