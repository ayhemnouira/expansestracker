import { Box, Grid, CircularProgress, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getUserAccounts, getAccountSummary } from "../api/accountService";
import { getUserTransactions } from "../api/transactionService";
import type { Account, Transaction, AccountSummary } from "../types";
import HeaderBox from "../components/HeaderBox";
import TotalBalanceBox from "../components/TotalBalanceBox";
import MonthlyExpensesChart from "../components/MonthlyExpensesChart";
import RightSidebar from "../global/sidebar/myRightSidebar";
import RecentTransactions from "../components/RecentTransactions";
import TransactionOverviewChart from "../components/TransactionOverviewChart";

const Dashboard = () => {
  const { user } = useAuth();

  // State management
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [accountsData, transactionsData, summaryData] = await Promise.all(
          [
            getUserAccounts(true), // Only enabled accounts
            getUserTransactions(),
            getAccountSummary(),
          ]
        );

        setAccounts(accountsData);
        setTransactions(transactionsData);
        setSummary(summaryData);
        setError(null);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        console.error("Error fetching dashboard data:", error);
        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const totalBalance = summary?.totalBalance || 0;

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3, pl: 0 }}>
      <Grid container spacing={3}>
        {/* Left Column - Main Content */}
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
                accounts={accounts}
                totalBanks={accounts.length}
                totalCurrentBalance={totalBalance}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MonthlyExpensesChart transactions={transactions} />
            </Grid>
          </Grid>

          {/* Recent Transactions */}
          <Box sx={{ mt: 3 }}>
            <RecentTransactions transactions={transactions} maxDisplay={8} />
          </Box>
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Box sx={{ position: "sticky", top: 90 }}>
            <RightSidebar
              banks={accounts}
              userName={user?.username || "Guest"}
              userEmail={user?.email}
            />
          </Box>
        </Grid>

        {/* Full Width Transaction Overview Chart */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ maxWidth: 1600, mx: "auto" }}>
            <TransactionOverviewChart transactions={transactions} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
