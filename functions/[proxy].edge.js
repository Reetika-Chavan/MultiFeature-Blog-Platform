import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

// JWT verification function
async function verifyJWT(token) {
  try {
    // In Contentstack Launch, environment variables are accessed via globalThis
    const secret = globalThis.OAUTH_CLIENT_SECRET;
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
    // Exchange code for tokens
    const tokenResponse = await fetch(globalThis.OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: globalThis.OAUTH_CLIENT_ID,
        client_secret: globalThis.OAUTH_CLIENT_SECRET,
        code: code,
        redirect_uri: globalThis.OAUTH_REDIRECT_URI,
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
    const signature = btoa(globalThis.OAUTH_CLIENT_SECRET);
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

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  // Handle OAuth callback
  if (pathname === "/oauth/callback") {
    return await handleOAuthCallback(request);
  }

  // Handle login page
  if (pathname === "/login") {
    const authUrl = `${globalThis.OAUTH_AUTHORIZE_URL}?client_id=${globalThis.OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(globalThis.OAUTH_REDIRECT_URI)}&response_type=code&scope=user.profile:read`;

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Required</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .login-btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block; }
          .login-btn:hover { background: #0056b3; }
          h1 { color: #333; margin-bottom: 20px; }
          p { margin: 10px 0; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Author Tools Access</h1>
          <p>You need to be logged in via Contentstack SSO to access the Author Tools section.</p>
          <p>Click the button below to authenticate with your Contentstack account.</p>
          <a href="${authUrl}" class="login-btn">Login with Contentstack</a>
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
      const jwt = await verifyJWT(jwtCookie);

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
      const jwt = await verifyJWT(jwtCookie);

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
