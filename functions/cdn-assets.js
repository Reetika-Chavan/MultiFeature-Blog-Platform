export default async function onRequest(context) {
  const url = new URL(context.request.url);

  // Get the requested file from the path
  const requestedFile = url.pathname.replace("/cdn-assets/", "");
  console.log("Requested file:", requestedFile);

  // Map of friendly names → Contentstack permanent asset paths
  const assetMap = {
    "blog.png": "/blt940544a43af4e6be/blog.png", 
    // Add more here as needed
    // "hero.png": "/some-other-uid/hero.png",
  };

  const path = assetMap[requestedFile];

  if (!path) {
    console.error("Asset not found in assetMap:", requestedFile);
    return new Response(
      JSON.stringify({ error: "Asset not mapped", file: requestedFile }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Query params for resizing/formatting
  const width = url.searchParams.get("w") || "800";
  const format = url.searchParams.get("fm") || "webp";

  // Build final Contentstack URL
  const targetUrl = `${context.env.ASSET_BASE_URL}${path}?width=${width}&format=${format}`;
  console.log("Fetching asset from:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

    if (!response.ok) {
      console.error("Upstream asset fetch failed:", response.status, targetUrl);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch asset from Contentstack",
          status: response.status,
          url: targetUrl,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return the image response
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Cache-Control": response.headers.get("Cache-Control"),
      },
    });
  } catch (err) {
    console.error("Asset fetch error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
