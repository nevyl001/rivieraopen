"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { SupportedLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";

// LocalStorage key for persisting locale preference
const LOCALE_STORAGE_KEY = "riviera-open-locale";

// Context value interface
export interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  isLoading: boolean;
}

// Create context with undefined default (will be provided by LocaleProvider)
export const LocaleContext = createContext<LocaleContextValue | undefined>(
  undefined
);

// Provider props interface
export interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: SupportedLocale;
}

// LocaleProvider component
export function LocaleProvider({
  children,
  defaultLocale = DEFAULT_LOCALE,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from localStorage on mount
  useEffect(() => {
    try {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

      if (storedLocale && (storedLocale === "en" || storedLocale === "es")) {
        setLocaleState(storedLocale as SupportedLocale);
      }
    } catch (error) {
      // localStorage might not be available (SSR, private browsing, etc.)
      console.warn("Failed to load locale from localStorage:", error);
      // Fall back to default locale (already set in state)
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update localStorage and document lang attribute when locale changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
      console.warn("Failed to save locale to localStorage:", error);
    }

    // Update HTML lang attribute for accessibility and SEO
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Function to update locale
  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
  };

  const value: LocaleContextValue = {
    locale,
    setLocale,
    isLoading,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

// Custom hook to use the locale context
export function useLocale(): LocaleContextValue {
  const context = React.useContext(LocaleContext);

  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  return context;
}
