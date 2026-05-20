"use client";

import { useState, useEffect, useCallback } from "react";
import { Translations, TranslationParams } from "@/lib/types";
import { SupportedLocale } from "@/lib/i18n/config";
import {
  loadTranslations,
  getNamespacedTranslation,
} from "@/lib/i18n/translations";
import {
  formatDate as formatDateUtil,
  formatNumber as formatNumberUtil,
  formatCurrency as formatCurrencyUtil,
  formatRelativeTime as formatRelativeTimeUtil,
  formatShortDate,
  formatTournamentDate,
  formatTime,
} from "@/lib/i18n/formatters";
import { useLocale } from "@/lib/contexts/LocaleContext";

export interface UseTranslationReturn {
  t: (key: string, params?: TranslationParams) => string;
  locale: SupportedLocale;
  isLoading: boolean;
  error: string | null;
  formatDate: (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date | string, baseDate?: Date) => string;
  formatShortDate: (date: Date | string) => string;
  formatTournamentDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
}

export function useTranslation(
  namespace?: keyof Translations
): UseTranslationReturn {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get locale from context instead of using hardcoded DEFAULT_LOCALE
  const { locale } = useLocale();

  // Load translations when locale changes
  useEffect(() => {
    let isMounted = true;

    const loadTranslationsAsync = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedTranslations = await loadTranslations(locale);

        if (isMounted) {
          setTranslations(loadedTranslations);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load translations"
          );
          console.error("Translation loading error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTranslationsAsync();

    return () => {
      isMounted = false;
    };
  }, [locale]); // Re-run when locale changes

  // Translation function
  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      if (!translations) {
        // Return key as fallback while loading
        return key;
      }

      try {
        return getNamespacedTranslation(translations, namespace, key, params);
      } catch (err) {
        console.warn(`Translation error for key "${key}":`, err);
        return key; // Fallback to key
      }
    },
    [translations, namespace]
  );

  // Formatting functions with locale bound
  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDateUtil(date, locale, options),
    [locale]
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) =>
      formatNumberUtil(number, locale, options),
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string = "USD") =>
      formatCurrencyUtil(amount, locale, currency),
    [locale]
  );

  const formatRelativeTime = useCallback(
    (date: Date | string, baseDate?: Date) =>
      formatRelativeTimeUtil(date, locale, baseDate),
    [locale]
  );

  const formatShortDateBound = useCallback(
    (date: Date | string) => formatShortDate(date, locale),
    [locale]
  );

  const formatTournamentDateBound = useCallback(
    (date: Date | string) => formatTournamentDate(date, locale),
    [locale]
  );

  const formatTimeBound = useCallback(
    (date: Date | string) => formatTime(date, locale),
    [locale]
  );

  return {
    t,
    locale,
    isLoading,
    error,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    formatShortDate: formatShortDateBound,
    formatTournamentDate: formatTournamentDateBound,
    formatTime: formatTimeBound,
  };
}
