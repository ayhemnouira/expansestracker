import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
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
import { useAuth } from "../context/use-auth";

const Dashboard = () => {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [accountsData, transactionsData, summaryData] = await Promise.all(
          [getUserAccounts(true), getUserTransactions(), getAccountSummary()],
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
          <Fade in timeout={600}>
            <Box>
              <HeaderBox
                type="greeting"
                title="Welcome back,"
                user={user?.username || "Guest"}
                subtext="Here's your financial overview for today"
              />
            </Box>
          </Fade>

          {/* Top Cards Row */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
              <Grow in timeout={800} style={{ width: "100%" }}>
                <Box sx={{ width: "100%" }}>
                  <TotalBalanceBox
                    accounts={accounts}
                    totalBanks={accounts.length}
                    totalCurrentBalance={totalBalance}
                  />
                </Box>
              </Grow>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
              <Grow
                in
                timeout={1000}
                style={{ width: "100%" }}
                onEntered={() => window.dispatchEvent(new Event("resize"))}
              >
                <Box sx={{ width: "100%" }}>
                  <MonthlyExpensesChart transactions={transactions} />
                </Box>
              </Grow>
            </Grid>
          </Grid>

          {/* Recent Transactions */}
          <Fade in timeout={1200}>
            <Box sx={{ mt: 3 }}>
              <RecentTransactions transactions={transactions} maxDisplay={8} />
            </Box>
          </Fade>
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Zoom in timeout={1400}>
            <Box>
              <Box sx={{ position: "sticky", top: 90 }}>
                <RightSidebar
                  banks={accounts}
                  userName={user?.username || "Guest"}
                  userEmail={user?.email}
                />
              </Box>
            </Box>
          </Zoom>
        </Grid>

        {/* Full Width Transaction Overview Chart */}
        <Grid size={{ xs: 12 }}>
          <Grow in timeout={1600}>
            <Box>
              <Box sx={{ maxWidth: 1600, mx: "auto" }}>
                <TransactionOverviewChart transactions={transactions} />
              </Box>
            </Box>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
