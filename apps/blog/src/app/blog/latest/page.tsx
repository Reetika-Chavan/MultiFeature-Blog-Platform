import { getLatestBlogPost } from "@/app/lib/contentstack";

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
  reference?: { uid: string; _content_type_uid: string }[];
}

export default async function LatestBlogPage() {
  const entry: BlogEntry | null = await getLatestBlogPost();

  if (!entry) {
    return (
      <p className="text-center py-10 text-red-500">
        Failed to load latest blog post.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* img */}
      {entry.banner_image?.url && (
        <img
          src={entry.banner_image.url}
          alt={entry.banner_image.title || "Banner"}
          className="w-full h-72 object-cover rounded-2xl shadow-md"
        />
      )}

      <div className="mt-6">
        <h1 className="text-4xl font-bold text-white-900">{entry.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Category: <span className="font-medium">{entry.category}</span>
        </p>
        {entry.tags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {entry.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="prose prose-lg mt-6 max-w-none"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />
    </div>
  );
}
