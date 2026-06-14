"use client";

import { Category } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";

interface LevelTabsProps {
  selectedLevel: Category;
  onLevelChange: (level: Category) => void;
}

const levels: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];

export function LevelTabs({ selectedLevel, onLevelChange }: LevelTabsProps) {
  const { t } = useTranslation("rankings");

  return (
    <>
      {/* Desktop — centered category pills */}
      <div className="hidden md:flex justify-center">
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
          {levels.map((level) => {
            const isSelected = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => onLevelChange(level)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "text-text-secondary hover:text-primary hover:bg-gray-50"
                }`}
              >
                {t(getCategoryTranslationKey(level))}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <label
          htmlFor="level-select"
          className="block text-sm font-medium text-primary mb-2"
        >
          {t("labels.selectLevel")}
        </label>
        <select
          id="level-select"
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value as Category)}
          className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-full font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {t(getCategoryTranslationKey(level))}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
