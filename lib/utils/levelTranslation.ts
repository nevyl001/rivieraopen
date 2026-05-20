import { Category } from "@/lib/types";

export function translateLevel(category: Category): string {
  const categoryMap: Record<Category, string> = {
    Open: "Open",
    "1": "Primera",
    "2": "Segunda",
    "3": "Tercera",
    "4": "Cuarta",
    "5": "Quinta",
    "6": "Sexta",
  };

  return categoryMap[category] || category;
}
