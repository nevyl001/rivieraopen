"use client";

import { Category } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface LevelTabsProps {
  selectedLevel: Category;
  onLevelChange: (level: Category) => void;
}

const levels: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];

export function LevelTabs({ selectedLevel, onLevelChange }: LevelTabsProps) {
  const { t } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden md:flex gap-2 border-b border-border">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              selectedLevel === level
                ? "text-accent"
                : "text-text-secondary hover:text-primary"
            }`}
          >
            {level === "Open"
              ? t("levels.open")
              : `${tCommon("labels.level")} ${level}`}
            {selectedLevel === level && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <label
          htmlFor="level-select"
          className="block text-sm font-medium text-black mb-2"
        >
          {t("labels.selectLevel")}
        </label>
        <select
          id="level-select"
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value as Category)}
          className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level === "Open"
                ? t("levels.open")
                : `${tCommon("labels.level")} ${level}`}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
