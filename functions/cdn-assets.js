export default async function onRequest(context) {
  const url = new URL(context.request.url);

  const requestedFile = url.pathname.replace("/cdn-assets/", "");

  const assetMap = {
  "blog.png": "/blt940544a43af4e6be/blog.png", 
};

  const path = assetMap[requestedFile];
  if (!path) {
    return new Response("Asset not found", { status: 404 });
  }

  const queryString = url.searchParams.toString();
  const targetUrl = `${context.env.ASSET_BASE_URL}${path}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(targetUrl);

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type"),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
