import { processRedirects } from "../apps/blog/src/app/lib/redirects.js";
import { processRewrites } from "../apps/blog/src/app/lib/rewrites.js";
import { redirectsConfig } from "../apps/blog/src/app/lib/config.js";

export default async function handler(request, env) {
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

    if (!allowedIPs.includes(clientIP)) {
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

  const response = await fetch(request);

  return response;
}
