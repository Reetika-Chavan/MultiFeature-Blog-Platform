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

    // Handle login POST
    if (request.method === "POST" && pathname === "/__auth") {
      const form = await request.formData();
      const user = form.get("username");
      const pass = form.get("password");

      if (user === USERNAME && pass === PASSWORD) {
        return Response.redirect("/", 302);
      } else {
        return new Response(`
          <html>
            <body>
              <p>Invalid username or password</p>
              <form method="POST" action="/__auth">
                <input type="text" name="username" placeholder="Username" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Login</button>
              </form>
            </body>
          </html>
        `, { status: 401, headers: { "Content-Type": "text/html" } });
      }
    }

    // Always show login page if not authenticated
    return new Response(`
      <html>
        <body>
          <form method="POST" action="/__auth">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `, {
      status: 401,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate, private, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }

  // Restrict IPs for author-tools
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
