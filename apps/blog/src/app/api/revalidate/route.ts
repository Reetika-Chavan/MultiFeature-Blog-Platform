import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    if (!tag && !path) {
      return NextResponse.json(
        { error: "Either tag or path parameter is required" },
        { status: 400 }
      );
    }

    // Revalidate by tag if provided
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    // Revalidate by path if provided
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Also trigger the Launch automation for content updates
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
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error: error },
      { status: 500 }
    );
  }
}
