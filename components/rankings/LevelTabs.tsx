"use client";

import { Category } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";

interface LevelTabsProps {
  selectedLevel: Category;
  onLevelChange: (level: Category) => void;
}

const levels: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];

function shortLevelLabel(level: Category): string {
  if (level === "Open") return "OPEN";
  const map: Record<string, string> = {
    "1": "1RA",
    "2": "2DA",
    "3": "3RA",
    "4": "4TA",
    "5": "5TA",
    "6": "6TA",
  };
  return map[level] ?? level;
}

export function LevelTabs({ selectedLevel, onLevelChange }: LevelTabsProps) {
  const { t } = useTranslation("rankings");

  return (
    <div
      role="tablist"
      aria-label={t("labels.selectLevel")}
      className="ranking-level-scroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {levels.map((level) => {
        const isSelected = selectedLevel === level;
        const fullLabel = t(getCategoryTranslationKey(level));
        return (
          <button
            key={level}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={fullLabel}
            title={fullLabel}
            onClick={() => onLevelChange(level)}
            className={`relative shrink-0 min-h-11 px-3.5 text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
              isSelected
                ? "text-[#111111]"
                : "text-[#8A8A8A] hover:text-[#111111]"
            }`}
          >
            {shortLevelLabel(level)}
            <span
              className={`absolute inset-x-3 bottom-1 h-px transition-opacity duration-200 ${
                isSelected ? "bg-[#111111] opacity-100" : "opacity-0"
              }`}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
