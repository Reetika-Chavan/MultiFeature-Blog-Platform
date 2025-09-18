import https from "https";
import http from "http";

export default async function handler(req, res) {
  try {
    // Extract asset name from the requested path
    // Example: /cdn-assets/blog-cover.png?w=400 → blog-cover.png
    const assetName = req.url.split("/cdn-assets/")[1]?.split("?")[0];
    console.log("Requested asset:", assetName);

    if (!assetName) {
      return res.status(400).send("Bad Request: Missing asset name");
    }

    // Map cdn-assets → actual Contentstack assets
    const assetMap = {
      "blog-cover.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "blog.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "hero-image.jpg":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "featured-image.png":
        "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
    };

    const baseUrl = assetMap[assetName];
    if (!baseUrl) {
      return res.status(404).send("Asset not found");
    }

    // Preserve query params (?w=400&fm=webp)
    const url = new URL(req.url, `https://${req.headers.host}`);
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;
    console.log("Proxy fetching:", finalUrl);

    // Pick correct client
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
      if (proxyRes.statusCode !== 200) {
        return res
          .status(proxyRes.statusCode)
          .send(`Error fetching asset: ${proxyRes.statusCode}`);
      }

      // Pass image headers
      res.setHeader(
        "Content-Type",
        proxyRes.headers["content-type"] || "application/octet-stream"
      );
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Stream back
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Asset Proxy Error:", err);
      res.status(500).send("Internal Server Error");
    });

    proxyReq.end();
  } catch (err) {
    console.error("Handler Error:", err);
    res.status(500).send("Internal Server Error");
  }
}
