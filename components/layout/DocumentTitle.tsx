"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { usePathname } from "next/navigation";

/**
 * DocumentTitle component
 * Updates the document title based on current locale and page
 * Satisfies Requirement 8.3: Update document title when language changes
 */
export function DocumentTitle() {
  const { t, locale } = useTranslation("seo");
  const pathname = usePathname();

  useEffect(() => {
    // Determine page type from pathname
    let pageType = "home";
    if (pathname.startsWith("/tournaments")) {
      pageType = "tournaments";
    } else if (pathname.startsWith("/rankings")) {
      pageType = "rankings";
    } else if (pathname.startsWith("/gallery")) {
      pageType = "gallery";
    } else if (pathname.startsWith("/contact")) {
      pageType = "contact";
    } else if (pathname.startsWith("/players")) {
      pageType = "rankings"; // Use rankings translations for player pages
    }

    // Get translated title
    const title = t(`titles.${pageType}`);

    // Update document title
    if (title && title !== `titles.${pageType}`) {
      document.title = title;
    }
  }, [locale, pathname, t]);

  return null; // This component doesn't render anything
}
