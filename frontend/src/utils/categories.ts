import { BudgetPeriod } from "../types/budget";

export interface CategoryInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { value: "Food", label: "Food & Dining", icon: "🍔", color: "bg-orange-500" },
  {
    value: "Transport",
    label: "Transportation",
    icon: "🚗",
    color: "bg-blue-500",
  },
  { value: "Shopping", label: "Shopping", icon: "🛍️", color: "bg-pink-500" },
  {
    value: "Entertainment",
    label: "Entertainment",
    icon: "🎬",
    color: "bg-purple-500",
  },
  { value: "Health", label: "Healthcare", icon: "🏥", color: "bg-red-500" },
  {
    value: "Education",
    label: "Education",
    icon: "📚",
    color: "bg-indigo-500",
  },
  {
    value: "Bills",
    label: "Bills & Utilities",
    icon: "💡",
    color: "bg-yellow-500",
  },
  { value: "Groceries", label: "Groceries", icon: "🛒", color: "bg-green-500" },
  { value: "Dining", label: "Dining", icon: "🍽️", color: "bg-amber-500" },
  {
    value: "Utilities",
    label: "Utilities",
    icon: "⚡",
    color: "bg-yellow-600",
  },
  { value: "Housing", label: "Housing", icon: "🏠", color: "bg-teal-500" },
  { value: "Income", label: "Income", icon: "💰", color: "bg-emerald-500" },
  { value: "Other", label: "Other", icon: "📦", color: "bg-gray-500" },
];

export const standardizeCategory = (category: string): string => {
  return category.toLowerCase().trim();
};

export const getCategoryInfo = (categoryName: string): CategoryInfo => {
  const normalized = standardizeCategory(categoryName);
  const found = CATEGORIES.find(
    (cat) => standardizeCategory(cat.value) === normalized
  );
  return found || CATEGORIES[CATEGORIES.length - 1];
};

const TAILWIND_TO_HEX: Record<string, string> = {
  "bg-orange-500": "#F97316",
  "bg-blue-500": "#3B82F6",
  "bg-pink-500": "#EC4899",
  "bg-purple-500": "#A855F7",
  "bg-red-500": "#EF4444",
  "bg-indigo-500": "#6366F1",
  "bg-yellow-500": "#EAB308",
  "bg-gray-500": "#6B7280",

  "bg-green-500": "#22C55E",
  "bg-amber-500": "#F59E0B",
  "bg-yellow-600": "#CA8A04",
  "bg-teal-500": "#14B8A6",
  "bg-emerald-500": "#10B981",
};

export const getCategoryColor = (categoryName: string): string => {
  const info = getCategoryInfo(categoryName);
  return TAILWIND_TO_HEX[info.color] || "#6B7280";
};

export interface PeriodOption {
  value: BudgetPeriod;
  label: string;
}

export const BUDGET_PERIODS: PeriodOption[] = [
  { value: BudgetPeriod.WEEKLY, label: "Weekly" },
  { value: BudgetPeriod.MONTHLY, label: "Monthly" },
  { value: BudgetPeriod.YEARLY, label: "Yearly" },
];
