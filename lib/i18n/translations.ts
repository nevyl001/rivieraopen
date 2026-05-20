import { Translations, TranslationParams } from "@/lib/types";
import { SupportedLocale, DEFAULT_LOCALE } from "./config";

// Translation cache
const translationCache = new Map<SupportedLocale, Translations>();

// Load translations for a specific locale
export async function loadTranslations(
  locale: SupportedLocale
): Promise<Translations> {
  // Check cache first
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    // Dynamically import all translation files
    const [common, home, tournaments, rankings, gallery, contact, seo] =
      await Promise.all([
        import(`@/lib/locales/${locale}/common.json`),
        import(`@/lib/locales/${locale}/home.json`),
        import(`@/lib/locales/${locale}/tournaments.json`),
        import(`@/lib/locales/${locale}/rankings.json`),
        import(`@/lib/locales/${locale}/gallery.json`),
        import(`@/lib/locales/${locale}/contact.json`),
        import(`@/lib/locales/${locale}/seo.json`),
      ]);

    const translations: Translations = {
      common: common.default,
      home: home.default,
      tournaments: tournaments.default,
      rankings: rankings.default,
      gallery: gallery.default,
      contact: contact.default,
      seo: seo.default,
    };

    // Cache the translations
    translationCache.set(locale, translations);
    return translations;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);

    // Fallback to default locale if not already trying default
    if (locale !== DEFAULT_LOCALE) {
      return loadTranslations(DEFAULT_LOCALE);
    }

    // If even default locale fails, return empty translations
    throw new Error(
      `Failed to load translations for default locale: ${DEFAULT_LOCALE}`
    );
  }
}

// Get nested translation value by key path
export function getTranslationByPath(
  translations: Translations,
  keyPath: string,
  params?: TranslationParams
): string {
  const keys = keyPath.split(".");
  let value: any = translations;

  // Navigate through the nested object
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      // Return the key path if translation not found (fallback)
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath;
    }
  }

  // If final value is not a string, return the key path
  if (typeof value !== "string") {
    console.warn(`Translation value is not a string: ${keyPath}`);
    return keyPath;
  }

  // Replace parameters in the translation string
  if (params) {
    return interpolateParams(value, params);
  }

  return value;
}

// Interpolate parameters in translation strings
function interpolateParams(text: string, params: TranslationParams): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in params) {
      return String(params[key]);
    }
    console.warn(`Parameter not found in translation: ${key}`);
    return match;
  });
}

// Get translation with namespace support
export function getNamespacedTranslation(
  translations: Translations,
  namespace: keyof Translations | undefined,
  key: string,
  params?: TranslationParams
): string {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  return getTranslationByPath(translations, fullKey, params);
}

// Clear translation cache (useful for development)
export function clearTranslationCache(): void {
  translationCache.clear();
}
