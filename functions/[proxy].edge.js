import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      const timestamp = Date.now();
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Required</title>
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
        </head>
        <body>
          <h1>Authentication Required</h1>
          <p>Please enter your credentials to access the preview environment.</p>
          <p>Username: admin, Password: supra</p>
        </body>
        </html>
      `,
        {
          status: 401,
          headers: {
            "WWW-Authenticate": `Basic realm="Protected Preview Area ${timestamp}"`,
            "Content-Type": "text/html",
            "Cache-Control":
              "no-cache, no-store, must-revalidate, private, max-age=0",
            "CF-Cache-Status": "DYNAMIC",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(":");

    if (username === "admin" && password === "supra") {
    } else {
      const timestamp = Date.now();
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="Protected Preview Area ${timestamp}"`,
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate, private",
          "CF-Cache-Status": "DYNAMIC",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }
  }

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

  // Redirects
  const redirectResponse = processRedirects(redirectsConfig.redirects, request);
  if (redirectResponse) return redirectResponse;

  // Rewrites
  const rewriteResponse = await processRewrites(
    redirectsConfig.rewrites,
    request
  );
  if (rewriteResponse) return rewriteResponse;

  // Debug: Add headers to confirm edge function is running
  const response = await fetch(request);
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  // Add debug headers
  modifiedResponse.headers.set("X-Edge-Function", "running");
  modifiedResponse.headers.set("X-Hostname", hostname);
  modifiedResponse.headers.set("X-Timestamp", Date.now().toString());

  return modifiedResponse;
}
