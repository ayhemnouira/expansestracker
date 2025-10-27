export interface Account {
  id: string;
  name: string;
  officialName: string;
  type: string;
  subtype: string;
  currentBalance: number;
  availableBalance: number;
  mask: string;
  institutionId: string;
  enabled: boolean;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
}

export interface UserProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
}
export interface Account {
  id: string;
  name: string;
  officialName: string;
  type: string;
  subtype: string;
  currentBalance: number;
  availableBalance: number;
  mask: string;
  institutionId: string;
  appwriteItemId?: string; // Add this
  shareableId?: string; // Add this
  enabled: boolean;
}
export interface CreditCardProps {
  account: Account;
  userName: string;
  showBalance?: boolean;
}
export interface DoughnutChartProps {
  accounts: Account[];
}
