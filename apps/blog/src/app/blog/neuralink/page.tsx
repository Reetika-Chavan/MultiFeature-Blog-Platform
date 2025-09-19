export default function NeuralinkPage() {
  return (
    <main className="font-sans text-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 text-white py-20 text-center rounded-b-3xl">
        <h1 className="text-5xl font-bold mb-4">Neuralink Insights</h1>
        <p className="text-xl max-w-xl mx-auto">
          Exploring the frontier of brain-machine interfaces and neuroscience technology.
        </p>
      </section>

      {/* About Section */}
      <section className="px-6 md:px-20 py-16">
        <h2 className="text-3xl font-semibold mb-4">About Neuralink</h2>
        <p className="text-gray-700 text-lg">
          Neuralink is pioneering brain-machine interface technology to connect humans and computers. 
          This page showcases the latest updates, articles, and breakthroughs in neurological tech.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16 px-6 md:px-20 rounded-2xl mx-6 md:mx-20 mb-12">
        <h2 className="text-3xl font-semibold mb-6">Key Highlights</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-lg">
          <li>Advanced neural implants for brain-computer communication</li>
          <li>Research in neuroprosthetics and cognitive enhancement</li>
          <li>AI integration with neural signals</li>
          <li>Future of human-computer symbiosis</li>
        </ul>
      </section>

      <section className="text-center mb-16">
        <a
          href="/blog"
          className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
        >
          Back to Blog
        </a>
      </section>
    </main>
  );
}
