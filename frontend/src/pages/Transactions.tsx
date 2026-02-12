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
  Stack,
  Card,
  CardContent,
  Grid,
  Fade,
  Avatar,
  Slide,
  Grow,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
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
  AttachFile,
  CloudUpload,
} from "@mui/icons-material";

import {
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactionService";
import { getUserAccounts } from "../api/accountService";
import { uploadDocument } from "../api/documentService";
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

const categoryColors: Record<string, string> = {
  Groceries: "#10b981",
  Dining: "#f59e0b",
  Transport: "#3b82f6",
  Utilities: "#8b5cf6",
  Shopping: "#ec4899",
  Healthcare: "#ef4444",
  Entertainment: "#06b6d4",
  Housing: "#6366f1",
  Salary: "#22c55e",
  Investment: "#14b8a6",
  Other: "#64748b",
};

const categoryIcons: Record<string, string> = {
  Groceries: "🛒",
  Dining: "🍽️",
  Transport: "🚗",
  Utilities: "💡",
  Shopping: "🛍️",
  Healthcare: "🏥",
  Entertainment: "🎬",
  Housing: "🏠",
  Salary: "💰",
  Investment: "📈",
  Other: "📋",
};

interface FormDataType {
  name: string;
  amount: string;
  date: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  accountId: number;
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        t.category.toLowerCase().includes(searchQuery.toLowerCase()),
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
      const submitData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        type: formData.type,
        accountId: formData.accountId,
      };

      let transactionId: number;

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          name: submitData.name,
          amount: submitData.amount,
          date: submitData.date,
          category: submitData.category,
          type: submitData.type,
        });
        transactionId = editingTransaction.id;
        setSnackbar({
          open: true,
          message: "Transaction updated successfully!",
          severity: "success",
        });
      } else {
        const newTransaction = await createTransaction(submitData);
        transactionId = newTransaction.id;
        setSnackbar({
          open: true,
          message: "Transaction created successfully!",
          severity: "success",
        });
      }

      if (selectedFile) {
        try {
          await uploadDocument({
            file: selectedFile,
            documentType: "RECEIPT",
            transactionId: transactionId,
          });
          setSnackbar({
            open: true,
            message: "Transaction and document saved successfully!",
            severity: "success",
          });
        } catch (err) {
          setSnackbar({
            open: true,
            message: `Transaction saved but document upload failed: ${
              err instanceof Error ? err.message : "Unknown error"
            }`,
            severity: "error",
          });
        }
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
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setSelectedFile(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "File size must be less than 5MB",
          severity: "error",
        });
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: "Only PDF, JPG, and PNG files are allowed",
          severity: "error",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: 3,
          bgcolor: isDark ? "#060918" : "#ffffff",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={70}
            thickness={3}
            sx={{
              color: isDark ? "#6366f1" : "#4f46e5",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 50,
              height: 50,
              borderRadius: "50%",
              bgcolor: alpha(isDark ? "#6366f1" : "#4f46e5", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt
              sx={{ fontSize: 24, color: isDark ? "#6366f1" : "#4f46e5" }}
            />
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}
        >
          Loading transactions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3, pl: 0 }}>
      {/* Modern Header */}
      <Fade in timeout={600}>
        <Box mb={5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  background: isDark
                    ? "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)"
                    : "linear-gradient(135deg, #1e293b 0%, #6366f1 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 0.5,
                  letterSpacing: "-0.02em",
                }}
              >
                Transactions
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? "#64748b" : "#64748b",
                  fontWeight: 500,
                  fontSize: "1.05rem",
                }}
              >
                Track and manage your financial activities
              </Typography>
            </Box>
            <Chip
              icon={<Receipt sx={{ fontSize: 20 }} />}
              label={`${filteredTransactions.length} Total`}
              sx={{
                background: isDark
                  ? "rgba(99, 102, 241, 0.12)"
                  : "rgba(99, 102, 241, 0.1)",
                color: isDark ? "#a5b4fc" : colors.primary[700],
                fontWeight: 700,
                fontSize: "0.9rem",
                px: 1,
                py: 2.5,
                borderRadius: "12px",
                border: `1px solid ${
                  isDark
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(99, 102, 241, 0.15)"
                }`,
              }}
            />
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: "16px",
                border: `1px solid ${colors.error[400]}40`,
                backdropFilter: "blur(10px)",
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Enhanced Stats Cards - IMPROVED FOR DARK MODE */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Grow in timeout={800}>
            <Card
              sx={{
                background: isDark
                  ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "20px",
                p: 3,
                position: "relative",
                overflow: "hidden",
                border: "none",
                boxShadow: isDark
                  ? "0 4px 16px rgba(5, 95, 70, 0.2)"
                  : "0 8px 32px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark
                    ? "0 8px 24px rgba(5, 95, 70, 0.3)"
                    : "0 12px 48px rgba(16, 185, 129, 0.4)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  background: isDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.75rem",
                        mb: 1,
                      }}
                    >
                      Total Income
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.75rem", md: "2.25rem" },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {totalIncome.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.75)",
                        fontWeight: 600,
                      }}
                    >
                      TND
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grow>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Grow in timeout={1000}>
            <Card
              sx={{
                background: isDark
                  ? "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)"
                  : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                borderRadius: "20px",
                p: 3,
                position: "relative",
                overflow: "hidden",
                border: "none",
                boxShadow: isDark
                  ? "0 4px 16px rgba(153, 27, 27, 0.2)"
                  : "0 8px 32px rgba(239, 68, 68, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark
                    ? "0 8px 24px rgba(153, 27, 27, 0.3)"
                    : "0 12px 48px rgba(239, 68, 68, 0.4)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  background: isDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.75rem",
                        mb: 1,
                      }}
                    >
                      Total Expenses
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.75rem", md: "2.25rem" },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {totalExpenses.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.75)",
                        fontWeight: 600,
                      }}
                    >
                      TND
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrendingDown sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grow>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Grow in timeout={1200}>
            <Card
              sx={{
                background: isDark
                  ? "linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                borderRadius: "20px",
                p: 3,
                position: "relative",
                overflow: "hidden",
                border: "none",
                boxShadow: isDark
                  ? "0 4px 16px rgba(55, 48, 163, 0.2)"
                  : "0 8px 32px rgba(99, 102, 241, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark
                    ? "0 8px 24px rgba(55, 48, 163, 0.3)"
                    : "0 12px 48px rgba(99, 102, 241, 0.4)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  background: isDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.75rem",
                        mb: 1,
                      }}
                    >
                      Net Balance
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.75rem", md: "2.25rem" },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {netBalance >= 0 ? "+" : ""}
                      {netBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.75)",
                        fontWeight: 600,
                      }}
                    >
                      TND
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AccountBalance sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Modern Search & Add Button */}
      <Fade in timeout={1400}>
        <Card
          sx={{
            borderRadius: "20px",
            mb: 4,
            boxShadow: isDark
              ? "0 2px 12px rgba(0,0,0,0.2)"
              : "0 4px 24px rgba(0,0,0,0.08)",
            bgcolor: isDark ? alpha("#1e293b", 0.4) : "#fff",
            backdropFilter: "blur(20px)",
            border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: isDark
                ? "0 4px 16px rgba(0,0,0,0.3)"
                : "0 8px 32px rgba(0,0,0,0.12)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search transactions by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{
                          color: isDark ? "#6366f1" : "#4f46e5",
                          fontSize: 24,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: isDark ? alpha("#0f172a", 0.3) : "#f8fafc",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: isDark
                        ? alpha("#fff", 0.06)
                        : alpha("#6366f1", 0.2),
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#6366f1" : "#4f46e5",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isDark ? "#6366f1" : "#4f46e5",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  minWidth: { xs: "100%", sm: 220 },
                  py: 2,
                  borderRadius: "14px",
                  background: isDark
                    ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: isDark
                    ? "0 4px 16px rgba(79, 70, 229, 0.25)"
                    : "0 8px 24px rgba(99, 102, 241, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: isDark
                      ? "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)"
                      : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: isDark
                      ? "0 6px 20px rgba(79, 70, 229, 0.35)"
                      : "0 12px 32px rgba(99, 102, 241, 0.5)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                New Transaction
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>

      {/* Desktop Table View - Enhanced */}
      <Fade in timeout={1600}>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow: isDark
                ? "0 2px 12px rgba(0,0,0,0.2)"
                : "0 4px 24px rgba(0,0,0,0.08)",
              bgcolor: isDark ? alpha("#1e293b", 0.4) : "#fff",
              backdropFilter: "blur(20px)",
              border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: isDark ? alpha("#0f172a", 0.3) : "#f8fafc",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: isDark ? "#94a3b8" : "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        py: 2.5,
                        borderBottom: `2px solid ${isDark ? alpha("#fff", 0.06) : "#e2e8f0"}`,
                      }}
                    >
                      Transaction
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: isDark ? "#94a3b8" : "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        py: 2.5,
                        borderBottom: `2px solid ${isDark ? alpha("#fff", 0.06) : "#e2e8f0"}`,
                      }}
                    >
                      Category
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: isDark ? "#94a3b8" : "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        py: 2.5,
                        borderBottom: `2px solid ${isDark ? alpha("#fff", 0.06) : "#e2e8f0"}`,
                      }}
                    >
                      Account
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: isDark ? "#94a3b8" : "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        py: 2.5,
                        borderBottom: `2px solid ${isDark ? alpha("#fff", 0.06) : "#e2e8f0"}`,
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 800,
                        color: isDark ? "#94a3b8" : "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        py: 2.5,
                        borderBottom: `2px solid ${isDark ? alpha("#fff", 0.06) : "#e2e8f0"}`,
                      }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 800,
                        color: isDark ? "#94a3b8" : "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        py: 2.5,
                        borderBottom: `2px solid ${isDark ? alpha("#fff", 0.06) : "#e2e8f0"}`,
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{
                          py: 12,
                          borderBottom: "none",
                        }}
                      >
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: "24px",
                            bgcolor: isDark
                              ? alpha("#6366f1", 0.08)
                              : alpha("#6366f1", 0.08),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 3,
                          }}
                        >
                          <Receipt
                            sx={{
                              fontSize: 48,
                              color: isDark ? "#6366f1" : "#4f46e5",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight="800"
                          sx={{
                            color: isDark ? "#e2e8f0" : "#0f172a",
                            mb: 1.5,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          No transactions found
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: isDark ? "#64748b" : "#94a3b8",
                            maxWidth: 400,
                            mx: "auto",
                            lineHeight: 1.7,
                          }}
                        >
                          {searchQuery
                            ? "Try adjusting your search terms or filters"
                            : "Create your first transaction to start tracking your finances"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        sx={{
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor: isDark
                              ? alpha("#6366f1", 0.06)
                              : alpha("#6366f1", 0.03),
                          },
                          "& td": {
                            borderBottom: `1px solid ${isDark ? alpha("#fff", 0.04) : "#f1f5f9"}`,
                          },
                        }}
                      >
                        <TableCell sx={{ py: 3 }}>
                          <Box display="flex" alignItems="center" gap={2.5}>
                            <Avatar
                              sx={{
                                width: 52,
                                height: 52,
                                bgcolor:
                                  transaction.type === "INCOME"
                                    ? alpha("#10b981", isDark ? 0.12 : 0.15)
                                    : alpha("#ef4444", isDark ? 0.12 : 0.15),
                                borderRadius: "14px",
                                fontSize: "1.5rem",
                              }}
                            >
                              {categoryIcons[transaction.category] || "📋"}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body1"
                                fontWeight="700"
                                sx={{
                                  color: isDark ? "#e2e8f0" : "#0f172a",
                                  mb: 0.5,
                                  fontSize: "1rem",
                                }}
                              >
                                {transaction.name}
                              </Typography>
                              <Chip
                                label={
                                  transaction.type === "INCOME"
                                    ? "Income"
                                    : "Expense"
                                }
                                size="small"
                                sx={{
                                  bgcolor:
                                    transaction.type === "INCOME"
                                      ? alpha("#10b981", isDark ? 0.1 : 0.1)
                                      : alpha("#ef4444", isDark ? 0.1 : 0.1),
                                  color:
                                    transaction.type === "INCOME"
                                      ? "#10b981"
                                      : "#ef4444",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: "20px",
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.category}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                categoryColors[transaction.category] ||
                                  "#64748b",
                                isDark ? 0.12 : 0.15,
                              ),
                              color:
                                categoryColors[transaction.category] ||
                                "#64748b",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              borderRadius: "10px",
                              px: 1.5,
                              py: 0.25,
                              border: `1px solid ${alpha(
                                categoryColors[transaction.category] ||
                                  "#64748b",
                                isDark ? 0.2 : 0.3,
                              )}`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{ color: isDark ? "#94a3b8" : "#64748b" }}
                          >
                            {transaction.accountName || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{ color: isDark ? "#94a3b8" : "#64748b" }}
                          >
                            {new Date(transaction.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="h6"
                            fontWeight="800"
                            sx={{
                              color:
                                transaction.type === "INCOME"
                                  ? "#10b981"
                                  : "#ef4444",
                              fontSize: "1.1rem",
                            }}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}
                            {transaction.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                color: isDark ? "#64748b" : "#94a3b8",
                                fontWeight: 600,
                              }}
                            >
                              TND
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(transaction)}
                              sx={{
                                color: "white",
                                bgcolor: isDark ? "#4f46e5" : "#6366f1",
                                borderRadius: "10px",
                                width: 36,
                                height: 36,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: isDark ? "#4338ca" : "#4f46e5",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(transaction.id)}
                              sx={{
                                color: "white",
                                bgcolor: isDark ? "#b91c1c" : "#ef4444",
                                borderRadius: "10px",
                                width: 36,
                                height: 36,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: isDark ? "#991b1b" : "#dc2626",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Fade>

      {/* Mobile Card View - Enhanced */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {filteredTransactions.length === 0 ? (
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow: isDark
                ? "0 2px 12px rgba(0,0,0,0.2)"
                : "0 4px 24px rgba(0,0,0,0.08)",
              bgcolor: isDark ? alpha("#1e293b", 0.4) : "#fff",
              p: 6,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "24px",
                bgcolor: isDark
                  ? alpha("#6366f1", 0.08)
                  : alpha("#6366f1", 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <Receipt
                sx={{ fontSize: 48, color: isDark ? "#6366f1" : "#4f46e5" }}
              />
            </Box>
            <Typography
              variant="h5"
              fontWeight="800"
              sx={{ color: isDark ? "#e2e8f0" : "#0f172a", mb: 1.5 }}
            >
              No transactions found
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: isDark ? "#64748b" : "#94a3b8" }}
            >
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first transaction"}
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3}>
            {filteredTransactions.map((transaction, index) => (
              <Grow key={transaction.id} in timeout={600 + index * 100}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: isDark
                      ? "0 2px 12px rgba(0,0,0,0.2)"
                      : "0 4px 24px rgba(0,0,0,0.08)",
                    bgcolor: isDark ? alpha("#1e293b", 0.4) : "#fff",
                    border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
                    p: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
                        ? "0 4px 16px rgba(0,0,0,0.3)"
                        : "0 8px 32px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2.5}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor:
                            transaction.type === "INCOME"
                              ? alpha("#10b981", isDark ? 0.12 : 0.15)
                              : alpha("#ef4444", isDark ? 0.12 : 0.15),
                          borderRadius: "14px",
                          fontSize: "1.75rem",
                        }}
                      >
                        {categoryIcons[transaction.category] || "📋"}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="800"
                          sx={{
                            color: isDark ? "#e2e8f0" : "#0f172a",
                            mb: 0.5,
                          }}
                        >
                          {transaction.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark ? "#64748b" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          {new Date(transaction.date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="h5"
                        fontWeight="900"
                        sx={{
                          color:
                            transaction.type === "INCOME"
                              ? "#10b981"
                              : "#ef4444",
                        }}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {transaction.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? "#64748b" : "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        TND
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
                    <Chip
                      label={transaction.category}
                      size="small"
                      sx={{
                        bgcolor: alpha(
                          categoryColors[transaction.category] || "#64748b",
                          isDark ? 0.12 : 0.15,
                        ),
                        color:
                          categoryColors[transaction.category] || "#64748b",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "10px",
                        border: `1px solid ${alpha(
                          categoryColors[transaction.category] || "#64748b",
                          isDark ? 0.2 : 0.3,
                        )}`,
                      }}
                    />
                    <Chip
                      label={transaction.accountName || "N/A"}
                      size="small"
                      sx={{
                        bgcolor: isDark ? alpha("#fff", 0.04) : "#f1f5f9",
                        color: isDark ? "#94a3b8" : "#64748b",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "10px",
                      }}
                    />
                    <Chip
                      label={
                        transaction.type === "INCOME" ? "Income" : "Expense"
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          transaction.type === "INCOME"
                            ? alpha("#10b981", isDark ? 0.1 : 0.1)
                            : alpha("#ef4444", isDark ? 0.1 : 0.1),
                        color:
                          transaction.type === "INCOME" ? "#10b981" : "#ef4444",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "10px",
                      }}
                    />
                  </Box>

                  <Box display="flex" gap={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(transaction)}
                      sx={{
                        borderRadius: "12px",
                        py: 1.25,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: isDark ? "#4f46e5" : "#6366f1",
                        borderWidth: "2px",
                        color: isDark ? "#6366f1" : "#4f46e5",
                        "&:hover": {
                          borderWidth: "2px",
                          borderColor: isDark ? "#4338ca" : "#4f46e5",
                          bgcolor: alpha(isDark ? "#4f46e5" : "#6366f1", 0.05),
                        },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(transaction.id)}
                      sx={{
                        borderRadius: "12px",
                        py: 1.25,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: isDark ? "#b91c1c" : "#ef4444",
                        borderWidth: "2px",
                        color: isDark ? "#ef4444" : "#dc2626",
                        "&:hover": {
                          borderWidth: "2px",
                          borderColor: isDark ? "#991b1b" : "#dc2626",
                          bgcolor: alpha(isDark ? "#b91c1c" : "#ef4444", 0.05),
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grow>
            ))}
          </Stack>
        )}
      </Box>

      {/* Enhanced Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" } as any}
        PaperProps={{
          sx: {
            borderRadius: "28px",
            bgcolor: isDark ? "#0f172a" : "#fff",
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 20px 40px rgba(0, 0, 0, 0.5)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
          },
        }}
      >
        {/* Dialog Header with Gradient */}
        <Box
          sx={{
            background: isDark
              ? "linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            p: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              background: isDark
                ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ position: "relative" }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  mb: 0.5,
                  letterSpacing: "-0.01em",
                }}
              >
                {editingTransaction ? "Edit Transaction" : "New Transaction"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
              >
                {editingTransaction
                  ? "Update transaction details"
                  : "Add a new transaction to your records"}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.25)",
                },
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3.5}>
            {/* Transaction Type Selection */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="700"
                mb={2}
                sx={{
                  color: isDark ? "#94a3b8" : "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                Transaction Type
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  fullWidth
                  variant={
                    formData.type === "EXPENSE" ? "contained" : "outlined"
                  }
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  sx={{
                    py: 2.5,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    ...(formData.type === "EXPENSE"
                      ? {
                          background: isDark
                            ? "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)"
                            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          boxShadow: isDark
                            ? "0 4px 16px rgba(153, 27, 27, 0.3)"
                            : "0 8px 24px rgba(239, 68, 68, 0.4)",
                          border: "none",
                          "&:hover": {
                            background: isDark
                              ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                              : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                            boxShadow: isDark
                              ? "0 6px 20px rgba(153, 27, 27, 0.4)"
                              : "0 12px 32px rgba(239, 68, 68, 0.5)",
                          },
                        }
                      : {
                          borderColor: isDark ? alpha("#fff", 0.08) : "#e2e8f0",
                          borderWidth: "2px",
                          color: isDark ? "#94a3b8" : "#64748b",
                          "&:hover": {
                            borderWidth: "2px",
                            borderColor: isDark ? "#b91c1c" : "#ef4444",
                            bgcolor: alpha(
                              isDark ? "#b91c1c" : "#ef4444",
                              0.05,
                            ),
                          },
                        }),
                  }}
                >
                  💸 Expense
                </Button>
                <Button
                  fullWidth
                  variant={
                    formData.type === "INCOME" ? "contained" : "outlined"
                  }
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  sx={{
                    py: 2.5,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    ...(formData.type === "INCOME"
                      ? {
                          background: isDark
                            ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          boxShadow: isDark
                            ? "0 4px 16px rgba(5, 95, 70, 0.3)"
                            : "0 8px 24px rgba(16, 185, 129, 0.4)",
                          border: "none",
                          "&:hover": {
                            background: isDark
                              ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
                              : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            boxShadow: isDark
                              ? "0 6px 20px rgba(5, 95, 70, 0.4)"
                              : "0 12px 32px rgba(16, 185, 129, 0.5)",
                          },
                        }
                      : {
                          borderColor: isDark ? alpha("#fff", 0.08) : "#e2e8f0",
                          borderWidth: "2px",
                          color: isDark ? "#94a3b8" : "#64748b",
                          "&:hover": {
                            borderWidth: "2px",
                            borderColor: isDark ? "#047857" : "#10b981",
                            bgcolor: alpha(
                              isDark ? "#047857" : "#10b981",
                              0.05,
                            ),
                          },
                        }),
                  }}
                >
                  💰 Income
                </Button>
              </Box>
            </Box>

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
                  borderRadius: "14px",
                  bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? alpha("#fff", 0.06) : "#e2e8f0",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                    borderWidth: "2px",
                  },
                },
              }}
            />

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
                  <InputAdornment position="start">
                    <Typography
                      sx={{
                        color: isDark ? "#6366f1" : "#4f46e5",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                      }}
                    >
                      TND
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? alpha("#fff", 0.06) : "#e2e8f0",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                    borderWidth: "2px",
                  },
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
                    <CalendarToday
                      sx={{
                        color: isDark ? "#6366f1" : "#4f46e5",
                        fontSize: 22,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? alpha("#fff", 0.06) : "#e2e8f0",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                    borderWidth: "2px",
                  },
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
                    <CategoryIcon
                      sx={{
                        color: isDark ? "#6366f1" : "#4f46e5",
                        fontSize: 22,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? alpha("#fff", 0.06) : "#e2e8f0",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                    borderWidth: "2px",
                  },
                },
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography fontSize="1.25rem">
                      {categoryIcons[cat]}
                    </Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: categoryColors[cat],
                      }}
                    />
                    <Typography fontWeight="600">{cat}</Typography>
                  </Box>
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
                  borderRadius: "14px",
                  bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? alpha("#fff", 0.06) : "#e2e8f0",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                    borderWidth: "2px",
                  },
                },
              }}
            >
              {availableAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Box>
                    <Typography fontWeight="700">{account.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Balance: {account.currentBalance.toFixed(2)} TND
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* File Upload */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="700"
                mb={2}
                sx={{
                  color: isDark ? "#94a3b8" : "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                Attach Document (Optional)
              </Typography>
              {selectedFile ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "14px",
                    bgcolor: isDark
                      ? alpha("#10b981", 0.08)
                      : alpha("#10b981", 0.08),
                    border: `2px solid ${alpha("#10b981", isDark ? 0.2 : 0.3)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "12px",
                        bgcolor: alpha("#10b981", isDark ? 0.15 : 0.2),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CloudUpload sx={{ color: "#10b981", fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body1"
                        fontWeight="700"
                        sx={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                      >
                        {selectedFile.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? "#64748b" : "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{
                      bgcolor: alpha("#ef4444", 0.1),
                      color: "#ef4444",
                      borderRadius: "10px",
                      "&:hover": { bgcolor: alpha("#ef4444", 0.2) },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<AttachFile />}
                  sx={{
                    py: 2.5,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    color: isDark ? "#64748b" : "#94a3b8",
                    borderColor: isDark ? alpha("#fff", 0.08) : "#e2e8f0",
                    "&:hover": {
                      borderWidth: 2,
                      borderColor: isDark ? "#6366f1" : "#4f46e5",
                      bgcolor: alpha(isDark ? "#6366f1" : "#4f46e5", 0.05),
                    },
                  }}
                >
                  Choose File (PDF, JPG, PNG - Max 5MB)
                  <input
                    type="file"
                    hidden
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                  />
                </Button>
              )}
            </Box>
          </Stack>
        </DialogContent>

        {/* Dialog Footer */}
        <Box
          sx={{
            p: 4,
            pt: 2,
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{
              py: 2,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              borderColor: isDark ? alpha("#fff", 0.08) : "#e2e8f0",
              borderWidth: "2px",
              color: isDark ? "#94a3b8" : "#64748b",
              "&:hover": {
                borderWidth: "2px",
                borderColor: isDark ? alpha("#fff", 0.15) : "#cbd5e1",
                bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc",
              },
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
              py: 2,
              borderRadius: "14px",
              background: isDark
                ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: isDark
                ? "0 4px 16px rgba(79, 70, 229, 0.25)"
                : "0 8px 24px rgba(99, 102, 241, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: isDark
                  ? "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)"
                  : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: isDark
                  ? "0 6px 20px rgba(79, 70, 229, 0.35)"
                  : "0 12px 32px rgba(99, 102, 241, 0.5)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: isDark ? alpha("#fff", 0.04) : "#e2e8f0",
                color: isDark ? "#475569" : "#94a3b8",
                boxShadow: "none",
              },
            }}
          >
            {editingTransaction ? "Update Transaction" : "Create Transaction"}
          </Button>
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
          sx={{
            borderRadius: "14px",
            fontWeight: 700,
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(0,0,0,0.2)",
            ...(snackbar.severity === "success" && {
              bgcolor: "#10b981",
              color: "#fff",
              "& .MuiAlert-icon": { color: "#fff" },
            }),
            ...(snackbar.severity === "error" && {
              bgcolor: "#ef4444",
              color: "#fff",
              "& .MuiAlert-icon": { color: "#fff" },
            }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsPage;
