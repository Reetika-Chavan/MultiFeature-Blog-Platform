export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only handle /cdn-assets/ requests
  if (
    !pathname.startsWith("/cdn-assets/") ||
    !["GET", "HEAD"].includes(request.method)
  ) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const assetPath = pathname.replace("/cdn-assets/", "");

    if (!assetPath) {
      return new Response("Asset path required", { status: 400 });
    }

    // Map asset names to Contentstack URLs
    const assetMapping = {
      "blog-cover.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      // Add more assets here
    };

    const originalUrl = assetMapping[assetPath];

    if (!originalUrl) {
      return new Response("Asset not found", { status: 404 });
    }

    // Build Contentstack Image API URL with optimization parameters
    let finalUrl = originalUrl;
    const searchParams = url.searchParams;

    if (searchParams.toString()) {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });
      finalUrl = `https://images.contentstack.io/v3/assets?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
    }

    // Fetch the optimized image
    const response = await fetch(finalUrl, {
      method: request.method,
      headers: {
        "User-Agent": "CDN-Assets-Proxy/1.0",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return new Response("Asset not found", { status: 404 });
    }

    // Return the image with proper headers
    const imageData = await response.arrayBuffer();

    return new Response(imageData, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("CDN proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config = {
  runtime: "edge",
};
