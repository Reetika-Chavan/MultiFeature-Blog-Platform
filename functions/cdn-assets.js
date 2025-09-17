// functions/cdn-assets.js

export default async function handler(req, res) {
  try {
    // Remove the /cdn-assets/ prefix
    const assetPath = req.url.replace(/^\/cdn-assets\//, "");

    if (!assetPath) {
      return res.status(400).send("Bad Request: Missing asset path");
    }

    // Map filenames to their Contentstack Delivery API URLs
    const assetMap = {
      "blog.png":
        "https://images.contentstack.io/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      // add more mappings if needed
    };

    const baseUrl = assetMap[assetPath.split("?")[0]];
    if (!baseUrl) {
      return res.status(404).send("Asset not found");
    }

    // Keep query params (w, h, fm, quality, etc.)
    const url = new URL(req.url, `https://${req.headers.host}`);
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;

    console.log("Proxy fetching:", finalUrl);

    // Fetch from Contentstack Delivery API
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: { Accept: "image/*" },
    });

    if (!response.ok) {
      return res.status(response.status).send("Error fetching asset");
    }

    // Set headers and stream response
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("CDN Proxy Error:", err);
    res.status(500).send("Internal Server Error");
  }
}
