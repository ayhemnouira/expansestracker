import API from "./axiosConfig";
import type { Transaction } from "../types";

export const getUserTransactions = async (): Promise<Transaction[]> => {
  const response = await API.get<Transaction[]>("/api/transactions");
  return response.data;
};

export const createTransaction = async (transactionData: {
  accountId: string;
  name: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}): Promise<Transaction> => {
  const response = await API.post<Transaction>("/api/transactions", transactionData);
  return response.data;
};