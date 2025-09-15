// /functions/cdn-assets.js

export default async function onRequest(context) {
  try {
    const reqUrl = new URL(context.request.url);
    const requestedPath = reqUrl.pathname.replace(/^\/cdn-assets\/?/, "");

    const assetBaseUrl = `https://${context.env.ASSET_BASE_HOST}/v3/assets/bltb27c897eae5ed3fb`;

    // Friendly map
    const assetMap = {
      "blog.png": "blt940544a43af4e6be/blog.png",
    };

    const mappedPath = assetMap[requestedPath] || requestedPath;
    const finalUrl = `${assetBaseUrl}/${mappedPath}${reqUrl.search}`;

    const upstreamRes = await fetch(finalUrl);

    if (!upstreamRes.ok) {
      return new Response(`Error fetching asset`, {
        status: upstreamRes.status,
      });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstreamRes.headers.get("content-type") || "application/octet-stream"
    );
    headers.set(
      "Cache-Control",
      upstreamRes.headers.get("cache-control") ||
        "public, max-age=31536000, immutable"
    );

    return new Response(upstreamRes.body, { status: 200, headers });
  } catch (err) {
    console.error("cdn-assets error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
