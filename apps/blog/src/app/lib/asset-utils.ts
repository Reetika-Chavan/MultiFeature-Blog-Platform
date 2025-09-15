/**
 * Asset Utilities for Contentstack CDN Integration
 *
 * This module provides utilities for generating optimized asset URLs
 * using the Contentstack Image Delivery API through our CDN proxy.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "gif" | "auto";
  auto?: "webp" | "compress" | "enhance";
  crop?: "maintain_ratio" | "fill" | "scale" | "fit";
  fit?: "bounds" | "crop" | "maintain_ratio";
  dpr?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  gamma?: number;
  sharpen?: boolean;
  strip?: boolean;
  progressive?: boolean;
}

export interface AssetUrlOptions extends ImageOptimizationOptions {
  baseUrl?: string;
  fallbackFormat?: string;
}

/**
 * Generate an optimized asset URL using the CDN proxy
 *
 * @param assetPath - The asset filename (e.g., 'blog-cover.png')
 * @param options - Image optimization options
 * @returns Optimized asset URL
 *
 * @example
 * ```typescript
 * // Basic usage
 * const url = getAssetUrl('blog-cover.png');
 *
 * // With optimization
 * const optimizedUrl = getAssetUrl('blog-cover.png', {
 *   width: 800,
 *   height: 600,
 *   format: 'webp',
 *   quality: 85
 * });
 *
 * // Responsive image with DPR
 * const responsiveUrl = getAssetUrl('hero-image.jpg', {
 *   width: 1200,
 *   dpr: 2,
 *   auto: 'webp'
 * });
 * ```
 */
export function getAssetUrl(
  assetPath: string,
  options: AssetUrlOptions = {}
): string {
  const { baseUrl = "/cdn-assets", ...imageOptions } = options;

  // Clean the asset path
  const cleanPath = assetPath.replace(/^\//, ""); // Remove leading slash

  // Build the base URL
  const url = new URL(cleanPath, baseUrl);

  // Add optimization parameters
  Object.entries(imageOptions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Generate responsive image URLs for different screen sizes
 *
 * @param assetPath - The asset filename
 * @param breakpoints - Array of width breakpoints
 * @param options - Additional optimization options
 * @returns Object with breakpoint URLs
 *
 * @example
 * ```typescript
 * const responsiveUrls = getResponsiveAssetUrls('hero-image.jpg', [400, 800, 1200], {
 *   height: 600,
 *   format: 'webp',
 *   quality: 85
 * });
 *
 * // Usage in JSX
 * <picture>
 *   <source media="(max-width: 400px)" srcSet={responsiveUrls[400]} />
 *   <source media="(max-width: 800px)" srcSet={responsiveUrls[800]} />
 *   <img src={responsiveUrls[1200]} alt="Hero image" />
 * </picture>
 * ```
 */
export function getResponsiveAssetUrls(
  assetPath: string,
  breakpoints: number[],
  options: AssetUrlOptions = {}
): Record<number, string> {
  const urls: Record<number, string> = {};

  breakpoints.forEach((width) => {
    urls[width] = getAssetUrl(assetPath, {
      ...options,
      width,
      auto: options.auto || "webp",
    });
  });

  return urls;
}

/**
 * Generate a srcSet string for responsive images
 *
 * @param assetPath - The asset filename
 * @param breakpoints - Array of width breakpoints
 * @param options - Additional optimization options
 * @returns srcSet string
 *
 * @example
 * ```typescript
 * const srcSet = getSrcSet('hero-image.jpg', [400, 800, 1200], {
 *   height: 600,
 *   format: 'webp'
 * });
 *
 * // Usage in JSX
 * <img
 *   src={getAssetUrl('hero-image.jpg', { width: 800 })}
 *   srcSet={srcSet}
 *   sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
 *   alt="Hero image"
 * />
 * ```
 */
export function getSrcSet(
  assetPath: string,
  breakpoints: number[],
  options: AssetUrlOptions = {}
): string {
  return breakpoints
    .map((width) => {
      const url = getAssetUrl(assetPath, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Generate optimized asset URLs for different formats
 *
 * @param assetPath - The asset filename
 * @param formats - Array of formats to generate
 * @param options - Additional optimization options
 * @returns Object with format URLs
 *
 * @example
 * ```typescript
 * const formatUrls = getFormatUrls('hero-image.jpg', ['webp', 'jpeg'], {
 *   width: 800,
 *   height: 600,
 *   quality: 85
 * });
 *
 * // Usage in JSX
 * <picture>
 *   <source srcSet={formatUrls.webp} type="image/webp" />
 *   <img src={formatUrls.jpeg} alt="Hero image" />
 * </picture>
 * ```
 */
export function getFormatUrls(
  assetPath: string,
  formats: string[],
  options: AssetUrlOptions = {}
): Record<string, string> {
  const urls: Record<string, string> = {};

  formats.forEach((format) => {
    urls[format] = getAssetUrl(assetPath, {
      ...options,
      format: format as any,
    });
  });

  return urls;
}

/**
 * Generate a complete responsive picture element configuration
 *
 * @param assetPath - The asset filename
 * @param breakpoints - Array of width breakpoints
 * @param formats - Array of formats to support
 * @param options - Additional optimization options
 * @returns Complete picture configuration
 *
 * @example
 * ```typescript
 * const pictureConfig = getPictureConfig('hero-image.jpg', [400, 800, 1200], ['webp', 'jpeg'], {
 *   height: 600,
 *   quality: 85
 * });
 *
 * // Usage in JSX
 * <picture>
 *   {pictureConfig.sources.map((source, index) => (
 *     <source key={index} {...source} />
 *   ))}
 *   <img src={pictureConfig.fallback} alt="Hero image" />
 * </picture>
 * ```
 */
export function getPictureConfig(
  assetPath: string,
  breakpoints: number[],
  formats: string[],
  options: AssetUrlOptions = {}
) {
  const sources: Array<{ srcSet: string; media?: string; type?: string }> = [];

  // Generate format-specific sources
  formats.forEach((format) => {
    const srcSet = getSrcSet(assetPath, breakpoints, {
      ...options,
      format: format as any,
    });

    sources.push({
      srcSet,
      type: `image/${format}`,
    });
  });

  // Generate responsive sources for the primary format
  const primaryFormat = formats[0] || "jpeg";
  breakpoints.forEach((width, index) => {
    if (index < breakpoints.length - 1) {
      const media = `(max-width: ${width}px)`;
      const srcSet = getAssetUrl(assetPath, {
        ...options,
        width,
        format: primaryFormat as any,
      });

      sources.push({
        srcSet,
        media,
      });
    }
  });

  const fallback = getAssetUrl(assetPath, {
    ...options,
    width: breakpoints[breakpoints.length - 1],
    format: primaryFormat as any,
  });

  return {
    sources,
    fallback,
  };
}

/**
 * Validate asset path for security
 *
 * @param assetPath - The asset path to validate
 * @returns True if valid, false otherwise
 */
export function isValidAssetPath(assetPath: string): boolean {
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

/**
 * Extract asset filename from Contentstack asset URL
 *
 * @param contentstackUrl - Full Contentstack asset URL
 * @returns Asset filename or null if invalid
 *
 * @example
 * ```typescript
 * const filename = extractAssetFilename(
 *   'https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png'
 * );
 * // Returns: 'blog.png'
 * ```
 */
export function extractAssetFilename(contentstackUrl: string): string | null {
  try {
    const url = new URL(contentstackUrl);
    const pathParts = url.pathname.split("/");
    const filename = pathParts[pathParts.length - 1];

    return isValidAssetPath(filename) ? filename : null;
  } catch {
    return null;
  }
}

/**
 * Convert Contentstack asset URL to CDN proxy URL
 *
 * @param contentstackUrl - Full Contentstack asset URL
 * @param options - Optimization options
 * @returns CDN proxy URL
 *
 * @example
 * ```typescript
 * const cdnUrl = convertToCdnUrl(
 *   'https://dev11-images.csnonprod.com/v3/assets/bltb27c897eae5ed3fb/blt940544a43af4e6be/blog.png',
 *   { width: 800, format: 'webp' }
 * );
 * // Returns: '/cdn-assets/blog.png?width=800&format=webp'
 * ```
 */
export function convertToCdnUrl(
  contentstackUrl: string,
  options: AssetUrlOptions = {}
): string | null {
  const filename = extractAssetFilename(contentstackUrl);
  return filename ? getAssetUrl(filename, options) : null;
}
