export default async function onRequest(context) {
  const url = new URL(context.request.url);

  const requestedFile = url.pathname.replace("/cdn-assets/", "");

  const assetMap = {
    "blog.png": "/blt940544a43af4e6be/68c29d65937d0a38a6a8dbe8/blog.png",
  };

  const path = assetMap[requestedFile];

  if (!path) {
    return new Response("Asset not found", { status: 404 });
  }

  const width = url.searchParams.get("w") || "800";
  const format = url.searchParams.get("fm") || "webp";

  const targetUrl = `${context.env.ASSET_BASE_URL}${path}?width=${width}&format=${format}`;

  const response = await fetch(targetUrl, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type"),
      "Cache-Control": response.headers.get("Cache-Control"),
    },
  });
}
