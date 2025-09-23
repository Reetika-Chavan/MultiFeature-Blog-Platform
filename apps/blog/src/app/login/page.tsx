"use client";

import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Get environment variables from the client-side
    const oauthAuthorizeUrl = process.env.NEXT_PUBLIC_OAUTH_AUTHORIZE_URL;

    if (oauthAuthorizeUrl) {
      // Redirect to Contentstack OAuth authorization
      window.location.href = oauthAuthorizeUrl;
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow rounded-xl text-center">
        <h1 className="text-2xl font-bold mb-4 text-black">Login Required</h1>
        <p className="text-gray-600 mb-6">
          You need to authenticate with Contentstack to access Author Tools.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting to Contentstack login...
        </p>
      </div>
    </main>
  );
}
