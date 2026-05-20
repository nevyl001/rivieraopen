"use client";

import { useLocale } from "@/lib/contexts/LocaleContext";
import { SupportedLocale } from "@/lib/i18n/config";

export interface LanguageToggleProps {
  variant?: "header" | "footer";
  className?: string;
}

export function LanguageToggle({
  variant = "header",
  className = "",
}: LanguageToggleProps) {
  const { locale, setLocale } = useLocale();

  const handleClick = () => {
    const newLocale: SupportedLocale = locale === "en" ? "es" : "en";
    setLocale(newLocale);
  };

  const baseStyles =
    "inline-flex items-center gap-2 transition-colors focus:outline-none";

  const variantStyles = {
    header: "focus:ring-white",
    footer: "focus:ring-gray-300",
  };

  const currentLanguageLabel = locale === "en" ? "English" : "Español";

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={`Current language: ${currentLanguageLabel}. Click to change language`}
      aria-live="polite"
      type="button"
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`text-sm font-medium transition-colors ${
            locale === "en" ? "text-white" : "text-white/50"
          }`}
        >
          EN
        </span>
        <span className="text-sm text-white/50">/</span>
        <span
          className={`text-sm font-medium transition-colors ${
            locale === "es" ? "text-white" : "text-white/50"
          }`}
        >
          ES
        </span>
      </span>
    </button>
  );
}
