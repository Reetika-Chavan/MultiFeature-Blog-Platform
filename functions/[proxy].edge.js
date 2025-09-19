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

  // Geolocation headers
  const country = request.headers.get("visitor-ip-country");
  const region = request.headers.get("visitor-ip-region");
  const city = request.headers.get("visitor-ip-city");

  console.log("Geolocation:", { country, region, city });
  console.log("Checking hostname for password protection:", hostname);

  // Password protection for specific domains
  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
    // Check for Basic Authentication
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new Response("Authentication Required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Protected Area"',
          "Content-Type": "text/html",
        },
      });
    }

    // Validate credentials
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(":");

    // Hardcoded credentials for testing
    const validUsername = "admin";
    const validPassword = "supra";

    console.log("Hardcoded credentials test:", {
      username: username,
      password: password,
      usernameMatch: username === validUsername,
      passwordMatch: password === validPassword,
      usernameLength: username?.length,
      passwordLength: password?.length,
    });

    if (username === validUsername && password === validPassword) {
      console.log("Authentication successful - continuing with request");
      // Authentication successful - continue with request
    } else {
      return new Response("Authentication Required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Protected Area"',
          "Content-Type": "text/html",
        },
      });
    }
  }

  // IP restriction
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

  // Set cache headers for generative AI page route
  const headers = new Headers(response.headers);
  if (pathname === "/blog/generativeai") {
    headers.set("Cache-Control", "public, s-maxage=40");
  }

  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });

  return modifiedResponse;
}
