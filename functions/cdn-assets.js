// functions/cdn-assets.js

export default async function handler(request, context) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/cdn-assets/");

    if (pathParts.length < 2) {
      return new Response("Invalid asset path", { status: 400 });
    }

    const assetKey = pathParts[1];

    // Basic security check
    if (!assetKey || assetKey.includes("..") || assetKey.includes("//")) {
      return new Response("Invalid asset key", { status: 400 });
    }

    // Your Contentstack base URL
    const contentstackBase =
      "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/";
    const targetUrl = `${contentstackBase}${assetKey}`;

    // Build fetch URL with query parameters
    const fetchUrl = new URL(targetUrl);

    // Copy query parameters from request
    url.searchParams.forEach((value, key) => {
      fetchUrl.searchParams.set(key, value);
    });

    // Add default optimization if no params
    if (url.searchParams.size === 0) {
      fetchUrl.searchParams.set("auto", "webp");
      fetchUrl.searchParams.set("quality", "85");
    }

    const response = await fetch(fetchUrl.toString());

    if (!response.ok) {
      return new Response("Asset not found", { status: response.status });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
