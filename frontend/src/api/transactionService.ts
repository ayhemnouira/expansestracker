import API from "./axiosConfig";
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "../types";
import { standardizeCategory } from "../utils/categories"; // ✅ Import it

export const getUserTransactions = async (): Promise<Transaction[]> => {
  const response = await API.get<Transaction[]>("/api/transactions");
  return response.data;
};

export const getTransactionsByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  const response = await API.get<Transaction[]>("/api/transactions/month", {
    params: { year, month },
  });
  return response.data;
};

export const getTransactionById = async (id: number): Promise<Transaction> => {
  const response = await API.get<Transaction>(`/api/transactions/${id}`);
  return response.data;
};

// ✅ Standardize category before sending
export const createTransaction = async (
  data: CreateTransactionRequest
): Promise<Transaction> => {
  const standardizedData = {
    ...data,
    category: standardizeCategory(data.category),
  };
  const response = await API.post<Transaction>(
    "/api/transactions",
    standardizedData
  );
  return response.data;
};

// ✅ Standardize category before sending
export const updateTransaction = async (
  id: number,
  data: UpdateTransactionRequest
): Promise<Transaction> => {
  const standardizedData = {
    ...data,
    category: standardizeCategory(data.category),
  };
  const response = await API.put<Transaction>(
    `/api/transactions/${id}`,
    standardizedData
  );
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await API.delete(`/api/transactions/${id}`);
};
