/**
 * OptimizedImage Component
 *
 * A React component that provides optimized image loading using Contentstack's
 * Image Delivery API through our CDN proxy. Supports responsive images,
 * multiple formats, and automatic optimization.
 */

import React, { useState, useCallback } from "react";
import {
  getAssetUrl,
  getPictureConfig,
  getResponsiveAssetUrls,
  ImageOptimizationOptions,
} from "../lib/asset-utils";

export interface OptimizedImageProps {
  /** Asset filename (e.g., 'blog-cover.png') */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image optimization options */
  options?: ImageOptimizationOptions;
  /** Responsive breakpoints */
  breakpoints?: number[];
  /** Supported formats (default: ['webp', 'jpeg']) */
  formats?: string[];
  /** CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Loading state */
  loading?: "lazy" | "eager";
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Fallback image URL */
  fallbackSrc?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Whether to use picture element for format support */
  usePicture?: boolean;
  /** Whether to use srcSet for responsive images */
  useSrcSet?: boolean;
}

/**
 * OptimizedImage Component
 *
 * Provides optimized image loading with automatic format selection,
 * responsive sizing, and Contentstack Image API integration.
 */
export default function OptimizedImage({
  src,
  alt,
  options = {},
  breakpoints = [400, 800, 1200],
  formats = ["webp", "jpeg"],
  className,
  style,
  loading = "lazy",
  sizes,
  fallbackSrc,
  onLoad,
  onError,
  usePicture = true,
  useSrcSet = true,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  // Generate responsive URLs
  const responsiveUrls = getResponsiveAssetUrls(src, breakpoints, options);

  // Generate format URLs
  const formatUrls = formats.reduce(
    (acc, format) => {
      acc[format] = getAssetUrl(src, { ...options, format: format as any });
      return acc;
    },
    {} as Record<string, string>
  );

  // Generate picture configuration
  const pictureConfig = getPictureConfig(src, breakpoints, formats, options);

  // Generate srcSet string
  const srcSet = breakpoints
    .map((width) => `${responsiveUrls[width]} ${width}w`)
    .join(", ");

  // Default sizes if not provided
  const defaultSizes =
    sizes ||
    `(max-width: ${breakpoints[0]}px) ${breakpoints[0]}px, (max-width: ${breakpoints[1]}px) ${breakpoints[1]}px, ${breakpoints[2]}px`;

  // Fallback to original src or fallbackSrc on error
  const finalSrc =
    imageError && fallbackSrc ? fallbackSrc : getAssetUrl(src, options);

  // Simple image without picture/srcSet
  if (!usePicture && !useSrcSet) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  // Picture element with format support
  if (usePicture) {
    return (
      <picture className={className} style={style}>
        {/* WebP source */}
        {formats.includes("webp") && (
          <source
            srcSet={useSrcSet ? srcSet : formatUrls.webp}
            type="image/webp"
            sizes={useSrcSet ? defaultSizes : undefined}
          />
        )}

        {/* JPEG fallback */}
        {formats.includes("jpeg") && (
          <source
            srcSet={useSrcSet ? srcSet : formatUrls.jpeg}
            type="image/jpeg"
            sizes={useSrcSet ? defaultSizes : undefined}
          />
        )}

        {/* PNG fallback */}
        {formats.includes("png") && (
          <source
            srcSet={useSrcSet ? srcSet : formatUrls.png}
            type="image/png"
            sizes={useSrcSet ? defaultSizes : undefined}
          />
        )}

        {/* Fallback img element */}
        <img
          src={finalSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>
    );
  }

  // Standard img with srcSet
  return (
    <img
      src={finalSrc}
      srcSet={srcSet}
      sizes={defaultSizes}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

/**
 * Blog Cover Image Component
 *
 * Specialized component for blog cover images with common optimizations
 */
export function BlogCoverImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  ...props
}: Omit<OptimizedImageProps, "options"> & {
  width?: number;
  height?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      options={{
        width,
        height,
        format: "webp",
        quality: 85,
        auto: "webp",
        crop: "maintain_ratio",
      }}
      breakpoints={[400, 600, 800, 1200]}
      formats={["webp", "jpeg"]}
      className={className}
      {...props}
    />
  );
}

/**
 * Hero Image Component
 *
 * Specialized component for hero images with full-width optimizations
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, "options" | "breakpoints">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      options={{
        format: "webp",
        quality: 90,
        auto: "webp",
        crop: "maintain_ratio",
      }}
      breakpoints={[600, 900, 1200, 1600, 1920]}
      formats={["webp", "jpeg"]}
      sizes="100vw"
      className={className}
      {...props}
    />
  );
}

/**
 * Thumbnail Image Component
 *
 * Specialized component for small thumbnail images
 */
export function ThumbnailImage({
  src,
  alt,
  size = 150,
  className,
  ...props
}: Omit<OptimizedImageProps, "options"> & {
  size?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      options={{
        width: size,
        height: size,
        format: "webp",
        quality: 80,
        auto: "webp",
        crop: "fill",
      }}
      breakpoints={[size]}
      formats={["webp", "jpeg"]}
      usePicture={false}
      useSrcSet={false}
      className={className}
      {...props}
    />
  );
}
