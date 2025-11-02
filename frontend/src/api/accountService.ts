import API from "./axiosConfig";
import type { Account } from "../types";

export const getUserAccounts = async (): Promise<Account[]> => {
  const response = await API.get<Account[]>("/api/accounts");
  return response.data;
};

export const createAccount = async (accountData: {
  name: string;
  type: string;
  initialBalance: number;
}): Promise<Account> => {
  const response = await API.post<Account>("/api/accounts", accountData);
  return response.data;
};