import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

// JWT verification function
async function verifyJWT(token, secret) {
  try {
    if (!secret) {
      throw new Error("OAUTH_CLIENT_SECRET not configured");
    }

    // Simple JWT verification (in production, use a proper JWT library)
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    throw new Error("JWT verification failed");
  }
}

// OAuth callback handler
async function handleOAuthCallback(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Authorization code not found", { status: 400 });
  }

  try {
    // Access environment variables
    const OAUTH_CLIENT_ID = env?.OAUTH_CLIENT_ID || globalThis.OAUTH_CLIENT_ID;
    const OAUTH_CLIENT_SECRET =
      env?.OAUTH_CLIENT_SECRET || globalThis.OAUTH_CLIENT_SECRET;
    const OAUTH_REDIRECT_URI =
      env?.OAUTH_REDIRECT_URI || globalThis.OAUTH_REDIRECT_URI;
    const OAUTH_TOKEN_URL = env?.OAUTH_TOKEN_URL || globalThis.OAUTH_TOKEN_URL;

    // Exchange code for tokens
    const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        code: code,
        redirect_uri: OAUTH_REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("Failed to obtain access token");
    }

    // Create JWT with token information
    const jwtPayload = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    };

    // Create JWT (simplified - in production use proper JWT library)
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify(jwtPayload));
    const signature = btoa(OAUTH_CLIENT_SECRET);
    const jwt = `${header}.${payload}.${signature}`;

    // Set JWT cookie and redirect
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `jwt=${jwt}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
      },
    });
  } catch (error) {
    return new Response("OAuth callback failed", { status: 500 });
  }
}

export default async function handler(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  // Access environment variables from env parameter
  const OAUTH_CLIENT_ID = env?.OAUTH_CLIENT_ID || globalThis.OAUTH_CLIENT_ID;
  const OAUTH_CLIENT_SECRET =
    env?.OAUTH_CLIENT_SECRET || globalThis.OAUTH_CLIENT_SECRET;
  const OAUTH_REDIRECT_URI =
    env?.OAUTH_REDIRECT_URI || globalThis.OAUTH_REDIRECT_URI;
  const OAUTH_TOKEN_URL = env?.OAUTH_TOKEN_URL || globalThis.OAUTH_TOKEN_URL;
  const OAUTH_AUTHORIZE_URL =
    env?.OAUTH_AUTHORIZE_URL || globalThis.OAUTH_AUTHORIZE_URL;

  // Handle OAuth callback
  if (pathname === "/oauth/callback") {
    return await handleOAuthCallback(request, env);
  }

  // Handle login page
  if (pathname === "/login") {
    // Debug: Show what environment variables are available
    const debugInfo = {
      OAUTH_CLIENT_ID: OAUTH_CLIENT_ID || "undefined",
      OAUTH_CLIENT_SECRET: OAUTH_CLIENT_SECRET ? "Set" : "undefined",
      OAUTH_REDIRECT_URI: OAUTH_REDIRECT_URI || "undefined",
      OAUTH_TOKEN_URL: OAUTH_TOKEN_URL || "undefined",
      OAUTH_AUTHORIZE_URL: OAUTH_AUTHORIZE_URL || "undefined",
      globalThisKeys: Object.keys(globalThis).filter((key) =>
        key.includes("OAUTH")
      ),
      envKeys: env
        ? Object.keys(env).filter((key) => key.includes("OAUTH"))
        : "env is undefined",
    };

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Environment Debug</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .debug { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 12px; }
          h1 { color: #333; margin-bottom: 20px; }
          p { margin: 10px 0; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔍 Environment Variables Debug</h1>
          <div class="debug">
            <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <p>This debug page shows what environment variables are available.</p>
        </div>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Contentstack SSO Authentication for /author-tools
  if (pathname.startsWith("/author-tools")) {
    // Check for JWT cookie
    const jwtCookie = request.headers.get("Cookie")?.match(/jwt=([^;]+)/)?.[1];

    if (!jwtCookie) {
      // No JWT found, redirect to login
      return Response.redirect(`${url.origin}/login`, 302);
    }

    try {
      // Verify JWT token
      const jwt = await verifyJWT(jwtCookie, OAUTH_CLIENT_SECRET);

      if (!jwt || jwt.exp < Date.now() / 1000) {
        // JWT expired or invalid, redirect to login
        return Response.redirect(`${url.origin}/login`, 302);
      }

      // JWT is valid, continue with the request
    } catch (error) {
      // JWT verification failed, redirect to login
      return Response.redirect(`${url.origin}/login`, 302);
    }
  }

  // Contentstack SSO Authentication for /author-tools
  if (pathname.startsWith("/author-tools")) {
    // Check for JWT cookie
    const jwtCookie = request.headers.get("Cookie")?.match(/jwt=([^;]+)/)?.[1];

    if (!jwtCookie) {
      // No JWT found, redirect to login
      return Response.redirect(`${url.origin}/login`, 302);
    }

    try {
      // Verify JWT token
      const jwt = await verifyJWT(jwtCookie, OAUTH_CLIENT_SECRET);

      if (!jwt || jwt.exp < Date.now() / 1000) {
        // JWT expired or invalid, redirect to login
        return Response.redirect(`${url.origin}/login`, 302);
      }

      // JWT is valid, continue with the request
    } catch (error) {
      // JWT verification failed, redirect to login
      return Response.redirect(`${url.origin}/login`, 302);
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
