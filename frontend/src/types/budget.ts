export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export const BudgetPeriod = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  CUSTOM: 'CUSTOM',
} as const;


export type BudgetStatus = 'SAFE' | 'WARNING' | 'EXCEEDED' | 'INACTIVE';
export const BudgetStatus = {
  SAFE: 'SAFE',
  WARNING: 'WARNING',
  EXCEEDED: 'EXCEEDED',
  INACTIVE: 'INACTIVE',
} as const;

export type AlertType = 'THRESHOLD_REACHED' | 'BUDGET_EXCEEDED';
export const AlertType = {
  THRESHOLD_REACHED: 'THRESHOLD_REACHED',
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
} as const;

export interface Budget {
  id: number;
  category: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: BudgetStatus;
  daysRemaining: number;
  createdAt: string;
}

export interface BudgetRequestDTO {
  category: string;
  amount: number;
  period: BudgetPeriod;
  startDate?: string;
  alertThreshold?: number;
}

export interface BudgetSummary {
  totalBudgets: number;
  safeBudgets: number;
  warningBudgets: number;
  exceededBudgets: number;
  totalBudgeted: number;
  totalSpent: number;
  overallPercentage: number;
}

export interface BudgetAlert {
  id: number;
  budgetId: number;
  budgetCategory: string;
  type: AlertType;
  message: string;
  isRead: boolean;
  triggeredAt: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
export interface BudgetAlert {
  id: number;
  budgetId: number;
  budgetCategory: string;
  type: 'THRESHOLD_REACHED' | 'BUDGET_EXCEEDED';
  message: string;
  isRead: boolean;
  triggeredAt: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}