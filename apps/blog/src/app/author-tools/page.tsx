export default function AuthorToolsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 bg-white shadow rounded-xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Author Tools</h1>
        <p className="text-gray-600 mb-4">
          Welcome to the Author Tools dashboard. This section is protected by:
        </p>
        <ul className="text-left text-gray-600 space-y-2 mb-6">
          <li>• IP address restriction</li>
          <li>• Contentstack SSO authentication</li>
        </ul>
        <p className="text-sm text-gray-500">
          You have successfully authenticated and are accessing from an allowed
          IP address.
        </p>
      </div>
    </main>
  );
}
