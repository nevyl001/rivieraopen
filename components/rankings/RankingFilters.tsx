"use client";

import { Search, X } from "lucide-react";
import { GenderTabs } from "@/components/rankings/GenderTabs";
import { LevelTabs } from "@/components/rankings/LevelTabs";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { Category, Gender } from "@/lib/types";

interface RankingFiltersProps {
  selectedGender: Gender;
  selectedLevel: Category;
  searchQuery: string;
  onGenderChange: (gender: Gender) => void;
  onLevelChange: (level: Category) => void;
  onSearchChange: (value: string) => void;
}

export function RankingFilters({
  selectedGender,
  selectedLevel,
  searchQuery,
  onGenderChange,
  onLevelChange,
  onSearchChange,
}: RankingFiltersProps) {
  const { t } = useTranslation("rankings");

  return (
    <div className="mb-6 md:mb-8">
      <GenderTabs
        selectedGender={selectedGender}
        onGenderChange={onGenderChange}
      />
      <div className="mt-4 border-b border-[#E7E7E7]">
        <LevelTabs selectedLevel={selectedLevel} onLevelChange={onLevelChange} />
      </div>
      <div className="mt-4">
        <label htmlFor="player-name-search" className="sr-only">
          {t("labels.searchByName")}
        </label>
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#737373]"
            aria-hidden
          />
          <input
            id="player-name-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("labels.searchPlaceholder")}
            className="h-12 w-full rounded-xl border border-[#E7E7E7] bg-white pl-11 pr-12 font-[family-name:var(--font-fp-sans)] text-sm text-[#101010] placeholder:text-[#737373] transition-colors duration-200 focus:border-[#101010] focus:outline-none"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#737373] transition-colors duration-150 hover:text-[#101010] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010]"
              aria-label={t("labels.clearSearch")}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
