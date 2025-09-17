export default async function handler(req, res) {
  const { method, url } = req;
  const { host } = req.headers;
  const pathname = new URL(url, `http://${host}`).pathname;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // Only handle /cdnassets/ requests
  if (!pathname.startsWith("/cdnassets/") || !["GET", "HEAD"].includes(method)) {
    res.writeHead(404);
    return res.end("Not Found");
  }

  try {
    // Extract asset path (e.g. blog-cover.png)
    const assetPath = pathname.replace("/cdnassets/", "");
    if (!assetPath) {
      res.writeHead(400);
      return res.end("Asset path required");
    }

    // Map cdnassets file → Contentstack URL
    const assetMapping = {
      "blog.png": "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png",
      // Add more mappings here
    };

    const originalUrl = assetMapping[assetPath];
    if (!originalUrl) {
      res.writeHead(404);
      return res.end("Asset not found");
    }

    // Build Contentstack Image API URL with optimization params
    const searchParams = new URL(url, `http://${host}`).searchParams;
    let finalUrl = originalUrl;
    if ([...searchParams].length) {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => params.append(key, value));
      finalUrl = `https://images.contentstack.io/v3/assets?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
    }

    // Fetch the optimized image
    const response = await fetch(finalUrl, {
      method,
      headers: {
        "User-Agent": "CDN-Assets-Proxy/1.0",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      res.writeHead(404);
      return res.end("Asset not found");
    }

    // Stream the image response
    const buffer = Buffer.from(await response.arrayBuffer());
    res.writeHead(200, {
      "Content-Type": response.headers.get("content-type") || "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    });
    return res.end(buffer);
  } catch (error) {
    console.error("CDN proxy error:", error);
    res.writeHead(500);
    return res.end("Internal Server Error");
  }
}
