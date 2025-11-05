import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
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
  Paper,
  Chip,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Add,
  Edit,
  Delete,
  Description,
  AttachMoney,
  CalendarToday,
  Category as CategoryIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import {
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactionService";
import { getUserAccounts } from "../api/accountService";
import type { Transaction, CreateTransactionRequest, Account } from "../types";
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
  "Income",
  "Other",
];

const TransactionsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    name: "",
    amount: 0,
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
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load data");
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

  const handleSubmit = async () => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          name: formData.name,
          amount: formData.amount,
          date: formData.date,
          category: formData.category,
          type: formData.type,
        });
        setSnackbar({
          open: true,
          message: "Transaction updated successfully!",
          severity: "success",
        });
      } else {
        await createTransaction(formData);
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Operation failed",
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Delete failed");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        name: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        type: transaction.type,
        accountId: transaction.accountId,
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        name: "",
        amount: 0,
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
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${colors.grey[900]} 0%, ${colors.grey[800]} 100%)`
            : `linear-gradient(135deg, ${colors.grey[100]} 0%, #ffffff 100%)`,
      }}
    >
      {/* Header Section */}
      <Box mb={4}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(45deg, ${colors.grey[100]}, ${colors.primary[300]})`
                    : `linear-gradient(45deg, ${colors.grey[900]}, ${colors.primary[700]})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Transactions
            </Typography>
            <Typography
              variant="h6"
              color={
                theme.palette.mode === "dark"
                  ? colors.grey[400]
                  : colors.grey[600]
              }
            >
              Manage and track your financial transactions
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.primary[500]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${colors.success[500]}30`,
            }}
          >
            <Typography variant="h4" color="white" fontWeight="bold">
              T
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, ${colors.grey[800]} 0%, ${colors.grey[700]} 100%)`
                    : `linear-gradient(135deg, #ffffff 0%, ${colors.grey[100]} 100%)`,
                p: 3,
                borderRadius: "16px",
                border: `1px solid ${
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[300]
                }`,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `0 8px 32px ${colors.grey[900]}40`
                    : `0 4px 20px ${colors.grey[400]}30`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? `0 12px 40px ${colors.grey[900]}60`
                      : `0 8px 30px ${colors.grey[400]}50`,
                },
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography variant="h6" color="white" fontWeight="bold">
                    ↑
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color={
                    theme.palette.mode === "dark"
                      ? colors.grey[400]
                      : colors.grey[600]
                  }
                  fontWeight="600"
                >
                  Total Income
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.success[400]}
                sx={{ fontSize: "2rem" }}
              >
                +{totalIncome.toFixed(2)} TND
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, ${colors.grey[800]} 0%, ${colors.grey[700]} 100%)`
                    : `linear-gradient(135deg, #ffffff 0%, ${colors.grey[100]} 100%)`,
                p: 3,
                borderRadius: "16px",
                border: `1px solid ${
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[300]
                }`,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `0 8px 32px ${colors.grey[900]}40`
                    : `0 4px 20px ${colors.grey[400]}30`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.error[500]}, ${colors.error[600]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography variant="h6" color="white" fontWeight="bold">
                    ↓
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color={
                    theme.palette.mode === "dark"
                      ? colors.grey[400]
                      : colors.grey[600]
                  }
                  fontWeight="600"
                >
                  Total Expenses
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.error[400]}
                sx={{ fontSize: "2rem" }}
              >
                -{totalExpenses.toFixed(2)} TND
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, ${colors.grey[800]} 0%, ${colors.grey[700]} 100%)`
                    : `linear-gradient(135deg, #ffffff 0%, ${colors.grey[100]} 100%)`,
                p: 3,
                borderRadius: "16px",
                border: `1px solid ${
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[300]
                }`,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `0 8px 32px ${colors.grey[900]}40`
                    : `0 4px 20px ${colors.grey[400]}30`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography variant="h6" color="white" fontWeight="bold">
                    $
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color={
                    theme.palette.mode === "dark"
                      ? colors.grey[400]
                      : colors.grey[600]
                  }
                  fontWeight="600"
                >
                  Net Balance
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  fontSize: "2rem",
                  color:
                    netBalance >= 0 ? colors.success[400] : colors.error[400],
                }}
              >
                {netBalance >= 0 ? "+" : ""}
                {netBalance.toFixed(2)} TND
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.primary[500] }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              background:
                theme.palette.mode === "dark" ? colors.grey[800] : "#ffffff",
            },
          }}
        />
      </Box>

      {/* Transactions Table */}
      <TableContainer
        component={Paper}
        sx={{
          background:
            theme.palette.mode === "dark" ? colors.grey[800] : "#ffffff",
          borderRadius: "16px",
          border: `1px solid ${
            theme.palette.mode === "dark" ? colors.grey[700] : colors.grey[300]
          }`,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 8px 32px ${colors.grey[900]}40`
              : `0 4px 20px ${colors.grey[400]}30`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[100],
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Amount
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                sx={{
                  "&:hover": {
                    background:
                      theme.palette.mode === "dark"
                        ? colors.grey[600]
                        : colors.grey[50],
                  },
                }}
              >
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.type}
                    color={transaction.type === "INCOME" ? "success" : "error"}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    sx={{
                      color:
                        transaction.type === "INCOME"
                          ? colors.success[400]
                          : colors.error[400],
                      fontWeight: 600,
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
                    sx={{ color: colors.primary[500] }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(transaction.id)}
                    sx={{ color: colors.error[500] }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          sx={{
            background:
              theme.palette.mode === "dark" ? colors.grey[800] : "#ffffff",
            borderRadius: "16px",
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? colors.grey[700]
                : colors.grey[300]
            }`,
            mt: 3,
          }}
        >
          <Typography
            variant="h6"
            color={
              theme.palette.mode === "dark"
                ? colors.grey[400]
                : colors.grey[600]
            }
          >
            No transactions found
          </Typography>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add transaction"
        onClick={() => handleOpenDialog()}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: `linear-gradient(135deg, ${colors.success[600]}, ${colors.success[700]})`,
          boxShadow: `0 8px 32px ${colors.success[600]}40`,
          transition: "all 0.3s ease",
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.success[700]}, ${colors.success[800]})`,
            transform: "scale(1.1)",
            boxShadow: `0 12px 40px ${colors.success[600]}60`,
          },
        }}
      >
        <Add />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${colors.grey[800]} 0%, ${colors.grey[700]} 100%)`
                : `linear-gradient(135deg, #ffffff 0%, ${colors.grey[100]} 100%)`,
            borderRadius: "20px",
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? colors.grey[700]
                : colors.grey[300]
            }`,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 24px 64px ${colors.grey[900]}40`
                : `0 24px 64px ${colors.grey[400]}40`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color:
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[900],
            fontWeight: "bold",
            fontSize: "1.5rem",
            textAlign: "center",
            pb: 1,
          }}
        >
          {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ color: colors.primary[500] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: colors.primary[500] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <TextField
              label="Date"
              type="date"
              fullWidth
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
                  borderRadius: "12px",
                },
              }}
            />

            <TextField
              select
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ color: colors.primary[500] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
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
              label="Type"
              fullWidth
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "INCOME" | "EXPENSE",
                })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            >
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </TextField>

            <TextField
              select
              label="Account"
              fullWidth
              value={formData.accountId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accountId: parseInt(e.target.value),
                })
              }
              disabled={!!editingTransaction}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            >
              {availableAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({account.currentBalance.toFixed(2)} TND)
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1.2,
              fontWeight: "bold",
              borderColor: colors.primary[500],
              color: colors.primary[500],
              "&:hover": {
                borderColor: colors.primary[700],
                color: colors.primary[700],
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.name || formData.amount === 0 || !formData.accountId
            }
            sx={{
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
              borderRadius: "12px",
              px: 4,
              py: 1.2,
              fontWeight: "bold",
              boxShadow: `0 4px 12px ${colors.primary[500]}30`,
              "&:hover": {
                background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                boxShadow: `0 6px 16px ${colors.primary[500]}40`,
              },
              "&:disabled": {
                background: `linear-gradient(135deg, ${colors.grey[500]}, ${colors.grey[600]})`,
              },
            }}
          >
            {editingTransaction ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
