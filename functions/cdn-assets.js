export default async function onRequest(context) {
  try {
    const reqUrl = new URL(context.request.url);
    const requestedPath = reqUrl.pathname.replace(/^\/cdn-assets\/?/, "");

    // Your Contentstack base URL
    const contentstackBase =
      "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/";
    const targetUrl = `${contentstackBase}${requestedPath}`;

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

    const response = await fetch(fetchUrl.toString());

    if (!response.ok) {
      return new Response("Asset not found", { status: response.status });
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
    return new Response("Error", { status: 500 });
  }
}
