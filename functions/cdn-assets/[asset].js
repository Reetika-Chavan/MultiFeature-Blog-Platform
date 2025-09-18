import https from "https";
import http from "http";

export default function handler(req, res) {
  try {
    console.log("Asset proxy called with URL:", req.url);
    console.log("Asset name from params:", req.params.asset);

    const assetName = req.params.asset;

    if (!assetName) {
      console.log("No asset name provided");
      return res.status(400).send("Bad Request: Missing asset name");
    }

    // Asset mapping with the correct Contentstack Image API URL
    const assetMap = {
      "blog-cover.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "blog.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
    };

    const baseUrl = assetMap[assetName.split("?")[0]];
    if (!baseUrl) {
      console.log("Asset not found in map:", assetName);
      return res.status(404).send("Asset not found");
    }

    console.log("Found asset URL:", baseUrl);

    // Preserve query parameters for Contentstack Image API optimization
    const url = new URL(req.url, `https://${req.headers.host}`);
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;

    console.log("Proxy fetching:", finalUrl);

    // Use Node.js built-in modules to fetch the image
    const targetUrl = new URL(finalUrl);
    const isHttps = targetUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: "GET",
      headers: {
        Accept: "image/*",
        "User-Agent": "Contentstack-Asset-Proxy/1.0",
      },
    };

    const proxyReq = client.request(options, (proxyRes) => {
      console.log("Proxy response status:", proxyRes.statusCode);

      if (proxyRes.statusCode !== 200) {
        console.log("Failed to fetch asset:", proxyRes.statusCode);
        return res.status(proxyRes.statusCode).send("Error fetching asset");
      }

      // Set appropriate headers for image serving
      res.setHeader(
        "Content-Type",
        proxyRes.headers["content-type"] || "application/octet-stream"
      );
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Pipe the response directly to the client
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Asset Proxy Error:", err);
      res.status(500).send("Internal Server Error");
    });

    proxyReq.end();
  } catch (err) {
    console.error("Asset Proxy Error:", err);
    res.status(500).send("Internal Server Error");
  }
}
