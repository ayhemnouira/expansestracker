import type {
  ApiResponse,
  Budget,
  BudgetRequestDTO,
  BudgetSummary,
} from "../types/budget";
import API from "./axiosConfig";
import { standardizeCategory } from "../utils/categories"; // ✅ This will now work!

const budgetService = {
  getBudgets: async (activeOnly: boolean = true): Promise<Budget[]> => {
    const response = await API.get<ApiResponse<Budget[]>>("/api/budgets", {
      params: { activeOnly },
    });
    return response.data.data;
  },

  getBudgetById: async (id: number): Promise<Budget> => {
    const response = await API.get<ApiResponse<Budget>>(`/api/budgets/${id}`);
    return response.data.data;
  },

  // ✅ Standardize category before sending
  createBudget: async (budgetData: BudgetRequestDTO): Promise<Budget> => {
    const standardizedData = {
      ...budgetData,
      category: standardizeCategory(budgetData.category),
    };
    const response = await API.post<ApiResponse<Budget>>(
      "/api/budgets",
      standardizedData
    );
    return response.data.data;
  },

  // ✅ Standardize category before sending
  updateBudget: async (
    id: number,
    budgetData: BudgetRequestDTO
  ): Promise<Budget> => {
    const standardizedData = {
      ...budgetData,
      category: standardizeCategory(budgetData.category),
    };
    const response = await API.put<ApiResponse<Budget>>(
      `/api/budgets/${id}`,
      standardizedData
    );
    return response.data.data;
  },

  deleteBudget: async (id: number): Promise<void> => {
    await API.delete<ApiResponse<void>>(`/api/budgets/${id}`);
  },

  getBudgetSummary: async (): Promise<BudgetSummary> => {
    const response = await API.get<ApiResponse<BudgetSummary>>(
      "/api/budgets/summary"
    );
    return response.data.data;
  },
};

export default budgetService;
