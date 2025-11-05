import API from "./axiosConfig";
import type { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest 
} from "../types";

/**
 * Get all transactions for logged-in user
 */
export const getUserTransactions = async (): Promise<Transaction[]> => {
  const response = await API.get<Transaction[]>("/api/transactions");
  return response.data;
};

/**
 * Get transactions for specific month
 */
export const getTransactionsByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  const response = await API.get<Transaction[]>("/api/transactions/month", {
    params: { year, month },
  });
  return response.data;
};

/**
 * Get single transaction by ID
 */
export const getTransactionById = async (id: number): Promise<Transaction> => {
  const response = await API.get<Transaction>(`/api/transactions/${id}`);
  return response.data;
};

/**
 * Create new transaction
 */
export const createTransaction = async (
  data: CreateTransactionRequest
): Promise<Transaction> => {
  const response = await API.post<Transaction>("/api/transactions", data);
  return response.data;
};

/**
 * Update transaction
 */
export const updateTransaction = async (
  id: number,
  data: UpdateTransactionRequest
): Promise<Transaction> => {
  const response = await API.put<Transaction>(`/api/transactions/${id}`, data);
  return response.data;
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (id: number): Promise<void> => {
  await API.delete(`/api/transactions/${id}`);
};