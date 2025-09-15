import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = params;

    if (!path || path.length === 0) {
      return new NextResponse("Invalid asset path", { status: 400 });
    }

    const assetPath = path.join("/");

    // Basic security check
    if (assetPath.includes("..") || assetPath.includes("//")) {
      return new NextResponse("Invalid asset path", { status: 400 });
    }

    // Your Contentstack base URL
    const contentstackBase =
      "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/";
    const targetUrl = `${contentstackBase}${assetPath}`;

    // Build fetch URL with query parameters
    const fetchUrl = new URL(targetUrl);

    // Copy query parameters from request
    request.nextUrl.searchParams.forEach((value, key) => {
      fetchUrl.searchParams.set(key, value);
    });

    // Add default optimization if no params
    if (request.nextUrl.searchParams.size === 0) {
      fetchUrl.searchParams.set("auto", "webp");
      fetchUrl.searchParams.set("quality", "85");
    }

    const response = await fetch(fetchUrl.toString());

    if (!response.ok) {
      return new NextResponse("Asset not found", { status: response.status });
    }

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
