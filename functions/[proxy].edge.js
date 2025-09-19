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

  // Password protection 
  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
    console.log("Preview domain detected - checking authentication");

    const validUsername = env?.PREVIEW_USERNAME;
    const validPassword = env?.PREVIEW_PASSWORD;

    console.log("Environment variables:", {
      hasUsername: !!validUsername,
      hasPassword: !!validPassword,
    });

    const authHeader = request.headers.get("authorization");
    console.log("Auth header present:", !!authHeader);

    if (authHeader && authHeader.startsWith("Basic ")) {
      try {
        const credentials = atob(authHeader.slice(6));
        const [username, password] = credentials.split(":");

        console.log("Credentials:", {
          username,
          passwordMatch: password === validPassword,
        });

        if (username === validUsername && password === validPassword) {
          console.log("Authentication successful - continuing with request");
          // Authentication successful
        } else {
          console.log("Invalid credentials");
          return new Response("Authentication Required", {
            status: 401,
            headers: {
              "WWW-Authenticate": 'Basic realm="Preview Access"',
              "Content-Type": "text/plain",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          });
        }
      } catch (error) {
        console.log("Error parsing credentials:", error);
        return new Response("Authentication Required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Preview Access"',
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
      }
    } else {
      console.log("No valid auth header - returning 401");
      return new Response("Authentication Required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Preview Access"',
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }
  } else {
    console.log("Not a preview domain - skipping password protection");
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
