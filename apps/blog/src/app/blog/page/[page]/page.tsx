import { getLatestBlogPost, getBlogPosts } from "@/app/lib/contentstack";
import { detectLocale } from "@/app/lib/detectLocale";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import Image from "next/image";

interface PageProps {
  params: { page: string };
}

export default async function BlogPage({ params }: PageProps) {
  const locale = await detectLocale();
  const pageNum = parseInt(params.page, 10) || 1;

  let entry;

  if (pageNum === 1) {
    entry = await getLatestBlogPost(locale, 1, 1);
  } else {
    const posts = await getBlogPosts(locale, pageNum, 1);
    entry = posts[0] || null;
  }

  if (!entry) {
    return (
      <p className="text-center py-10 text-red-500">
        Failed to load blog post.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-4">
          <LanguageSwitcher />
        </div>

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
        </div>

        <div
          className="prose prose-lg prose-invert mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>
    </div>
  );
}
