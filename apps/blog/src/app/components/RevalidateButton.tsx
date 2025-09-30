"use client";

import { useState } from "react";

export default function RevalidateButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRevalidate = async () => {
    setIsLoading(true);
    try {
      // Call API route
      const response = await fetch(
        "/api/revalidate?tag=generative-blog-post&path=/blog/generativeai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Revalidation successful:", result);
        alert(
          "Cache revalidated successfully for both Production and Default environments!"
        );
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Revalidation failed"
        );
      }

      window.location.reload();
    } catch (error) {
      console.error("Revalidation failed:", error);
      alert(
        `Revalidation failed: ${error instanceof Error ? error.message : "Please try again."}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRevalidate}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isLoading
          ? "bg-gray-500 cursor-not-allowed text-gray-300"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {isLoading ? "Revalidating..." : "Revalidate Cache"}
    </button>
  );
}
