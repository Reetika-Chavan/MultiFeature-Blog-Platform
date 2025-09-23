import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import Image from "next/image";
import RevalidateButton from "../../components/RevalidateButton";
import { getGenerativeBlogPost } from "@/app/lib/contentstack";
import { headers } from "next/headers";

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

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

export default async function GenerativeBlogPost({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;

  // Get browser's Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";

  // Determine locale: URL parameter takes priority, then browser header, then default
  let locale = "en-us"; // Default
  if (lang) {
    locale = lang; // URL parameter has highest priority
  } else if (acceptLanguage.includes("ja")) {
    locale = "ja-jp"; // Browser header detection
  } else if (acceptLanguage.includes("fr")) {
    locale = "fr-fr";
  }

  const entry: BlogEntry | null = await getGenerativeBlogPost(locale);

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <p className="text-center py-10 text-red-500 text-xl">
          Failed to load blog post.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-8 flex justify-between items-center">
          <LanguageSwitcher />
          <div className="flex flex-col items-end gap-2">
            <RevalidateButton />
            <p className="text-xs text-gray-400">
              Page loaded: {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-400">
              Cache: ISR enabled (1h revalidation)
            </p>
          </div>
        </header>

        {/* Banner Image */}
        {entry.banner_image?.url && (
          <div className="mb-8">
            <Image
              src={entry.banner_image.url}
              alt={entry.banner_image.title || "Banner"}
              width={1200}
              height={500}
              className="w-full h-72 object-cover rounded-2xl shadow-lg"
              priority
            />
          </div>
        )}

        <article className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{entry.title}</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-300">
              Category:{" "}
              <span className="font-medium text-white">{entry.category}</span>
            </p>
            {entry.tags && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-700 text-gray-200 text-xs px-3 py-1 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        <div
          className="prose prose-lg prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>
    </div>
  );
}
