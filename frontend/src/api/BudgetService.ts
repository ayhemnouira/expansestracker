// BudgetService.ts

import API from "./axiosConfig";


export interface Budget {
  id: number;
  category: string;
  amount: number;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'SAFE' | 'WARNING' | 'EXCEEDED' | 'INACTIVE';
  daysRemaining: number;
  createdAt: string;
}

export const createBudget = async (data: Partial<Budget>): Promise<Budget> => {
  return API.post('/api/budgets', data).then(res => res.data.data);
};

export const getBudgets = async (activeOnly?: boolean): Promise<Budget[]> => {
  return API.get('/api/budgets', { params: { activeOnly } }).then(res => res.data.data);
};

export const getBudgetById = async (id: number): Promise<Budget> => {
  return API.get(`/api/budgets/${id}`).then(res => res.data.data);
};

export const updateBudget = async (id: number, data: Partial<Budget>): Promise<Budget> => {
  return API.put(`/api/budgets/${id}`, data).then(res => res.data.data);
};

export const deleteBudget = async (id: number): Promise<void> => {
  return API.delete(`/api/budgets/${id}`);
};