"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const languages = [
  { code: "en-us", label: "English" },
  { code: "fr-fr", label: "French" },
  { code: "ja-jp", label: "Japanese" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState("en-us");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || "en-us";
    setCurrentLang(lang);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", newLang);

    router.push(`?${params.toString()}`);
    setCurrentLang(newLang);
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      className="p-2 rounded border border-gray-700 bg-gray-800 text-white"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
