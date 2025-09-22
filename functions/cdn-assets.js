export default async function handler(request, env) {
  try {
    console.log("CDN Assets function called");
    console.log("Request URL:", request.url);
    
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract asset name from path like /cdn-assets/blog.png
    const pathParts = pathname.split("/");
    const assetName = pathParts[pathParts.length - 1];
    
    console.log("Asset name from path:", assetName);

    if (!assetName || assetName === "cdn-assets") {
      console.log("No asset name provided or invalid path");
      return new Response(
        JSON.stringify({ error: "Bad Request: Missing asset name" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Map cdn-assets to Contentstack URLs
    const assetMap = {
      "blog.png": "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "blog-cover.png": "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
    };

    console.log("Asset map:", assetMap);
    console.log("Looking for asset:", assetName);

    const baseUrl = assetMap[assetName];
    console.log("Found base URL:", baseUrl);

    if (!baseUrl) {
      console.log("Asset not found in map:", assetName);
      console.log("Available assets:", Object.keys(assetMap));
      return new Response(
        JSON.stringify({
          error: "Asset not found",
          requestedAsset: assetName,
          availableAssets: Object.keys(assetMap),
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build final URL with query parameters for Contentstack Image API
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;
    console.log("Proxy fetching:", finalUrl);
    
    // Add default optimization parameters if none provided
    let optimizedUrl = finalUrl;
    if (!query) {
      // Add default optimization parameters
      const defaultParams = new URLSearchParams({
        format: "webp",
        quality: "80",
      });
      optimizedUrl = `${baseUrl}?${defaultParams.toString()}`;
      console.log("Using optimized URL:", optimizedUrl);
    }

    // Fetch from Contentstack using Fetch API
    const response = await fetch(optimizedUrl);
    
    console.log("Proxy response status:", response.status);
    console.log(
      "Proxy response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      console.log("Failed to fetch asset:", response.status);
      return new Response(
        JSON.stringify({
          error: "Error fetching asset",
          statusCode: response.status,
          assetUrl: optimizedUrl,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the response body
    const responseBody = await response.arrayBuffer();
    
    // Set appropriate headers
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    console.log("Setting content type:", contentType);

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    });

    // Copy other relevant headers from the original response
    if (response.headers.get("content-length")) {
      headers.set("Content-Length", response.headers.get("content-length"));
    }

    return new Response(responseBody, {
      status: response.status,
      headers: headers,
    });

  } catch (err) {
    console.error("Handler error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: err.message,
        stack: err.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}