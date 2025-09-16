export default function AuthorToolsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 bg-white shadow rounded-xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Author Tools</h1>
        <p className="text-gray-600">
          Welcome to the Author Tools dashboard. This section is only accessible
          from allowed IP addresses.
        </p>
      </div>
    </main>
  );
}
