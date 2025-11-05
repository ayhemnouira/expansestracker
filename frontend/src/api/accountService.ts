import API from "./axiosConfig";
import type { 
  Account,
  AccountSummary,
  CreateAccountRequest,
  UpdateAccountRequest, 
 
} from "../types";

/**
 * Get all accounts for logged-in user
 */
export const getUserAccounts = async (enabledOnly: boolean = false): Promise<Account[]> => {
  const response = await API.get<Account[]>("/api/accounts", {
    params: { enabledOnly },
  });
  return response.data;
};

/**
 * Get single account by ID
 */
export const getAccountById = async (id: number): Promise<Account> => {
  const response = await API.get<Account>(`/api/accounts/${id}`);
  return response.data;
};

/**
 * Get account summary
 */
export const getAccountSummary = async (): Promise<AccountSummary> => {
  const response = await API.get<AccountSummary>("/api/accounts/summary");
  return response.data;
};

/**
 * Get accounts by type
 */
export const getAccountsByType = async (type: string): Promise<Account[]> => {
  const response = await API.get<Account[]>(`/api/accounts/type/${type}`);
  return response.data;
};

/**
 * Create new account
 */
export const createAccount = async (data: CreateAccountRequest): Promise<Account> => {
  const response = await API.post<Account>("/api/accounts", data);
  return response.data;
};

/**
 * Update account
 */
export const updateAccount = async (
  id: number,
  data: UpdateAccountRequest
): Promise<Account> => {
  const response = await API.put<Account>(`/api/accounts/${id}`, data);
  return response.data;
};

/**
 * Delete account
 */
export const deleteAccount = async (id: number): Promise<void> => {
  await API.delete(`/api/accounts/${id}`);
};