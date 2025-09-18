import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

export default async function handler(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  // IP Restriction Logic
  const clientIP =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    request.headers.get("X-Real-IP") ||
    "unknown";

  console.log("Client IP:", clientIP);
  console.log("Requested pathname:", pathname);
  console.log("Hostname:", hostname);

  // Geolocation headers
  const country = request.headers.get("visitor-ip-country");
  const region = request.headers.get("visitor-ip-region");
  const city = request.headers.get("visitor-ip-city");

  console.log("Geolocation:", { country, region, city });

  // Password protection for specific domains
  console.log("Checking hostname for password protection:", hostname);
  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
    console.log("Preview domain detected - checking authentication");
    // Check for Basic Authentication
    const authHeader = request.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      console.log("No valid auth header - returning 401");
      return new Response("Authentication Required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Protected Area"',
          "Content-Type": "text/html",
        },
      });
    }

    // Validate credentials (admin/supra)
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(":");
    console.log("Credentials:", { username, password });

    if (username !== "admin" || password !== "supra") {
      console.log("Invalid credentials - returning 401");
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Protected Area"',
          "Content-Type": "text/html",
        },
      });
    }
    console.log("Authentication successful");
  } else {
    console.log("Not a preview domain - skipping password protection");
  }

  // IP restriction only for author-tools
  if (pathname.startsWith("/author-tools")) {
    const allowedIPs = ["27.107.90.206"];

    if (!allowedIPs.includes(clientIP)) {
      console.log("Blocked IP:", clientIP, "from accessing author-tools");
      return new Response("Access Denied: Author Tools - IP not allowed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
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

  return modifiedResponse;
}
