// functions/cdn-assets.js

export default async function handler(request, context) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/cdn-assets/");
    if (pathParts.length < 2) {
      return new Response("Invalid asset path", { status: 400 });
    }

    // Extract the requested asset name (e.g., blog.png)
    const assetKey = pathParts[1];

    // Build the Contentstack permanent asset URL
    // Replace with your actual base (stack-specific permanent domain)
    const contentstackBase =
      "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/";

    const targetUrl = `${contentstackBase}${assetKey}`;

    // Forward the request to Contentstack Image API (supports query params for optimization)
    const fetchUrl = new URL(targetUrl);

    // Append any query params (for optimization like width, height, quality, etc.)
    url.searchParams.forEach((value, key) => {
      fetchUrl.searchParams.set(key, value);
    });

    const response = await fetch(fetchUrl.toString());

    if (!response.ok) {
      return new Response("Failed to fetch asset", { status: response.status });
    }

    // Return the proxied response with same headers
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable", // long caching
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
