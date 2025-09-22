"use client";

export default function RevalidateButton() {
  const handleRevalidate = async () => {
    try {
      // Call our revalidation API route
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
        // Show success message
        alert("Cache revalidated successfully!");
      } else {
        throw new Error("Revalidation failed");
      }

      // Reload the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error("Revalidation failed:", error);
      alert("Revalidation failed. Please try again.");
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleRevalidate}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Revalidate Cache
    </button>
  );
}
