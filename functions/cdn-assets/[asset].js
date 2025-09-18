export default function handler(req, res) {
  try {
    console.log("Asset proxy called with URL:", req.url);
    console.log("Asset name from params:", req.params.asset);

    // Get the asset name from the path parameter
    const assetName = req.params.asset;

    if (!assetName) {
      console.log("No asset name provided");
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
      console.log("Asset not found in map:", assetName);
      return res.status(404).send("Asset not found");
    }

    console.log("Found asset URL:", baseUrl);

    // For now, let's just return a simple response to test
    res.status(200).json({
      message: "Asset proxy is working",
      assetName: assetName,
      baseUrl: baseUrl,
      url: req.url,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Asset Proxy Error:", err);
    res.status(500).send("Internal Server Error");
  }
}
