/**
 * Simple utility to generate CDN asset URLs
 */

export function getCdnUrl(
  assetPath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    auto?: string;
  }
) {
  const url = new URL(assetPath, "/cdn-assets");

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}
