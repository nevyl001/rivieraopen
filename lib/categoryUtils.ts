import { Category } from "@/lib/types";

/** Tabs de la UI → valores en riviera_jugadores.categoria */
export const UI_TO_DB_CATEGORY: Partial<Record<Category, string>> = {
  Open: "open",
  "1": "1ra_fuerza",
  "2": "2da_fuerza",
  "3": "3ra_fuerza",
  "4": "4ta_fuerza",
  "5": "5ta_fuerza",
  "6": "6ta_fuerza",
};

export const DB_TO_UI_CATEGORY: Record<string, Category> = {
  open: "Open",
  "1ra_fuerza": "1",
  "2da_fuerza": "2",
  "3ra_fuerza": "3",
  "4ta_fuerza": "4",
  "5ta_fuerza": "5",
  "6ta_fuerza": "6",
};

export function uiCategoryToDb(categoria: string): string | null {
  if (categoria.toLowerCase() === "open") return "open";
  return UI_TO_DB_CATEGORY[categoria as Category] ?? null;
}

export function dbCategoryToUi(value: string | null, fallback: Category = "5"): Category {
  if (!value) return fallback;
  return DB_TO_UI_CATEGORY[value] ?? fallback;
}

export function getCategoryTranslationKey(category: Category): string {
  return category === "Open" ? "levels.open" : `levels.${category}`;
}
