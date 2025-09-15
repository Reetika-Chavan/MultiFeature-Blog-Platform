import { getCdnUrl } from "../lib/cdn-utils";

export default function TestCDNPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CDN Assets Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Basic Usage</h2>
          <img
            src={getCdnUrl("blog.png")}
            alt="Blog image"
            className="w-64 h-32 object-cover"
          />
          <p className="text-sm text-gray-600 mt-2">
            URL: {getCdnUrl("blog.png")}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">With Optimization</h2>
          <img
            src={getCdnUrl("blog.png", {
              width: 400,
              format: "webp",
              quality: 85,
            })}
            alt="Optimized blog image"
            className="w-64 h-32 object-cover"
          />
          <p className="text-sm text-gray-600 mt-2">
            URL:{" "}
            {getCdnUrl("blog.png", { width: 400, format: "webp", quality: 85 })}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Auto WebP</h2>
          <img
            src={getCdnUrl("blog.png", { auto: "webp", quality: 80 })}
            alt="Auto WebP"
            className="w-64 h-32 object-cover"
          />
          <p className="text-sm text-gray-600 mt-2">
            URL: {getCdnUrl("blog.png", { auto: "webp", quality: 80 })}
          </p>
        </div>
      </div>
    </div>
  );
}
