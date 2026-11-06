"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";

export function RankingHeader() {
  const { t } = useTranslation("rankings");

  return (
    <header className="mb-6 md:mb-8">
      <p className="font-[family-name:var(--font-fp-sans)] text-[10px] font-medium uppercase tracking-[0.22em] text-[#737373] md:text-[11px]">
        {t("page.official")}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-fp-display)] text-[3.25rem] leading-[0.86] tracking-wide text-[#101010] sm:text-6xl md:text-[5.25rem]">
        {t("page.title")}
      </h1>
      <p className="mt-3 max-w-xl font-[family-name:var(--font-fp-sans)] text-base leading-snug text-[#101010] md:text-lg">
        {t("page.subtitle")}
      </p>
      <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-sm text-[#737373]">
        {t("page.description")}
      </p>
      <div className="mt-5 h-px w-full bg-[#E7E7E7] md:mt-6" />
    </header>
  );
}
