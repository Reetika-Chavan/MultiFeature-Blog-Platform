export const revalidate = 60; 
export default function LatestBlogPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Latest Posts</h1>
      <p>This page will use <strong>ISR</strong> for trending/latest posts.</p>
    </main>
  );
}
