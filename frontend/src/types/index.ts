export interface Account {
  id: number;
  name: string;
  officialName?: string;
  type: string;
  subtype?: string;
  currentBalance: number;
  availableBalance: number;
  mask?: string;
  institutionId?: string;
  shareableId: string;
  enabled: boolean;
  transactionCount: number;
}

export interface CreateAccountRequest {
  name: string;
  officialName?: string;
  type: string;
  subtype?: string;
  initialBalance: number;
  mask?: string;
  institutionId?: string;
}

export interface UpdateAccountRequest {
  name: string;
  officialName?: string;
  subtype?: string;
  mask?: string;
  enabled?: boolean;
}

export interface AccountSummary {
  totalAccounts: number;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}


export interface UserProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
}

export interface CreditCardProps {
  account: Account;
  userName: string;
  showBalance?: boolean;
}
export interface DoughnutChartProps {
  accounts: Account[];
}
export interface Transaction {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  accountId: number;
  accountName: string;
}

export interface CreateTransactionRequest {
  name: string;
  amount: number;
  date: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  accountId: number;
}

export interface UpdateTransactionRequest {
  name: string;
  amount: number;
  date: string;
  category: string;
  type: "INCOME" | "EXPENSE";
}