"use client";

export default function RevalidateButton() {
  const handleRevalidate = async () => {
    try {
      await fetch(
        "https://dev11-app.csnonprod.com/automations-api/run/6783367e138a4c799daff5195c70df1b",
        {
          method: "POST",
          mode: "no-cors", 
        }
      );

      // Refresh the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error("Revalidation failed:", error);
      // Still refresh the page
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
