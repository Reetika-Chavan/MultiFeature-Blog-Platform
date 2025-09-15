/**
 * CDN Assets Test Page
 *
 * This page demonstrates the CDN assets proxy functionality with various
 * optimization options and the provided blog.png asset.
 */

import React from "react";
import {
  OptimizedImage,
  BlogCoverImage,
  HeroImage,
  ThumbnailImage,
} from "../components/OptimizedImage";
import {
  getAssetUrl,
  getResponsiveAssetUrls,
  getSrcSet,
} from "../lib/asset-utils";

export default function TestCDNPage() {
  const testAsset = "blog.png"; // The asset from your Contentstack URL

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Contentstack CDN Assets Test
        </h1>

        <div className="space-y-12">
          {/* Basic Usage */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Original Asset</h3>
                <img
                  src={getAssetUrl(testAsset)}
                  alt="Original blog image"
                  className="w-full h-48 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  URL: {getAssetUrl(testAsset)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Optimized Asset</h3>
                <img
                  src={getAssetUrl(testAsset, {
                    width: 400,
                    format: "webp",
                    quality: 85,
                  })}
                  alt="Optimized blog image"
                  className="w-full h-48 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  URL:{" "}
                  {getAssetUrl(testAsset, {
                    width: 400,
                    format: "webp",
                    quality: 85,
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* OptimizedImage Component */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              OptimizedImage Component
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  With Picture Element
                </h3>
                <OptimizedImage
                  src={testAsset}
                  alt="Blog image with picture element"
                  options={{
                    width: 400,
                    height: 300,
                    format: "webp",
                    quality: 85,
                  }}
                  breakpoints={[400, 600, 800]}
                  formats={["webp", "jpeg"]}
                  className="w-full h-48 object-cover rounded"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">With SrcSet</h3>
                <OptimizedImage
                  src={testAsset}
                  alt="Blog image with srcSet"
                  options={{
                    width: 400,
                    height: 300,
                    format: "webp",
                    quality: 85,
                  }}
                  breakpoints={[400, 600, 800]}
                  usePicture={false}
                  useSrcSet={true}
                  sizes="(max-width: 400px) 400px, (max-width: 600px) 600px, 800px"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            </div>
          </section>

          {/* Specialized Components */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Specialized Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Blog Cover</h3>
                <BlogCoverImage
                  src={testAsset}
                  alt="Blog cover image"
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover rounded"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Hero Image</h3>
                <HeroImage
                  src={testAsset}
                  alt="Hero image"
                  className="w-full h-32 object-cover rounded"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Thumbnail</h3>
                <ThumbnailImage
                  src={testAsset}
                  alt="Thumbnail image"
                  size={100}
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
            </div>
          </section>

          {/* Responsive Images */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Responsive Images</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Responsive URLs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[400, 600, 800, 1200].map((width) => (
                    <div key={width}>
                      <img
                        src={getResponsiveAssetUrls(testAsset, [width])[width]}
                        alt={`Responsive image ${width}px`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <p className="text-xs text-gray-600 mt-1">{width}px</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">SrcSet String</h3>
                <div className="bg-gray-100 p-4 rounded text-sm font-mono break-all">
                  {getSrcSet(testAsset, [400, 600, 800, 1200], {
                    format: "webp",
                    quality: 85,
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Image Optimization Examples */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Image Optimization Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">WebP Format</h3>
                <img
                  src={getAssetUrl(testAsset, { format: "webp", quality: 85 })}
                  alt="WebP format"
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  format=webp, quality=85
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Auto WebP</h3>
                <img
                  src={getAssetUrl(testAsset, { auto: "webp", quality: 80 })}
                  alt="Auto WebP"
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  auto=webp, quality=80
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Resized</h3>
                <img
                  src={getAssetUrl(testAsset, {
                    width: 200,
                    height: 150,
                    crop: "fill",
                  })}
                  alt="Resized image"
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  width=200, height=150, crop=fill
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">High Quality</h3>
                <img
                  src={getAssetUrl(testAsset, { quality: 95, format: "jpeg" })}
                  alt="High quality"
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  quality=95, format=jpeg
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Blurred</h3>
                <img
                  src={getAssetUrl(testAsset, { blur: 5, width: 300 })}
                  alt="Blurred image"
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">blur=5, width=300</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Enhanced</h3>
                <img
                  src={getAssetUrl(testAsset, { auto: "enhance", width: 300 })}
                  alt="Enhanced image"
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  auto=enhance, width=300
                </p>
              </div>
            </div>
          </section>

          {/* URL Examples */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">URL Examples</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Basic URL</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                  {getAssetUrl(testAsset)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Optimized URL</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                  {getAssetUrl(testAsset, {
                    width: 800,
                    height: 600,
                    format: "webp",
                    quality: 85,
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Auto Optimization</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                  {getAssetUrl(testAsset, { auto: "webp", quality: 80 })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
