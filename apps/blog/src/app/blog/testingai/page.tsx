import { getTestingAIBlogPost } from "@/app/lib/contentstack";
import Image from "next/image";

interface BlogEntry {
  title: string;
  url: string;
  content: string;
  category: string;
  tags?: string[];
  banner_image?: {
    url: string;
    title?: string;
  };
}

export default async function TestingAIBlogPost() {
  const locale = "en-us";
  const entry: BlogEntry | null = await getTestingAIBlogPost(locale);

  if (!entry) {
    return (
      <p className="text-center py-10 text-red-500">
        Failed to load AI blog post.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {entry.banner_image?.url && (
          <Image
            src={entry.banner_image.url}
            alt={entry.banner_image.title || "Banner"}
            width={1200}
            height={500}
            className="w-full h-72 object-cover rounded-2xl shadow-lg"
          />
        )}

        <div className="mt-6">
          <h1 className="text-4xl font-bold">{entry.title}</h1>
          <p className="mt-2 text-sm text-gray-300">
            Category: <span className="font-medium">{entry.category}</span>
          </p>
          {entry.tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {entry.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-700 text-gray-200 text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="prose prose-lg prose-invert mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>
    </div>
  );
}
