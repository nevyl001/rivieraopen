import { SupportedLocale, getLocaleConfig } from "./config";

export function parseDateInput(date: Date | string): Date {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
    );
  }

  return typeof date === "string" ? new Date(date) : date;
}

// Date formatter
export function formatDate(
  date: Date | string,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = parseDateInput(date);
  const config = getLocaleConfig(locale);
  const formatOptions = options || config.dateFormat;

  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.warn(`Date formatting failed for locale ${locale}:`, error);
    // Fallback to basic formatting
    return dateObj.toLocaleDateString();
  }
}

// Number formatter
export function formatNumber(
  number: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const config = getLocaleConfig(locale);
  const formatOptions = options || config.numberFormat;

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(number);
  } catch (error) {
    console.warn(`Number formatting failed for locale ${locale}:`, error);
    // Fallback to basic formatting
    return number.toString();
  }
}

// Currency formatter
export function formatCurrency(
  amount: number,
  locale: SupportedLocale,
  currency: string = "USD",
  options?: Intl.NumberFormatOptions
): string {
  const config = getLocaleConfig(locale);
  const formatOptions = options || { ...config.currencyFormat, currency };

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(amount);
  } catch (error) {
    console.warn(`Currency formatting failed for locale ${locale}:`, error);
    // Fallback to basic formatting
    return `$${amount.toFixed(2)}`;
  }
}

// Relative time formatter (e.g., "hace 2 días", "en 3 semanas")
export function formatRelativeTime(
  date: Date | string,
  locale: SupportedLocale,
  baseDate: Date = new Date()
): string {
  const targetDate = parseDateInput(date);
  const diffInMs = targetDate.getTime() - baseDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return rtf.format(diffInMinutes, "minute");
      }
      return rtf.format(diffInHours, "hour");
    } else if (Math.abs(diffInDays) < 7) {
      return rtf.format(diffInDays, "day");
    } else if (Math.abs(diffInDays) < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return rtf.format(diffInWeeks, "week");
    } else if (Math.abs(diffInDays) < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return rtf.format(diffInMonths, "month");
    } else {
      const diffInYears = Math.floor(diffInDays / 365);
      return rtf.format(diffInYears, "year");
    }
  } catch (error) {
    console.warn(
      `Relative time formatting failed for locale ${locale}:`,
      error
    );
    // Fallback to basic date formatting
    return formatDate(targetDate, locale);
  }
}

// Format tournament date specifically for Spanish
export function formatTournamentDate(
  date: Date | string,
  locale: SupportedLocale
): string {
  return formatDate(date, locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format short date for cards and lists
export function formatShortDate(
  date: Date | string,
  locale: SupportedLocale
): string {
  return formatDate(date, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format time (24-hour for Spanish, 12-hour for English)
export function formatTime(
  date: Date | string,
  locale: SupportedLocale
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  try {
    // Use 12-hour format for English, 24-hour for Spanish
    const hour12 = locale === "en";

    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: hour12,
    }).format(dateObj);
  } catch (error) {
    console.warn(`Time formatting failed for locale ${locale}:`, error);
    // Fallback to basic formatting
    return dateObj.toLocaleTimeString();
  }
}
