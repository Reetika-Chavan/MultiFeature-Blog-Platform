export default async function handler(request) {
  const url = new URL(request.url);

  const assetPath = url.pathname.replace("/cdn-assets/", "");

  if (!assetPath) {
    return new Response("Asset not found", { status: 404 });
  }

  const contentstackBase =
    "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb";
  const contentstackAssetUrl = `${contentstackBase}/${assetPath}`;

  const params = new URLSearchParams(url.search);
  if (!params.has("quality")) {
    params.set("quality", "80"); 
  }
  const optimizedUrl = `${contentstackAssetUrl}?${params.toString()}`;

  const response = await fetch(optimizedUrl);

  if (!response.ok) {
    return new Response("Failed to fetch asset", { status: 500 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
