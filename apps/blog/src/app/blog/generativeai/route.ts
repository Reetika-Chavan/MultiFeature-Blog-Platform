import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // This route only sets cache headers for the generativeai page
  // The actual page content is served by page.tsx

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=40, s-maxage=40",
      "CDN-Cache-Control": "max-age=40",
    },
  });
}
