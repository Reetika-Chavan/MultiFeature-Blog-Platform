export default async function handler(request, response) {
  try {
    console.log("CDN Assets function called");
    console.log("Request URL:", request.url);
    console.log("Request params:", request.params);
    
    const assetName = request.params.asset;
    console.log("Asset name from params:", assetName);

    if (!assetName) {
      console.log("No asset name provided");
      return response.status(400).json({ 
        error: "Bad Request: Missing asset name" 
      });
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
      return response.status(404).json({
        error: "Asset not found",
        requestedAsset: assetName,
        availableAssets: Object.keys(assetMap),
      });
    }

    // Build final URL with query parameters for Contentstack Image API
    const query = request.query;
    const queryString = new URLSearchParams(query).toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    console.log("Proxy fetching:", finalUrl);
    
    // Add default optimization parameters if none provided
    let optimizedUrl = finalUrl;
    if (!queryString) {
      // Add default optimization parameters
      const defaultParams = new URLSearchParams({
        format: "webp",
        quality: "80",
      });
      optimizedUrl = `${baseUrl}?${defaultParams.toString()}`;
      console.log("Using optimized URL:", optimizedUrl);
    }

    // Fetch from Contentstack using Fetch API
    const fetchResponse = await fetch(optimizedUrl);
    
    console.log("Proxy response status:", fetchResponse.status);
    console.log("Proxy response headers:", Object.fromEntries(fetchResponse.headers.entries()));

    if (!fetchResponse.ok) {
      console.log("Failed to fetch asset:", fetchResponse.status);
      return response.status(fetchResponse.status).json({
        error: "Error fetching asset",
        statusCode: fetchResponse.status,
        assetUrl: optimizedUrl,
      });
    }

    // Get the response body
    const responseBody = await fetchResponse.arrayBuffer();
    
    // Set appropriate headers
    const contentType = fetchResponse.headers.get("content-type") || "application/octet-stream";
    console.log("Setting content type:", contentType);

    // Set headers using Node.js response object
    response.setHeader("Content-Type", contentType);
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    response.setHeader("Access-Control-Allow-Origin", "*");

    // Copy other relevant headers from the original response
    if (fetchResponse.headers.get("content-length")) {
      response.setHeader("Content-Length", fetchResponse.headers.get("content-length"));
    }

    // Send the response body
    response.status(fetchResponse.status).send(Buffer.from(responseBody));

  } catch (err) {
    console.error("Handler error:", err);
    response.status(500).json({
      error: "Internal Server Error",
      details: err.message,
      stack: err.stack,
    });
  }
}