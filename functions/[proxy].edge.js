import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
    const USERNAME = "admin";
    const PASSWORD = "supra";

    const cookie = request.headers.get("cookie") || "";
    const valid = cookie.includes(`preview_auth=${USERNAME}:${PASSWORD}`);

    if (valid) {
      const response = await fetch(request);
      response.headers.append("Set-Cookie", "preview_auth=; Max-Age=0; Path=/");
      return response;
    }

    if (request.method === "POST") {
      const form = await request.formData();
      const user = form.get("username");
      const pass = form.get("password");

      if (user === USERNAME && pass === PASSWORD) {
        return fetch(request); // forward request without session persistence
      }
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview Login</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f9f9f9; }
            .box { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; }
            input { padding: 0.5rem; margin: 0.5rem 0; width: 100%; border: 1px solid #ccc; border-radius: 6px; }
            button { padding: 0.6rem 1.2rem; border: none; border-radius: 6px; background: #1976d2; color: white; font-weight: bold; cursor: pointer; }
            button:hover { background: #125a9c; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>🔒 Preview Access</h2>
            <form method="POST">
              <input type="text" name="username" placeholder="Enter username" required />
              <input type="password" name="password" placeholder="Enter password" required />
              <button type="submit">Login</button>
            </form>
          </div>
        </body>
      </html>
    `, {
      status: 401,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate, private, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
  }

  // Restrict IP
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

  // Default fetch
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
