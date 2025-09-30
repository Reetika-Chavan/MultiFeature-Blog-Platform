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

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Launch automation for both environments
    const automationUrls = [
      {
        name: "Production",
        url: "https://dev11-app.csnonprod.com/automations-api/run/6783367e138a4c799daff5195c70df1b",
      },
      {
        name: "Default",
        url: "https://dev11-app.csnonprod.com/automations-api/run/5b75994e47e4483a9a7aeb07d92c51a0",
      },
    ];

    const automationPromises = automationUrls.map(async (automation) => {
      try {
        const response = await fetch(automation.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log(`${automation.name} automation triggered successfully`);
          return { name: automation.name, success: true };
        } else {
          console.error(
            `${automation.name} automation failed with status: ${response.status}`
          );
          return {
            name: automation.name,
            success: false,
            error: `HTTP ${response.status}`,
          };
        }
      } catch (error) {
        console.error(
          `Failed to trigger ${automation.name} automation:`,
          error
        );
        return {
          name: automation.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    try {
      const results = await Promise.all(automationPromises);
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      console.log(
        `Automation results: ${successful.length} successful, ${failed.length} failed`
      );
      if (failed.length > 0) {
        console.error("Failed automations:", failed);
      }
    } catch (error) {
      console.error("Error processing automation requests:", error);
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
