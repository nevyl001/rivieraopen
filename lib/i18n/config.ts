import { LocaleConfig } from "@/lib/types";

// Supported locales
export const LOCALES = ["es", "en"] as const;
export type SupportedLocale = (typeof LOCALES)[number];

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = "es";

// Locale configurations
export const localeConfigs: Record<SupportedLocale, LocaleConfig> = {
  es: {
    code: "es",
    name: "Español",
    dateFormat: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    numberFormat: {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
    },
    rtl: false,
  },
  en: {
    code: "en",
    name: "English",
    dateFormat: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    numberFormat: {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
    },
    rtl: false,
  },
};

// Get locale configuration
export function getLocaleConfig(locale: SupportedLocale): LocaleConfig {
  return localeConfigs[locale] || localeConfigs[DEFAULT_LOCALE];
}

// Check if locale is supported
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return LOCALES.includes(locale as SupportedLocale);
}
