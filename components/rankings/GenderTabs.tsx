"use client";

import { Gender } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface GenderTabsProps {
  selectedGender: Gender;
  onGenderChange: (gender: Gender) => void;
}

const genders: Gender[] = ["Male", "Female"];

export function GenderTabs({ selectedGender, onGenderChange }: GenderTabsProps) {
  const { t } = useTranslation("rankings");

  return (
    <div
      role="tablist"
      aria-label={t("labels.selectGender")}
      className="inline-flex rounded-full border border-[#E5E5E5] bg-white p-1"
    >
      {genders.map((gender) => {
        const isSelected = selectedGender === gender;
        const label =
          gender === "Male" ? t("genders.varonil") : t("genders.femenil");
        return (
          <button
            key={gender}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onGenderChange(gender)}
            className={`min-h-11 min-w-[7.5rem] rounded-full px-5 text-sm font-medium uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
              isSelected
                ? "bg-[#111111] text-white"
                : "bg-transparent text-[#737373] hover:text-[#111111]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
