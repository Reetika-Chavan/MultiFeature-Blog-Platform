import { getAllBlogPosts } from "@/app/lib/contentstack";
import { detectLocale } from "@/app/lib/detectLocale";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import Image from "next/image";
import Link from "next/link";

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
  created_at?: string;
  updated_at?: string;
}

interface BlogPageProps {
  searchParams: {
    page?: string;
  };
}

const POSTS_PER_PAGE = 5;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await detectLocale();
  const currentPage = parseInt(searchParams.page || "1", 10);
  const allPosts: BlogEntry[] = await getAllBlogPosts(locale);

  // Calculate pagination
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold mb-2">Blog</h1>
          <p className="text-gray-300">
            Discover the latest insights and stories ({totalPosts} posts)
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.url}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href={post.url} className="block">
                {post.banner_image?.url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.banner_image.url}
                      alt={post.banner_image.title || post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-3">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  <div
                    className="text-gray-300 text-sm line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{
                      __html:
                        post.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                        "...",
                    }}
                  />

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-blue-400 text-sm font-medium">
                    Read more →
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous Page */}
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Previous
                </Link>
              )}

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Link
                    key={page}
                    href={`/blog?page=${page}`}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </Link>
                )
              )}

              {/* Next Page */}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Next →
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* No Posts Message */}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
