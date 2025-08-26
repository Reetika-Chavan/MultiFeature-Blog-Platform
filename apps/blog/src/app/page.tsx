import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-purple-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] dark:bg-grid-black/[0.1] pointer-events-none"></div>

      {/* Header / Title */}
      <header className="z-10 py-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white drop-shadow-md">
          Multifeatures Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          A modern space to explore AI, Tech & More 
        </p>
      </header>

      {/* Main content */}
      <main className="z-10 flex flex-col gap-8 items-center max-w-2xl text-center px-6">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={38}
          priority
          className="dark:invert"
        />
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          Welcome to <span className="font-semibold">Multifeatures Blog</span>.  
          Dive into curated articles, AI insights, and tech trends 
          designed with simplicity and performance in mind.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <a
            href="/blog"
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium shadow-md transition"
          >
            Explore Blogs
          </a>
          <a
            href="/about"
            className="rounded-2xl border border-gray-300 dark:border-gray-600 px-6 py-3 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Multifeatures Blog · Built with Next.js
      </footer>
    </div>
  );
}
