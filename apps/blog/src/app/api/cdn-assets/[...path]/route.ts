/**
 * CDN Assets API Route
 *
 * This API route handles requests to /cdn-assets/ and proxies them to Contentstack
 * with image optimization using the Contentstack Image Delivery API.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = params;

    if (!path || path.length === 0) {
      return new NextResponse("Invalid asset path", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Join the path segments to get the full asset path
    const assetPath = path.join("/");

    // Validate asset path for security
    if (!isValidAssetPath(assetPath)) {
      return new NextResponse("Invalid asset path", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Build the Contentstack permanent asset URL
    const contentstackBase =
      "https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/";
    const targetUrl = `${contentstackBase}${assetPath}`;

    // Create the fetch URL with Contentstack Image API parameters
    const fetchUrl = new URL(targetUrl);

    // Apply Contentstack Image Delivery API optimizations
    const imageParams = new URLSearchParams();

    // Copy optimization parameters from the request
    request.nextUrl.searchParams.forEach((value, key) => {
      // Validate and sanitize parameters
      if (isValidImageParam(key, value)) {
        imageParams.set(key, value);
      }
    });

    // Set default optimizations if no parameters provided
    if (imageParams.size === 0) {
      imageParams.set("auto", "webp"); // Auto-convert to WebP for better compression
      imageParams.set("quality", "85"); // Good quality with compression
    }

    // Apply parameters to fetch URL
    imageParams.forEach((value, key) => {
      fetchUrl.searchParams.set(key, value);
    });

    console.log(`Fetching optimized asset: ${fetchUrl.toString()}`);

    // Fetch the asset from Contentstack with optimizations
    const response = await fetch(fetchUrl.toString(), {
      headers: {
        "User-Agent": "Contentstack-CDN-Proxy/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch asset: ${response.status} ${response.statusText}`
      );
      return new NextResponse(`Asset not found or error: ${response.status}`, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Get content type from response or infer from file extension
    const contentType =
      response.headers.get("Content-Type") ||
      getContentTypeFromExtension(assetPath);

    // Get the response body
    const responseBody = await response.arrayBuffer();

    // Return the proxied response with optimized caching headers
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
        Vary: "Accept", // Vary on Accept header for format negotiation
        "X-Contentstack-CDN": "true", // Custom header to identify proxied content
        "X-Original-URL": targetUrl, // For debugging
        "Content-Length": responseBody.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("CDN Assets API Error:", error);
    return new NextResponse(
      `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }
}

/**
 * Validate Contentstack Image API parameters
 */
function isValidImageParam(key: string, value: string): boolean {
  const validParams = [
    "width",
    "height",
    "quality",
    "format",
    "auto",
    "crop",
    "fit",
    "dpr",
    "blur",
    "brightness",
    "contrast",
    "saturation",
    "hue",
    "gamma",
    "sharpen",
    "unsharp_mask",
    "strip",
    "progressive",
  ];

  if (!validParams.includes(key)) {
    return false;
  }

  // Basic validation for numeric parameters
  if (
    [
      "width",
      "height",
      "quality",
      "dpr",
      "brightness",
      "contrast",
      "saturation",
      "hue",
      "gamma",
    ].includes(key)
  ) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }

  return true;
}

/**
 * Get content type from file extension
 */
function getContentTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    txt: "text/plain",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Validate asset path for security
 */
function isValidAssetPath(assetPath: string): boolean {
  if (!assetPath || typeof assetPath !== "string") {
    return false;
  }

  // Check for path traversal attempts
  if (assetPath.includes("..") || assetPath.includes("//")) {
    return false;
  }

  // Check for valid file extension
  const validExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".pdf",
    ".mp4",
    ".mp3",
  ];
  const hasValidExtension = validExtensions.some((ext) =>
    assetPath.toLowerCase().endsWith(ext)
  );

  return hasValidExtension;
}
