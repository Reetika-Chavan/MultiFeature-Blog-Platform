import { headers } from "next/headers";

const localeMapByCountry: Record<string, string> = {
  FR: "fr-fr",
  JP: "ja-jp",
  US: "en-us",
};

export async function detectLocale(): Promise<string> {
  const hdrs = await headers(); 

  const country = hdrs.get("x-country-code") || hdrs.get("x-geo-country-code") || "";
  const acceptLang = hdrs.get("accept-language") || "";
  const browserLang = acceptLang.split(",")[0].toLowerCase();

  if (localeMapByCountry[country]) {
    return localeMapByCountry[country];
  }

  if (browserLang.startsWith("fr")) return "fr-fr";
  if (browserLang.startsWith("ja")) return "ja-jp";

  return "en-us";
}
