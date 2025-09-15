export default async function onRequest(context) {
  try {
    console.log("CDN Assets function called");
    const reqUrl = new URL(context.request.url);
    console.log("Request URL:", reqUrl.toString());
    console.log("Pathname:", reqUrl.pathname);

    const requestedPath = reqUrl.pathname.replace(/^\/cdn-assets\/?/, "");
    console.log("Requested path:", requestedPath);

    // Your Contentstack base URL
    const contentstackBase =
      "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/";
    const targetUrl = `${contentstackBase}${requestedPath}`;
    console.log("Target URL:", targetUrl);

    // Build fetch URL with query parameters
    const fetchUrl = new URL(targetUrl);

    // Copy query parameters from request
    reqUrl.searchParams.forEach((value, key) => {
      fetchUrl.searchParams.set(key, value);
    });

    // Add default optimization if no params
    if (reqUrl.searchParams.size === 0) {
      fetchUrl.searchParams.set("auto", "webp");
      fetchUrl.searchParams.set("quality", "85");
    }

    console.log("Final fetch URL:", fetchUrl.toString());
    const response = await fetch(fetchUrl.toString());
    console.log("Fetch response status:", response.status);

    if (!response.ok) {
      console.log("Asset not found, status:", response.status);
      return new Response(`Asset not found: ${response.status}`, {
        status: response.status,
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("CDN Assets Error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
