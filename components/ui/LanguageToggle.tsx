"use client";

import { useLocale } from "@/lib/contexts/LocaleContext";
import { SupportedLocale } from "@/lib/i18n/config";

export interface LanguageToggleProps {
  variant?: "header" | "footer";
  theme?: "light" | "dark";
  className?: string;
}

export function LanguageToggle({
  variant = "header",
  theme = "dark",
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
    header: theme === "light" ? "focus:ring-primary" : "focus:ring-white",
    footer: "focus:ring-gray-300",
  };

  const currentLanguageLabel = locale === "en" ? "English" : "Español";
  const activeLanguageClass =
    variant === "header" && theme === "light" ? "text-primary" : "text-white";
  const inactiveLanguageClass =
    variant === "header" && theme === "light"
      ? "text-primary/50"
      : "text-white/50";

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
            locale === "en" ? activeLanguageClass : inactiveLanguageClass
          }`}
        >
          EN
        </span>
        <span className={`text-sm ${inactiveLanguageClass}`}>/</span>
        <span
          className={`text-sm font-medium transition-colors ${
            locale === "es" ? activeLanguageClass : inactiveLanguageClass
          }`}
        >
          ES
        </span>
      </span>
    </button>
  );
}
