import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    if (tag) {
      // Revalidate by tag
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    if (path) {
      // Revalidate by path
      revalidateTag(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Also trigger the Launch automation
    try {
      await fetch(
        "https://dev11-app.csnonprod.com/automations-api/run/6783367e138a4c799daff5195c70df1b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Launch automation triggered successfully");
    } catch (error) {
      console.error("Failed to trigger Launch automation:", error);
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tag: tag || null,
      path: path || null,
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { message: "Error revalidating", error: err },
      { status: 500 }
    );
  }
}
