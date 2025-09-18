import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
    const authHeader = request.headers.get("Authorization");
    const timestamp = Date.now();

    // ALWAYS require authentication - ignore cached credentials
    // Force browser to show auth dialog every time
    const uniqueRealm = `PreviewAuth_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    // Always return 401 to force fresh authentication
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Required</title>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .info { color: #1976d2; background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          h1 { color: #333; margin-bottom: 20px; }
          p { margin: 10px 0; line-height: 1.5; }
          .credentials { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔒 Preview Access Required</h1>
          <div class="info">
            <p><strong>Domain:</strong> ${hostname}</p>
            <p>This preview environment requires authentication on every visit.</p>
            <p>Please enter your credentials to continue.</p>
          </div>
          <div class="credentials">
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> supra</p>
          </div>
          <p><em>Authentication is required every time for security.</em></p>
        </div>
      </body>
      </html>
    `,
      {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${uniqueRealm}"`,
          "Content-Type": "text/html",
          "Cache-Control":
            "no-cache, no-store, must-revalidate, private, max-age=0",
          "CF-Cache-Status": "DYNAMIC",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(":");

    if (username === "admin" && password === "supra") {
      const modifiedUrl = new URL(request.url);
      modifiedUrl.searchParams.set("_t", timestamp.toString());
      const modifiedRequest = new Request(modifiedUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      const response = await fetch(modifiedRequest);
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      modifiedResponse.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate, private"
      );
      modifiedResponse.headers.set("Pragma", "no-cache");
      modifiedResponse.headers.set("Expires", "0");
      modifiedResponse.headers.set("X-Edge-Function", "running");
      modifiedResponse.headers.set("X-Hostname", hostname);
      modifiedResponse.headers.set("X-Timestamp", timestamp.toString());

      return modifiedResponse;
    } else {
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

  const response = await fetch(request);
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  modifiedResponse.headers.set("X-Edge-Function", "running");
  modifiedResponse.headers.set("X-Hostname", hostname);
  modifiedResponse.headers.set("X-Timestamp", Date.now().toString());

  return modifiedResponse;
}
