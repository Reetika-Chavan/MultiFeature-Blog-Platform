export default async function handler(req, res) {
  try {
    const { path } = req.query; 

    const assetBaseUrl = `https://${process.env.ASSET_BASE_HOST}/v3/assets/bltb27c897eae5ed3fb`;

    const assetMap = {
      "blog.png": "blt940544a43af4e6be/blog.png",
    };

    const mappedPath = assetMap[path] || path;

    const url = `${assetBaseUrl}/${mappedPath}`;

    const searchParams = new URLSearchParams(req.query);
    const finalUrl = `${url}?${searchParams.toString()}`;

    const response = await fetch(finalUrl);

    if (!response.ok) {
      res.status(response.status).send("Error fetching asset");
      return;
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", response.headers.get("content-type"));
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
