import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

// JWT functions
function base64UrlDecode(str) {
  str += new Array(5 - (str.length % 4)).join("=");
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

function parseJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return { header, payload };
  } catch (e) {
    return null;
  }
}

function verifyJWT(token, secret) {
  try {
    const sessionData = JSON.parse(atob(token));

    if (sessionData.exp && Date.now() >= sessionData.exp * 1000) {
      return false;
    }

    if (!sessionData.access_token) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

export default async function handler(request, env, context) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;
  const searchParams = url.searchParams;

  // IP Restriction
  const clientIP =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    request.headers.get("X-Real-IP") ||
    "unknown";

  // Geolocation headers
  const country = request.headers.get("visitor-ip-country");
  const region = request.headers.get("visitor-ip-region");
  const city = request.headers.get("visitor-ip-city");

  console.log(
    `Visitor Location: Country=${country || "Unknown"}, Region=${region || "Unknown"}, City=${city || "Unknown"}, IP=${clientIP}`
  );

  const localeMapByCountry = {
    FR: "fr-fr",
    JP: "ja-jp",
    US: "en-us",
    CA: "en-us",
    GB: "en-us",
    AU: "en-us",
    DE: "en-us",
    ES: "en-us",
    IT: "en-us",
  };

  const currentLang = searchParams.get("lang");

  if (!currentLang) {
    const acceptLang = request.headers.get("accept-language") || "";
    const browserLang = acceptLang.split(",")[0].toLowerCase();

    let detectedLocale = "en-us";

    if (country && localeMapByCountry[country]) {
      detectedLocale = localeMapByCountry[country];
    } else if (browserLang) {
      if (browserLang.startsWith("fr")) detectedLocale = "fr-fr";
      else if (browserLang.startsWith("ja")) detectedLocale = "ja-jp";
      else if (browserLang.startsWith("en")) detectedLocale = "en-us";
    }

    if (detectedLocale !== "en-us") {
      const redirectUrl = new URL(request.url);
      redirectUrl.searchParams.set("lang", detectedLocale);

      return Response.redirect(redirectUrl.toString(), 302);
    }
  }

  // Password protection
  if (hostname.includes("preview-blog.devcontentstackapps.com")) {
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

    const validUsername = "admin";
    const validPassword = "supra";

    if (username === validUsername && password === validPassword) {
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

    // check IP restriction
    if (!allowedIPs.includes(clientIP)) {
      return new Response("Access Denied: Author Tools - IP not allowed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // check OAuth SSO authentication
    const jwt = request.headers
      .get("Cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("jwt="))
      ?.split("=")[1];

    const clientSecret =
      env.OAUTH_CLIENT_SECRET || "rhCKwb_WgenLU705DZ3TQeYoKQAjuKR6";

    const isValidJWT = jwt && verifyJWT(jwt, clientSecret);

    if (!jwt || !isValidJWT) {
      const loginUrl = new URL("/login", request.url);
      return Response.redirect(loginUrl.toString(), 302);
    }
  }

  // OAuth callback handler
  if (pathname === "/oauth/callback") {
    const code = searchParams.get("code");
    if (!code) {
      return new Response("Authorization code not found", { status: 400 });
    }

    try {
      // Get environment variables with fallbacks
      const tokenUrl =
        env.OAUTH_TOKEN_URL ||
        "https://dev11-app.csnonprod.com/apps-api/apps/token";
      const clientId = env.OAUTH_CLIENT_ID || "VWNxorjEGDtTRCTb";
      const clientSecret =
        env.OAUTH_CLIENT_SECRET || "rhCKwb_WgenLU705DZ3TQeYoKQAjuKR6";
      const redirectUri =
        env.OAUTH_REDIRECT_URI ||
        "https://blog.devcontentstackapps.com/oauth/callback";

      // Exchange authorization code for tokens
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token exchange failed:", errorText);
        throw new Error(
          `Token exchange failed: ${tokenResponse.status} - ${errorText}`
        );
      }

      const tokenData = await tokenResponse.json();

      // simple session token with expiration
      const sessionData = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        exp: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
      };

      // Encode session data
      const sessionToken = btoa(JSON.stringify(sessionData));

      const redirectUrl = new URL("/author-tools", request.url).toString();

      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
          "Set-Cookie": `jwt=${sessionToken}; Path=/; Max-Age=${tokenData.expires_in || 3600}; SameSite=Lax`,
        },
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      return new Response("Authentication failed", { status: 500 });
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

  return response;
}
