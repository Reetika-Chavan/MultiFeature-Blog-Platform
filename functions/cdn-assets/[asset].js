export default function handler(req, res) {
  try {
    // Get the asset name from the path parameter
    const assetName = req.params.asset;

    if (!assetName) {
      return res.status(400).send("Bad Request: Missing asset name");
    }

    // Asset mapping - you can expand this or make it dynamic
    const assetMap = {
      "blog-cover.png":
        "https://images.contentstack.io/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      "blog.png":
        "https://images.contentstack.io/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      // Add more assets as needed
    };

    const baseUrl = assetMap[assetName.split("?")[0]];
    if (!baseUrl) {
      return res.status(404).send("Asset not found");
    }

    // Preserve query parameters for Contentstack Image API optimization
    const url = new URL(req.url, `https://${req.headers.host}`);
    const query = url.search || "";
    const finalUrl = `${baseUrl}${query}`;

    console.log("Proxy fetching:", finalUrl);

    // Fetch the asset
    fetch(finalUrl, {
      method: "GET",
      headers: { Accept: "image/*" },
    })
      .then((response) => {
        if (!response.ok) {
          return res.status(response.status).send("Error fetching asset");
        }

        // Set appropriate headers
        res.setHeader(
          "Content-Type",
          response.headers.get("content-type") || "application/octet-stream"
        );
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");

        return response.arrayBuffer();
      })
      .then((buffer) => {
        res.send(Buffer.from(buffer));
      })
      .catch((err) => {
        console.error("Asset Proxy Error:", err);
        res.status(500).send("Internal Server Error");
      });
  } catch (err) {
    console.error("Asset Proxy Error:", err);
    res.status(500).send("Internal Server Error");
  }
}
