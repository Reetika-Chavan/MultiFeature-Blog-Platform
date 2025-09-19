import { NextResponse } from "next/server";
import { getGenerativeBlogPost } from "@/app/lib/contentstack";
import { detectLocale } from "@/app/lib/detectLocale";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || (await detectLocale());

  let entry = await getGenerativeBlogPost(lang);
  if (!entry && lang !== "en-us") {
    entry = await getGenerativeBlogPost("en-us");
  }

  if (!entry) {
    return NextResponse.json(
      { error: "Failed to load blog post" },
      { status: 500 }
    );
  }

  const response = NextResponse.json(entry);

  // Set cache headers according to Contentstack Launch best practices
  response.headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=40, stale-while-revalidate=60"
  );

  return response;
}
