import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Add,
  Edit,
  Delete,
  Person,
  Business,
  SubdirectoryArrowRight,
  AttachMoney,
  CreditCard,
  Apartment,
} from "@mui/icons-material";

import {
  getUserAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary,
} from "../api/accountService";
import type { Account, CreateAccountRequest, AccountSummary } from "../types";
import { tokens } from "../theme/theme";
import BankCard from "../components/BankCard";
import { useAuth } from "../context/use-auth";

const accountTypes = [
  { value: "depository", label: "Depository (Checking/Savings)" },
  { value: "credit", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "investment", label: "Investment" },
];

const subtypes = {
  depository: ["checking", "savings"],
  credit: ["credit card"],
  loan: ["mortgage", "auto", "personal"],
  investment: ["brokerage", "retirement"],
};

const AccountsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: "",
    officialName: "",
    type: "depository",
    subtype: "checking",
    initialBalance: 0,
    mask: "",
    institutionId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, summaryData] = await Promise.all([
        getUserAccounts(false),
        getAccountSummary(),
      ]);
      setAccounts(accountsData);
      setSummary(summaryData);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          name: formData.name,
          officialName: formData.officialName,
          subtype: formData.subtype,
          mask: formData.mask,
          enabled: true,
        });
        setSnackbar({
          open: true,
          message: "Account updated successfully!",
          severity: "success",
        });
      } else {
        await createAccount(formData);
        setSnackbar({
          open: true,
          message: "Account created successfully!",
          severity: "success",
        });
      }
      await fetchData();
      handleCloseDialog();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Operation failed");
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Operation failed",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number, accountName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${accountName}"?`)) {
      return;
    }
    try {
      await deleteAccount(id);
      await fetchData();
      setSnackbar({
        open: true,
        message: "Account deleted successfully!",
        severity: "success",
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Delete failed");
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  const handleToggleAccount = async (accountId: number, enabled: boolean) => {
    try {
      const accountToUpdate = accounts.find((acc) => acc.id === accountId);
      if (!accountToUpdate) return;

      await updateAccount(accountId, {
        name: accountToUpdate.name,
        officialName: accountToUpdate.officialName || "",
        subtype: accountToUpdate.subtype || "checking",
        mask: accountToUpdate.mask || "",
        enabled,
      });

      await fetchData();
      setSnackbar({
        open: true,
        message: `Account ${enabled ? "enabled" : "disabled"} successfully!`,
        severity: "info",
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Toggle failed");
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Toggle failed",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        officialName: account.officialName || "",
        type: account.type,
        subtype: account.subtype || "checking",
        initialBalance: account.currentBalance,
        mask: account.mask || "",
        institutionId: account.institutionId || "",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: "",
        officialName: "",
        type: "depository",
        subtype: "checking",
        initialBalance: 0,
        mask: "",
        institutionId: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
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

  const enabledAccounts = accounts.filter((account) => account.enabled);
  const disabledAccounts = accounts.filter((account) => !account.enabled);

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
              Accounts
            </Typography>
            <Typography
              variant="h6"
              color={
                theme.palette.mode === "dark"
                  ? colors.grey[400]
                  : colors.grey[600]
              }
            >
              Manage your bank accounts and monitor your finances
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
              $
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
        {summary && (
          <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                      background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.primary[500]})`,
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
                    Total Balance
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontSize: "2rem",
                    background: `linear-gradient(45deg, ${colors.success[400]}, ${colors.primary[400]})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {summary.totalBalance.toFixed(2)} TND
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                      background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography variant="h6" color="white" fontWeight="bold">
                      ✓
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
                    Active Accounts
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={colors.success[400]}
                  sx={{ fontSize: "2rem" }}
                >
                  {summary.totalAccounts}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  +{summary.totalIncome.toFixed(2)} TND
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  -{summary.totalExpenses.toFixed(2)} TND
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Accounts Sections */}
      <Box>
        {/* Enabled Accounts */}
        {enabledAccounts.length > 0 && (
          <Box mb={5}>
            <Box display="flex" alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 6,
                  height: 24,
                  background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
                  borderRadius: "3px",
                  mr: 2,
                }}
              />
              <Typography
                variant="h5"
                fontWeight="bold"
                color={
                  theme.palette.mode === "dark"
                    ? colors.grey[100]
                    : colors.grey[900]
                }
              >
                Active Accounts ({enabledAccounts.length})
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {enabledAccounts.map((account) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
                  <Box sx={{ position: "relative" }}>
                    <BankCard
                      account={account}
                      userName={user?.username || "Guest"}
                      showBalance={true}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 0.5,
                        zIndex: 20,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(account)}
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(4px)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(account.id, account.name)}
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(4px)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => handleToggleAccount(account.id, false)}
                        sx={{
                          color: colors.grey[700],
                          borderColor: colors.grey[400],
                          "&:hover": {
                            borderColor: colors.grey[600],
                            backgroundColor: colors.grey[100],
                          },
                        }}
                        variant="outlined"
                      >
                        Disable
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Disabled Accounts */}
        {disabledAccounts.length > 0 && (
          <Box mb={5}>
            <Box display="flex" alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 6,
                  height: 24,
                  background: `linear-gradient(135deg, ${colors.grey[500]}, ${colors.grey[600]})`,
                  borderRadius: "3px",
                  mr: 2,
                }}
              />
              <Typography
                variant="h5"
                fontWeight="bold"
                color={
                  theme.palette.mode === "dark"
                    ? colors.grey[400]
                    : colors.grey[600]
                }
              >
                Disabled Accounts ({disabledAccounts.length})
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {disabledAccounts.map((account) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
                  <Box
                    sx={{
                      background:
                        theme.palette.mode === "dark"
                          ? `linear-gradient(135deg, ${colors.grey[800]} 0%, ${colors.grey[700]} 100%)`
                          : `linear-gradient(135deg, ${colors.grey[300]} 0%, ${colors.grey[400]} 100%)`,
                      borderRadius: "20px",
                      p: 3,
                      height: "240px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      opacity: 0.6,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 0.5 }}
                        >
                          {account.type.toUpperCase()} - DISABLED
                        </Typography>
                        <Typography variant="h6" color="white" fontWeight="600">
                          {account.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(account)}
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(account.id, account.name)}
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 1 }}
                      >
                        Balance
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="white"
                        sx={{ fontSize: "2rem" }}
                      >
                        {account.currentBalance.toFixed(2)} TND
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        {account.mask && (
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            •••• {account.mask}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        size="small"
                        onClick={() => handleToggleAccount(account.id, true)}
                        sx={{
                          color: "white",
                          borderColor: "rgba(255, 255, 255, 0.3)",
                          "&:hover": {
                            borderColor: "rgba(255, 255, 255, 0.5)",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                        }}
                        variant="outlined"
                      >
                        Enable
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${colors.grey[800]} 0%, ${colors.grey[700]} 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, ${colors.grey[100]} 100%)`,
              borderRadius: "20px",
              border: `2px dashed ${
                theme.palette.mode === "dark"
                  ? colors.grey[700]
                  : colors.grey[300]
              }`,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.primary[500]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: `0 8px 32px ${colors.success[500]}40`,
              }}
            >
              <Typography variant="h3" color="white" fontWeight="bold">
                $
              </Typography>
            </Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={2}
              textAlign="center"
              color={
                theme.palette.mode === "dark"
                  ? colors.grey[100]
                  : colors.grey[900]
              }
            >
              No accounts found
            </Typography>
            <Typography
              variant="body1"
              color={
                theme.palette.mode === "dark"
                  ? colors.grey[400]
                  : colors.grey[600]
              }
              mb={4}
              textAlign="center"
              maxWidth="400px"
            >
              Create your first account to start managing your finances and
              track your money
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: `linear-gradient(135deg, ${colors.success[600]}, ${colors.success[700]})`,
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: `0 8px 32px ${colors.success[600]}40`,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: `linear-gradient(135deg, ${colors.success[700]}, ${colors.success[800]})`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 40px ${colors.success[600]}60`,
                },
              }}
            >
              Create Your First Account
            </Button>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      {accounts.length > 0 && (
        <Fab
          color="primary"
          aria-label="add account"
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
      )}

      {/* Add/Edit Account Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background:
              theme.palette.mode === "dark" ? colors.grey[900] : "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 24px 64px rgba(0,0,0,0.6)"
                : "0 24px 64px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Header with Gradient Background */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
            p: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoney sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  color="white"
                  sx={{ mb: 0.5 }}
                >
                  {editingAccount ? "Edit Account" : "Add New Account"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {editingAccount
                    ? "Update your account information"
                    : "Fill in the details to create a new account"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Account Type Selection - Card Style */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="600"
                mb={1.5}
                color={
                  theme.palette.mode === "dark"
                    ? colors.grey[300]
                    : colors.grey[700]
                }
              >
                Account Type *
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 2,
                }}
              >
                {accountTypes.map((type) => (
                  <Box
                    key={type.value}
                    onClick={() => {
                      if (!editingAccount) {
                        const newType = type.value as keyof typeof subtypes;
                        setFormData({
                          ...formData,
                          type: newType,
                          subtype: subtypes[newType][0],
                        });
                      }
                    }}
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      border: `2px solid ${
                        formData.type === type.value
                          ? colors.primary[500]
                          : theme.palette.mode === "dark"
                          ? colors.grey[700]
                          : colors.grey[300]
                      }`,
                      background:
                        formData.type === type.value
                          ? theme.palette.mode === "dark"
                            ? `linear-gradient(135deg, ${colors.primary[900]}40, ${colors.primary[800]}40)`
                            : `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`
                          : theme.palette.mode === "dark"
                          ? colors.grey[800]
                          : colors.grey[50],
                      cursor: editingAccount ? "not-allowed" : "pointer",
                      opacity: editingAccount ? 0.5 : 1,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: editingAccount ? "none" : "translateY(-2px)",
                        borderColor: editingAccount
                          ? undefined
                          : colors.primary[400],
                        boxShadow: editingAccount
                          ? undefined
                          : `0 4px 12px ${colors.primary[500]}20`,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      textAlign="center"
                      color={
                        formData.type === type.value
                          ? colors.primary[500]
                          : theme.palette.mode === "dark"
                          ? colors.grey[300]
                          : colors.grey[700]
                      }
                    >
                      {type.label.split(" ")[0]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Two Column Layout for Main Fields */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              <TextField
                label="Account Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Checking Account"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: colors.primary[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background:
                      theme.palette.mode === "dark"
                        ? colors.grey[800]
                        : colors.grey[50],
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark"
                          ? colors.grey[700]
                          : colors.grey[300],
                    },
                  },
                }}
              />

              <TextField
                label="Official Name"
                fullWidth
                value={formData.officialName}
                onChange={(e) =>
                  setFormData({ ...formData, officialName: e.target.value })
                }
                placeholder="Banque Nationale Agricole"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: colors.primary[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background:
                      theme.palette.mode === "dark"
                        ? colors.grey[800]
                        : colors.grey[50],
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark"
                          ? colors.grey[700]
                          : colors.grey[300],
                    },
                  },
                }}
              />
            </Box>

            {/* Subtype and Institution */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              <TextField
                select
                label="Subtype"
                fullWidth
                value={formData.subtype}
                onChange={(e) =>
                  setFormData({ ...formData, subtype: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubdirectoryArrowRight
                        sx={{ color: colors.primary[500] }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background:
                      theme.palette.mode === "dark"
                        ? colors.grey[800]
                        : colors.grey[50],
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark"
                          ? colors.grey[700]
                          : colors.grey[300],
                    },
                  },
                }}
              >
                {subtypes[formData.type as keyof typeof subtypes].map(
                  (subtype) => (
                    <MenuItem key={subtype} value={subtype}>
                      {subtype.charAt(0).toUpperCase() + subtype.slice(1)}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                label="Institution ID"
                fullWidth
                value={formData.institutionId}
                onChange={(e) =>
                  setFormData({ ...formData, institutionId: e.target.value })
                }
                placeholder="bna_001"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Apartment sx={{ color: colors.primary[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background:
                      theme.palette.mode === "dark"
                        ? colors.grey[800]
                        : colors.grey[50],
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark"
                          ? colors.grey[700]
                          : colors.grey[300],
                    },
                  },
                }}
              />
            </Box>

            {/* Balance and Last 4 Digits */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              {!editingAccount && (
                <TextField
                  label="Initial Balance"
                  type="number"
                  fullWidth
                  required
                  value={
                    formData.initialBalance === 0 ? "" : formData.initialBalance
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialBalance:
                        e.target.value === "" ? 0 : parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: colors.primary[500] }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography
                          variant="body2"
                          color={colors.grey[500]}
                          fontWeight="600"
                        >
                          TND
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      background:
                        theme.palette.mode === "dark"
                          ? colors.grey[800]
                          : colors.grey[50],
                      "& fieldset": {
                        borderColor:
                          theme.palette.mode === "dark"
                            ? colors.grey[700]
                            : colors.grey[300],
                      },
                    },
                  }}
                />
              )}

              <TextField
                label="Last 4 Digits"
                fullWidth
                value={formData.mask}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, mask: value });
                }}
                placeholder="1234"
                inputProps={{ maxLength: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCard sx={{ color: colors.primary[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background:
                      theme.palette.mode === "dark"
                        ? colors.grey[800]
                        : colors.grey[50],
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark"
                          ? colors.grey[700]
                          : colors.grey[300],
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 3,
            background:
              theme.palette.mode === "dark"
                ? colors.grey[800]
                : colors.grey[50],
            borderTop: `1px solid ${
              theme.palette.mode === "dark"
                ? colors.grey[700]
                : colors.grey[200]
            }`,
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: "600",
              borderColor:
                theme.palette.mode === "dark"
                  ? colors.grey[600]
                  : colors.grey[400],
              color:
                theme.palette.mode === "dark"
                  ? colors.grey[300]
                  : colors.grey[700],
              "&:hover": {
                borderColor: colors.grey[500],
                background:
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[200],
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.type}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: "600",
              boxShadow: `0 4px 16px ${colors.primary[500]}40`,
              "&:hover": {
                background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
                boxShadow: `0 6px 20px ${colors.primary[500]}50`,
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: colors.grey[500],
                color: colors.grey[300],
                boxShadow: "none",
              },
            }}
          >
            {editingAccount ? "Update Account" : "Create Account"}
          </Button>
        </Box>
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

export default AccountsPage;
