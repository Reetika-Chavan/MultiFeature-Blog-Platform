import https from "https";

export default async function handler(req, res, context) {
  try {
    // Get the dynamic asset param from the request path
    const assetName = context.params.asset;
    console.log("Extracted assetName:", assetName);

    if (!assetName) {
      return res.status(400).send("Bad Request: Missing asset name");
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
      return res.status(404).send("Asset not found");
    }

    // Preserve query string (?w=400&fm=webp etc.)
    const url = new URL(req.url, `https://${req.headers.host}`);
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;
    console.log("Proxy fetching:", finalUrl);

    // Fetch from Contentstack
    https
      .get(finalUrl, (proxyRes) => {
        if (proxyRes.statusCode !== 200) {
          return res
            .status(proxyRes.statusCode)
            .send(`Error fetching asset: ${proxyRes.statusCode}`);
        }

        // Set headers for images
        res.setHeader(
          "Content-Type",
          proxyRes.headers["content-type"] || "application/octet-stream"
        );
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Stream back to client
        proxyRes.pipe(res);
      })
      .on("error", (err) => {
        console.error("Proxy error:", err);
        res.status(500).send("Internal Server Error");
      });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).send("Internal Server Error");
  }
}
