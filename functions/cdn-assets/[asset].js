import https from "https";

export default async function handler(req, res, context) {
  try {
    console.log("Asset proxy called with URL:", req.url);
    console.log("Request method:", req.method);

    // Extract asset name from URL path - works reliably across different runtimes
    const requestUrl = new URL(req.url, `https://${req.headers.host}`);
    const pathParts = requestUrl.pathname.split("/");
    const assetName = pathParts[pathParts.length - 1]; // Get the last part of the path

    console.log("Extracted assetName:", assetName);
    console.log("Full pathname:", requestUrl.pathname);

    if (!assetName || assetName === "cdn-assets") {
      console.log("No asset name provided or invalid path");
      return res.status(400).json({ error: "Bad Request: Missing asset name" });
    }

    // Map cdn-assets → Contentstack Delivery URLs
    const assetMap = {
      "blog-cover.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "blog.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
    };

    const baseUrl = assetMap[assetName];
    if (!baseUrl) {
      console.log("Asset not found in map:", assetName);
      console.log("Available assets:", Object.keys(assetMap));
      return res.status(404).json({
        error: "Asset not found",
        requestedAsset: assetName,
        availableAssets: Object.keys(assetMap),
      });
    }

    // Preserve query string (?w=400&fm=webp etc.)
    const url = new URL(req.url, `https://${req.headers.host}`);
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;
    console.log("Proxy fetching:", finalUrl);

    // Fetch from Contentstack
    https
      .get(finalUrl, (proxyRes) => {
        console.log("Proxy response status:", proxyRes.statusCode);
        console.log(
          "Proxy response headers:",
          JSON.stringify(proxyRes.headers, null, 2)
        );

        if (proxyRes.statusCode !== 200) {
          console.log("Failed to fetch asset:", proxyRes.statusCode);
          return res.status(proxyRes.statusCode).json({
            error: "Error fetching asset",
            statusCode: proxyRes.statusCode,
            assetUrl: finalUrl,
          });
        }

        // Set headers for images
        const contentType =
          proxyRes.headers["content-type"] || "application/octet-stream";
        console.log("Setting content type:", contentType);

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Stream back to client
        proxyRes.pipe(res);
      })
      .on("error", (err) => {
        console.error("Proxy error:", err);
        res.status(500).json({
          error: "Internal Server Error",
          details: err.message,
          assetUrl: finalUrl,
        });
      });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
      stack: err.stack,
    });
  }
}
