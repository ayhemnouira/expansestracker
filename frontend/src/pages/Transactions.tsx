import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Divider,
  Stack,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
// ✅ MUI v6 Grid2
import { useTheme } from "@mui/material/styles";
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
  Category as CategoryIcon,
  Search as SearchIcon,
  Close,
  Receipt,
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from "@mui/icons-material";

import {
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactionService";
import { getUserAccounts } from "../api/accountService";
import type { Transaction, Account } from "../types";
import { tokens } from "../theme/theme";

const categories = [
  "Groceries",
  "Dining",
  "Transport",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Entertainment",
  "Housing",
  "Salary",
  "Investment",
  "Other",
];

// ✅ Local interface to avoid type conflicts
interface FormDataType {
  name: string;
  amount: string;
  date: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  accountId: number;
}

// Helper function for error handling
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || "Operation failed";
  }
  return "An unexpected error occurred";
};

const TransactionsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);

  // ✅ FIXED: Using local interface with string amount
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Other",
    type: "EXPENSE",
    accountId: 0,
  });

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, transactionsData] = await Promise.all([
          getUserAccounts(true),
          getUserTransactions(),
        ]);
        setAvailableAccounts(accountsData);
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
        if (accountsData.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: accountsData[0].id }));
        }
        calculateSummaries(transactionsData);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransactions(filtered);
    calculateSummaries(filtered);
  }, [searchQuery, transactions]);

  const calculateSummaries = (trans: Transaction[]) => {
    const income = trans
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = trans
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setNetBalance(income - expenses);
  };

  // ✅ FIXED: Converts string to number before sending to API
  const handleSubmit = async () => {
    try {
      const submitData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        type: formData.type,
        accountId: formData.accountId,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          name: submitData.name,
          amount: submitData.amount,
          date: submitData.date,
          category: submitData.category,
          type: submitData.type,
        });
        setSnackbar({
          open: true,
          message: "Transaction updated successfully!",
          severity: "success",
        });
      } else {
        await createTransaction(submitData);
        setSnackbar({
          open: true,
          message: "Transaction created successfully!",
          severity: "success",
        });
      }

      const updatedTransactions = await getUserTransactions();
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      calculateSummaries(updatedTransactions);
      handleCloseDialog();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    try {
      await deleteTransaction(id);
      const updatedTransactions = await getUserTransactions();
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      calculateSummaries(updatedTransactions);
      setSnackbar({
        open: true,
        message: "Transaction deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  // ✅ FIXED: Handles empty string for new transactions
  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        name: transaction.name,
        amount: transaction.amount.toString(),
        date: transaction.date,
        category: transaction.category,
        type: transaction.type,
        accountId: transaction.accountId,
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "Other",
        type: "EXPENSE",
        accountId: availableAccounts[0]?.id || 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: isDark ? "#0a0e27" : "#f5f7fa",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "#0a0e27" : "#f5f7fa",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            color: isDark ? "#fff" : "#1a1a2e",
            mb: 1,
          }}
        >
          Transactions
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isDark ? "#a0a0a0" : "#64748b",
          }}
        >
          Track and manage your financial activities
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards - ✅ FIXED: MUI v6 Grid2 syntax */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Income
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {totalIncome.toFixed(2)} TND
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #5f1e3a 0%, #982a5c 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {totalExpenses.toFixed(2)} TND
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingDown fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background:
                netBalance >= 0
                  ? isDark
                    ? "linear-gradient(135deg, #1e5f3a 0%, #2a9862 100%)"
                    : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  : isDark
                  ? "linear-gradient(135deg, #5f1e1e 0%, #982a2a 100%)"
                  : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Net Balance
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {netBalance >= 0 ? "+" : ""}
                    {netBalance.toFixed(2)} TND
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountBalance fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          bgcolor: isDark ? "#16213e" : "#fff",
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: isDark ? "#1a2332" : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? "#2a3441" : "#e2e8f0",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                minWidth: 200,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                },
              }}
            >
              New Transaction
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          bgcolor: isDark ? "#16213e" : "#fff",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDark ? "#1a2332" : "#f8fafc",
                }}
              >
                <TableCell
                  sx={{ fontWeight: 700, color: isDark ? "#fff" : "#1a1a2e" }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: isDark ? "#fff" : "#1a1a2e" }}
                >
                  Transaction
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: isDark ? "#fff" : "#1a1a2e" }}
                >
                  Category
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: isDark ? "#fff" : "#1a1a2e" }}
                >
                  Account
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: isDark ? "#fff" : "#1a1a2e" }}
                >
                  Amount
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: isDark ? "#fff" : "#1a1a2e" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Receipt
                      sx={{
                        fontSize: 64,
                        color: isDark ? "#3a4a5c" : "#cbd5e1",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color={isDark ? "#a0a0a0" : "#64748b"}
                    >
                      No transactions found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={isDark ? "#707070" : "#94a3b8"}
                      mt={1}
                    >
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Create your first transaction"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    sx={{
                      "&:hover": {
                        bgcolor: isDark ? "#1a2332" : "#f8fafc",
                      },
                    }}
                  >
                    <TableCell sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}>
                      {new Date(transaction.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        sx={{ color: isDark ? "#fff" : "#1a1a2e" }}
                      >
                        {transaction.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category}
                        size="small"
                        sx={{
                          bgcolor: isDark ? "#2a3441" : "#f1f5f9",
                          color: isDark ? "#a0a0a0" : "#64748b",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}>
                      {transaction.accountName || "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body1"
                        fontWeight="700"
                        sx={{
                          color:
                            transaction.type === "INCOME"
                              ? "#10b981"
                              : "#ef4444",
                        }}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {transaction.amount.toFixed(2)} TND
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(transaction)}
                        sx={{
                          color: isDark ? "#667eea" : "#667eea",
                          "&:hover": {
                            bgcolor: isDark ? "#2a3441" : "#f1f5f9",
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(transaction.id)}
                        sx={{
                          color: "#ef4444",
                          "&:hover": {
                            bgcolor: isDark ? "#2a3441" : "#fef2f2",
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modern Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: isDark ? "#16213e" : "#fff",
            backgroundImage: "none",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{ color: isDark ? "#fff" : "#1a1a2e" }}
            >
              {editingTransaction ? "Edit Transaction" : "New Transaction"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <DialogContent sx={{ p: 0 }}>
            <Stack spacing={3}>
              {/* Transaction Type Toggle */}
              <Box>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  mb={1.5}
                  sx={{ color: isDark ? "#a0a0a0" : "#64748b" }}
                >
                  Transaction Type
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    fullWidth
                    variant={
                      formData.type === "EXPENSE" ? "contained" : "outlined"
                    }
                    onClick={() =>
                      setFormData({ ...formData, type: "EXPENSE" })
                    }
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      ...(formData.type === "EXPENSE" && {
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        border: "none",
                      }),
                    }}
                  >
                    Expense
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      formData.type === "INCOME" ? "contained" : "outlined"
                    }
                    onClick={() => setFormData({ ...formData, type: "INCOME" })}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      ...(formData.type === "INCOME" && {
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        border: "none",
                      }),
                    }}
                  >
                    Income
                  </Button>
                </Box>
              </Box>

              {/* ✅ FIXED: Label always visible */}
              <TextField
                label="Transaction Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Grocery Shopping"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* ✅ FIXED: Empty string prevents stuck "0" */}
              <TextField
                label="Amount (TND)"
                type="number"
                fullWidth
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">TND</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Date"
                type="date"
                fullWidth
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: colors.primary[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                select
                label="Category"
                fullWidth
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: colors.primary[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Account"
                fullWidth
                required
                value={formData.accountId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountId: parseInt(e.target.value),
                  })
                }
                disabled={!!editingTransaction}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                {availableAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.currentBalance.toFixed(2)} TND)
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>

          <Box display="flex" gap={2} mt={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCloseDialog}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                !formData.amount ||
                formData.amount === "0" ||
                !formData.accountId
              }
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
                "&:disabled": {
                  background: isDark ? "#2a3441" : "#e2e8f0",
                },
              }}
            >
              {editingTransaction ? "Update Transaction" : "Create Transaction"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsPage;
