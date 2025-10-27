import { Box, Grid } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import HeaderBox from "../components/HeaderBox";
import TotalBalanceBox from "../components/TotalBalanceBox";
import MonthlyExpensesChart from "../components/MonthlyExpensesChart";
import type { Account, Transaction } from "../types";
import RightSidebar from "../global/sidebar/myRightSidebar";
import RecentTransactions from "../components/RecentTransactions";
import TransactionOverviewChart from "../components/TransactionOverviewChart";

// Mock data
const mockAccounts: Account[] = [
  {
    id: "1",
    name: "BNA Checking",
    officialName: "Banque Nationale Agricole",
    type: "depository",
    subtype: "checking",
    currentBalance: 5420.75,
    availableBalance: 5200.0,
    mask: "1234",
    institutionId: "bna_001",
    appwriteItemId: "item_1",
    shareableId: "share_bna_001",
    enabled: true,
  },
  {
    id: "2",
    name: "STB Savings",
    officialName: "Société Tunisienne de Banque",
    type: "depository",
    subtype: "savings",
    currentBalance: 12850.5,
    availableBalance: 12850.5,
    mask: "5678",
    institutionId: "stb_001",
    appwriteItemId: "item_2",
    shareableId: "share_stb_001",
    enabled: true,
  },
];

const mockTransactions: Transaction[] = [
  // October 2025
  {
    id: "1",
    name: "Carrefour Market",
    amount: -145.5,
    date: "2025-10-25",
    category: "Groceries",
    type: "expense",
  },
  {
    id: "2",
    name: "Freelance Project",
    amount: 800.0,
    date: "2025-10-24",
    category: "Income",
    type: "income",
  },
  {
    id: "3",
    name: "Café Restaurant",
    amount: -65.0,
    date: "2025-10-23",
    category: "Dining",
    type: "expense",
  },
  {
    id: "4",
    name: "Salary Deposit",
    amount: 2500.0,
    date: "2025-10-20",
    category: "Income",
    type: "income",
  },
  {
    id: "5",
    name: "Agil Internet",
    amount: -49.9,
    date: "2025-10-18",
    category: "Utilities",
    type: "expense",
  },
  {
    id: "6",
    name: "STEG Bill",
    amount: -75.0,
    date: "2025-10-15",
    category: "Utilities",
    type: "expense",
  },
  {
    id: "7",
    name: "Azur City Shopping",
    amount: -200.0,
    date: "2025-10-12",
    category: "Shopping",
    type: "expense",
  },
  {
    id: "8",
    name: "Gas Station",
    amount: -50.0,
    date: "2025-10-10",
    category: "Transport",
    type: "expense",
  },
  {
    id: "9",
    name: "Consulting Work",
    amount: 600.0,
    date: "2025-10-08",
    category: "Income",
    type: "income",
  },
  {
    id: "10",
    name: "Pharmacy",
    amount: -35.0,
    date: "2025-10-05",
    category: "Healthcare",
    type: "expense",
  },

  // September 2025
  {
    id: "11",
    name: "Salary Deposit",
    amount: 2500.0,
    date: "2025-09-20",
    category: "Income",
    type: "income",
  },
  {
    id: "12",
    name: "Rent Payment",
    amount: -600.0,
    date: "2025-09-01",
    category: "Housing",
    type: "expense",
  },
  {
    id: "13",
    name: "Monoprix",
    amount: -120.0,
    date: "2025-09-15",
    category: "Groceries",
    type: "expense",
  },

  // August 2025
  {
    id: "14",
    name: "Salary Deposit",
    amount: 2500.0,
    date: "2025-08-20",
    category: "Income",
    type: "income",
  },
  {
    id: "15",
    name: "Vacation Expenses",
    amount: -450.0,
    date: "2025-08-10",
    category: "Travel",
    type: "expense",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  const totalBalance = mockAccounts.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0
  );

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Column - Main Content (65%) */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          {/* Header */}
          <HeaderBox
            type="greeting"
            title="Welcome back,"
            user={user?.username || "Guest"}
            subtext="Here's your financial overview for today"
          />

          {/* Top Cards Row */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TotalBalanceBox
                accounts={mockAccounts}
                totalBanks={mockAccounts.length}
                totalCurrentBalance={totalBalance}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MonthlyExpensesChart />
            </Grid>
          </Grid>

          {/* Recent Transactions */}
          <Box sx={{ mt: 3 }}>
            <RecentTransactions
              transactions={mockTransactions}
              maxDisplay={8}
            />
          </Box>
        </Grid>

        {/* Right Sidebar (35%) */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Box sx={{ position: "sticky", top: 90 }}>
            <RightSidebar
              banks={mockAccounts}
              userName={user?.username || "Guest"}
              userEmail={user?.email}
            />
          </Box>
        </Grid>

        {/* Full Width Transaction Overview Chart */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ maxWidth: 1600, mx: "auto" }}>
            <TransactionOverviewChart transactions={mockTransactions} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
