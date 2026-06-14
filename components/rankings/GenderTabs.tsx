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
    <>
      {/* Desktop — primary pill selector */}
      <div className="hidden md:flex justify-center gap-3">
        {genders.map((gender) => {
          const isSelected = selectedGender === gender;
          return (
            <button
              key={gender}
              onClick={() => onGenderChange(gender)}
              className={`px-10 py-3 rounded-full font-medium text-base transition-all duration-300 ${
                isSelected
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-text-secondary border border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {gender === "Male" ? t("genders.varonil") : t("genders.femenil")}
            </button>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <label
          htmlFor="gender-select"
          className="block text-sm font-medium text-primary mb-2"
        >
          {t("labels.selectGender")}
        </label>
        <select
          id="gender-select"
          value={selectedGender}
          onChange={(e) => onGenderChange(e.target.value as Gender)}
          className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-full font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {genders.map((gender) => (
            <option key={gender} value={gender}>
              {gender === "Male" ? t("genders.varonil") : t("genders.femenil")}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
