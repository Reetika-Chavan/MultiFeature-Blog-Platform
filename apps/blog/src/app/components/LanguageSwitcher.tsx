"use client";

import { useRouter, useSearchParams } from "next/navigation";

const languages = [
  { code: "en-us", label: "English" },
  { code: "fr-fr", label: "French" },
  { code: "ja-jp", label: "Japanese" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") || "en-us";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set("lang", newLang);

    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      className="p-2 rounded border border-black"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
