import { Translations, TranslationParams } from "@/lib/types";
import { SupportedLocale, DEFAULT_LOCALE } from "./config";

import esCommon from "@/lib/locales/es/common.json";
import esHome from "@/lib/locales/es/home.json";
import esTournaments from "@/lib/locales/es/tournaments.json";
import esRankings from "@/lib/locales/es/rankings.json";
import esGallery from "@/lib/locales/es/gallery.json";
import esContact from "@/lib/locales/es/contact.json";
import esSeo from "@/lib/locales/es/seo.json";

import enCommon from "@/lib/locales/en/common.json";
import enHome from "@/lib/locales/en/home.json";
import enTournaments from "@/lib/locales/en/tournaments.json";
import enRankings from "@/lib/locales/en/rankings.json";
import enGallery from "@/lib/locales/en/gallery.json";
import enContact from "@/lib/locales/en/contact.json";
import enSeo from "@/lib/locales/en/seo.json";

const translationsByLocale: Record<SupportedLocale, Translations> = {
  es: {
    common: esCommon,
    home: esHome,
    tournaments: esTournaments,
    rankings: esRankings,
    gallery: esGallery,
    contact: esContact,
    seo: esSeo,
  } as unknown as Translations,
  en: {
    common: enCommon,
    home: enHome,
    tournaments: enTournaments,
    rankings: enRankings,
    gallery: enGallery,
    contact: enContact,
    seo: enSeo,
  } as unknown as Translations,
};

/** Synchronous lookup — reliable in production (no dynamic import). */
export function getTranslations(locale: SupportedLocale): Translations {
  return translationsByLocale[locale] ?? translationsByLocale[DEFAULT_LOCALE];
}

// Load translations for a specific locale (async API kept for tests)
export async function loadTranslations(
  locale: SupportedLocale
): Promise<Translations> {
  return getTranslations(locale);
}

// Get nested translation value by key path
export function getTranslationByPath(
  translations: Translations,
  keyPath: string,
  params?: TranslationParams
): string {
  const keys = keyPath.split(".");
  let value: unknown = translations;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return keyPath;
    }
  }

  if (typeof value !== "string") {
    return keyPath;
  }

  if (params) {
    return interpolateParams(value, params);
  }

  return value;
}

function interpolateParams(text: string, params: TranslationParams): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in params) {
      return String(params[key]);
    }
    return match;
  });
}

export function getNamespacedTranslation(
  translations: Translations,
  namespace: keyof Translations | undefined,
  key: string,
  params?: TranslationParams
): string {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  return getTranslationByPath(translations, fullKey, params);
}

export function clearTranslationCache(): void {
  // No-op: translations are static
}
