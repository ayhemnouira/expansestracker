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
  Card,
  Chip,
  Stack,
  Tooltip,
  Zoom,
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
  TrendingUp,
  TrendingDown,
  AccountBalance,
  VisibilityOff,
  Visibility,
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
  { value: "depository", label: "Depository", icon: "🏦" },
  { value: "credit", label: "Credit Card", icon: "💳" },
  { value: "loan", label: "Loan", icon: "📊" },
  { value: "investment", label: "Investment", icon: "📈" },
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
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
              : "#ffffff",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} thickness={4} />
          <Typography
            variant="body2"
            sx={{ mt: 2, color: colors.grey[500], fontWeight: 500 }}
          >
            Loading your accounts...
          </Typography>
        </Box>
      </Box>
    );
  }

  const enabledAccounts = accounts.filter((account) => account.enabled);
  const disabledAccounts = accounts.filter((account) => !account.enabled);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
            : "#ffffff",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "400px",
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(ellipse at top, ${colors.primary[900]}40 0%, transparent 60%)`
              : "transparent",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          position: "relative",
        }}
      >
        {/* Modern Header */}
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
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)"
                      : "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 0.5,
                  letterSpacing: "-0.02em",
                }}
              >
                Financial Accounts
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? colors.grey[400]
                      : colors.grey[600],
                  fontWeight: 500,
                }}
              >
                Track and manage your financial portfolio
              </Typography>
            </Box>
            <Chip
              icon={<AccountBalance sx={{ fontSize: 20 }} />}
              label={`${accounts.length} Total`}
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(99, 102, 241, 0.1)",
                color:
                  theme.palette.mode === "dark"
                    ? colors.primary[300]
                    : colors.primary[700],
                fontWeight: 600,
                fontSize: "0.9rem",
                px: 1,
                py: 2.5,
                borderRadius: "12px",
                border: `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(99, 102, 241, 0.2)"
                    : "rgba(99, 102, 241, 0.15)"
                }`,
              }}
            />
          </Stack>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{
                mb: 3,
                borderRadius: "16px",
                border: `1px solid ${colors.error[400]}40`,
                backdropFilter: "blur(10px)",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Enhanced Summary Cards */}
          {summary && (
            <Grid container spacing={2.5} mt={1}>
              {/* Total Balance Card - Featured */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                        : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    borderRadius: "20px",
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                    border: "none",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 8px 32px rgba(99, 102, 241, 0.25)"
                        : "0 8px 32px rgba(99, 102, 241, 0.3)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 12px 48px rgba(99, 102, 241, 0.35)"
                          : "0 12px 48px rgba(99, 102, 241, 0.4)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "200px",
                      height: "200px",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                      borderRadius: "50%",
                      transform: "translate(30%, -30%)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      mb={2}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: "rgba(255,255,255,0.2)",
                          backdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 28, color: "white" }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}
                        >
                          Total Balance
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        letterSpacing: "-0.02em",
                        mb: 1,
                      }}
                    >
                      {summary.totalBalance.toFixed(2)} TND
                    </Typography>
                    <Stack direction="row" spacing={3} mt={2}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            fontWeight: 500,
                          }}
                        >
                          Active Accounts
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          {summary.totalAccounts}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Income Card */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(16, 185, 129, 0.08)",
                    borderRadius: "20px",
                    p: 3,
                    border: `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(16, 185, 129, 0.15)"
                    }`,
                    backdropFilter: "blur(10px)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 24px ${colors.success[500]}20`,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    mb={2}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(16, 185, 129, 0.2)"
                            : "rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingUp
                        sx={{ fontSize: 24, color: colors.success[500] }}
                      />
                    </Box>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? colors.grey[400]
                          : colors.grey[600],
                      fontWeight: 600,
                      mb: 1,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Income
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: colors.success[500],
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    +{summary.totalIncome.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.grey[500], fontWeight: 500 }}
                  >
                    TND
                  </Typography>
                </Card>
              </Grid>

              {/* Expenses Card */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(239, 68, 68, 0.08)",
                    borderRadius: "20px",
                    p: 3,
                    border: `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.15)"
                    }`,
                    backdropFilter: "blur(10px)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 24px ${colors.error[500]}20`,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    mb={2}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(239, 68, 68, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingDown
                        sx={{ fontSize: 24, color: colors.error[500] }}
                      />
                    </Box>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? colors.grey[400]
                          : colors.grey[600],
                      fontWeight: 600,
                      mb: 1,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Expenses
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: colors.error[500],
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    -{summary.totalExpenses.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.grey[500], fontWeight: 500 }}
                  >
                    TND
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Accounts Sections */}
        <Box>
          {/* Enabled Accounts */}
          {enabledAccounts.length > 0 && (
            <Box mb={5}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Box
                  sx={{
                    width: 4,
                    height: 28,
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)"
                        : "linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)",
                    borderRadius: "2px",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[100]
                        : colors.grey[900],
                    letterSpacing: "-0.01em",
                  }}
                >
                  Active Accounts
                </Typography>
                <Chip
                  label={enabledAccounts.length}
                  size="small"
                  sx={{
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(99, 102, 241, 0.1)",
                    color: colors.primary[500],
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                />
              </Stack>
              <Grid container spacing={3}>
                {enabledAccounts.map((account, index) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={account.id}>
                    <Zoom
                      in={true}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <BankCard
                          account={account}
                          userName={user?.username || "Guest"}
                          showBalance={true}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            display: "flex",
                            gap: 0.5,
                            zIndex: 20,
                          }}
                        >
                          <Tooltip title="Edit Account" placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(account)}
                              sx={{
                                color: "white",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                backdropFilter: "blur(8px)",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Account" placement="top">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDelete(account.id, account.name)
                              }
                              sx={{
                                color: "white",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                backdropFilter: "blur(8px)",
                                "&:hover": {
                                  backgroundColor: "rgba(239, 68, 68, 0.8)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
                            startIcon={<VisibilityOff />}
                            onClick={() =>
                              handleToggleAccount(account.id, false)
                            }
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[400]
                                  : colors.grey[700],
                              borderColor:
                                theme.palette.mode === "dark"
                                  ? colors.grey[700]
                                  : colors.grey[300],
                              borderRadius: "10px",
                              textTransform: "none",
                              fontWeight: 600,
                              px: 2,
                              "&:hover": {
                                borderColor: colors.grey[500],
                                backgroundColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.05)",
                              },
                            }}
                            variant="outlined"
                          >
                            Disable
                          </Button>
                        </Box>
                      </Box>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Disabled Accounts */}
          {disabledAccounts.length > 0 && (
            <Box mb={5}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Box
                  sx={{
                    width: 4,
                    height: 28,
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)"
                        : "linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)",
                    borderRadius: "2px",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[400]
                        : colors.grey[600],
                    letterSpacing: "-0.01em",
                  }}
                >
                  Disabled Accounts
                </Typography>
                <Chip
                  label={disabledAccounts.length}
                  size="small"
                  sx={{
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(107, 114, 128, 0.15)"
                        : "rgba(107, 114, 128, 0.1)",
                    color: colors.grey[500],
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                />
              </Stack>
              <Grid container spacing={3}>
                {disabledAccounts.map((account) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={account.id}>
                    <Card
                      sx={{
                        background:
                          theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, rgba(55, 65, 81, 0.4) 0%, rgba(31, 41, 55, 0.4) 100%)"
                            : "linear-gradient(135deg, rgba(229, 231, 235, 0.6) 0%, rgba(209, 213, 219, 0.6) 100%)",
                        borderRadius: "20px",
                        p: 3,
                        border: `1px solid ${
                          theme.palette.mode === "dark"
                            ? colors.grey[700]
                            : colors.grey[300]
                        }`,
                        backdropFilter: "blur(10px)",
                        opacity: 0.7,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          opacity: 1,
                          transform: "translateY(-4px)",
                          boxShadow:
                            theme.palette.mode === "dark"
                              ? "0 8px 24px rgba(0,0,0,0.3)"
                              : "0 8px 24px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={3}
                      >
                        <Box>
                          <Chip
                            label="DISABLED"
                            size="small"
                            sx={{
                              background: colors.grey[700],
                              color: colors.grey[300],
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              height: "20px",
                              mb: 1,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[300]
                                  : colors.grey[700],
                              fontWeight: 700,
                            }}
                          >
                            {account.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[500]
                                  : colors.grey[600],
                              fontWeight: 500,
                            }}
                          >
                            {account.type.charAt(0).toUpperCase() +
                              account.type.slice(1)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(account)}
                              sx={{
                                color:
                                  theme.palette.mode === "dark"
                                    ? colors.grey[400]
                                    : colors.grey[600],
                                backgroundColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.1)"
                                    : "rgba(0,0,0,0.05)",
                                "&:hover": {
                                  backgroundColor:
                                    theme.palette.mode === "dark"
                                      ? "rgba(255,255,255,0.15)"
                                      : "rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDelete(account.id, account.name)
                              }
                              sx={{
                                color:
                                  theme.palette.mode === "dark"
                                    ? colors.grey[400]
                                    : colors.grey[600],
                                backgroundColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.1)"
                                    : "rgba(0,0,0,0.05)",
                                "&:hover": {
                                  backgroundColor: colors.error[500],
                                  color: "white",
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <Box mb={2}>
                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? colors.grey[500]
                                : colors.grey[600],
                            fontWeight: 600,
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Balance
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? colors.grey[300]
                                : colors.grey[700],
                            fontWeight: 700,
                            mt: 0.5,
                          }}
                        >
                          {account.currentBalance.toFixed(2)} TND
                        </Typography>
                      </Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        {account.mask && (
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[500]
                                  : colors.grey[600],
                              fontWeight: 600,
                              fontFamily: "monospace",
                            }}
                          >
                            •••• {account.mask}
                          </Typography>
                        )}
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleToggleAccount(account.id, true)}
                          sx={{
                            color: colors.primary[500],
                            borderColor: colors.primary[500],
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2,
                            "&:hover": {
                              borderColor: colors.primary[600],
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "rgba(99, 102, 241, 0.1)"
                                  : "rgba(99, 102, 241, 0.05)",
                            },
                          }}
                          variant="outlined"
                        >
                          Enable
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Enhanced Empty State */}
          {accounts.length === 0 && (
            <Card
              sx={{
                borderRadius: "24px",
                border: `2px dashed ${
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[300]
                }`,
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(17, 24, 39, 0.4)"
                    : "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                p: 6,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "24px",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  boxShadow: "0 12px 40px rgba(99, 102, 241, 0.3)",
                }}
              >
                <AccountBalance sx={{ fontSize: 48, color: "white" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color:
                    theme.palette.mode === "dark"
                      ? colors.grey[100]
                      : colors.grey[900],
                  letterSpacing: "-0.01em",
                }}
              >
                No accounts yet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? colors.grey[400]
                      : colors.grey[600],
                  mb: 4,
                  maxWidth: 480,
                  mx: "auto",
                  lineHeight: 1.7,
                }}
              >
                Start managing your finances by creating your first account.
                Track balances, monitor transactions, and take control of your
                money.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  borderRadius: "14px",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(99, 102, 241, 0.45)",
                  },
                }}
              >
                Create Your First Account
              </Button>
            </Card>
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
              bottom: 32,
              right: 32,
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)",
                transform: "scale(1.1) rotate(90deg)",
                boxShadow: "0 12px 40px rgba(99, 102, 241, 0.5)",
              },
            }}
          >
            <Add sx={{ fontSize: 32 }} />
          </Fab>
        )}

        {/* Enhanced Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                  : "#ffffff",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? colors.grey[800]
                  : colors.grey[200]
              }`,
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
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
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ position: "relative" }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoney sx={{ fontSize: 36, color: "white" }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    mb: 0.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {editingAccount ? "Edit Account" : "Create New Account"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {editingAccount
                    ? "Update your account information below"
                    : "Fill in the details to set up a new account"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3.5}>
              {/* Account Type Selection */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color:
                      theme.palette.mode === "dark"
                        ? colors.grey[300]
                        : colors.grey[800],
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Account Type {!editingAccount && "*"}
                </Typography>
                <Grid container spacing={2}>
                  {accountTypes.map((type) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={type.value}>
                      <Card
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
                          p: 2.5,
                          borderRadius: "16px",
                          border: `2px solid ${
                            formData.type === type.value
                              ? colors.primary[500]
                              : theme.palette.mode === "dark"
                                ? colors.grey[800]
                                : colors.grey[200]
                          }`,
                          background:
                            formData.type === type.value
                              ? theme.palette.mode === "dark"
                                ? "rgba(99, 102, 241, 0.15)"
                                : "rgba(99, 102, 241, 0.08)"
                              : theme.palette.mode === "dark"
                                ? colors.grey[900]
                                : colors.grey[50],
                          cursor: editingAccount ? "not-allowed" : "pointer",
                          opacity: editingAccount ? 0.6 : 1,
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: editingAccount
                              ? "none"
                              : "translateY(-4px)",
                            borderColor: editingAccount
                              ? undefined
                              : colors.primary[400],
                            boxShadow: editingAccount
                              ? undefined
                              : `0 8px 24px ${colors.primary[500]}20`,
                          },
                        }}
                      >
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          {type.icon}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color:
                              formData.type === type.value
                                ? colors.primary[500]
                                : theme.palette.mode === "dark"
                                  ? colors.grey[300]
                                  : colors.grey[700],
                            fontSize: "0.8rem",
                          }}
                        >
                          {type.label}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Account Details */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                        borderRadius: "14px",
                        background:
                          theme.palette.mode === "dark"
                            ? colors.grey[900]
                            : colors.grey[50],
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? colors.grey[800]
                              : colors.grey[300],
                          borderWidth: "2px",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary[400],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary[500],
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Official Name"
                    fullWidth
                    value={formData.officialName}
                    onChange={(e) =>
                      setFormData({ ...formData, officialName: e.target.value })
                    }
                    placeholder="Bank Name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: colors.primary[500] }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        background:
                          theme.palette.mode === "dark"
                            ? colors.grey[900]
                            : colors.grey[50],
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? colors.grey[800]
                              : colors.grey[300],
                          borderWidth: "2px",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary[400],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary[500],
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        borderRadius: "14px",
                        background:
                          theme.palette.mode === "dark"
                            ? colors.grey[900]
                            : colors.grey[50],
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? colors.grey[800]
                              : colors.grey[300],
                          borderWidth: "2px",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary[400],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary[500],
                        },
                      },
                    }}
                  >
                    {subtypes[formData.type as keyof typeof subtypes].map(
                      (subtype) => (
                        <MenuItem key={subtype} value={subtype}>
                          {subtype.charAt(0).toUpperCase() + subtype.slice(1)}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Institution ID"
                    fullWidth
                    value={formData.institutionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        institutionId: e.target.value,
                      })
                    }
                    placeholder="bank_001"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Apartment sx={{ color: colors.primary[500] }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        background:
                          theme.palette.mode === "dark"
                            ? colors.grey[900]
                            : colors.grey[50],
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? colors.grey[800]
                              : colors.grey[300],
                          borderWidth: "2px",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary[400],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary[500],
                        },
                      },
                    }}
                  />
                </Grid>

                {!editingAccount && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Initial Balance"
                      type="number"
                      fullWidth
                      required
                      value={
                        formData.initialBalance === 0
                          ? ""
                          : formData.initialBalance
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          initialBalance:
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value),
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
                              sx={{ color: colors.grey[500], fontWeight: 700 }}
                            >
                              TND
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          background:
                            theme.palette.mode === "dark"
                              ? colors.grey[900]
                              : colors.grey[50],
                          "& fieldset": {
                            borderColor:
                              theme.palette.mode === "dark"
                                ? colors.grey[800]
                                : colors.grey[300],
                            borderWidth: "2px",
                          },
                          "&:hover fieldset": {
                            borderColor: colors.primary[400],
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.primary[500],
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: editingAccount ? 12 : 6 }}>
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
                        borderRadius: "14px",
                        background:
                          theme.palette.mode === "dark"
                            ? colors.grey[900]
                            : colors.grey[50],
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? colors.grey[800]
                              : colors.grey[300],
                          borderWidth: "2px",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary[400],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary[500],
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              background:
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.6)"
                  : "rgba(248, 250, 252, 0.8)",
              backdropFilter: "blur(10px)",
              borderTop: `1px solid ${
                theme.palette.mode === "dark"
                  ? colors.grey[800]
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
                borderRadius: "14px",
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                borderColor:
                  theme.palette.mode === "dark"
                    ? colors.grey[700]
                    : colors.grey[300],
                color:
                  theme.palette.mode === "dark"
                    ? colors.grey[300]
                    : colors.grey[700],
                borderWidth: "2px",
                "&:hover": {
                  borderColor: colors.grey[500],
                  borderWidth: "2px",
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
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
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                borderRadius: "14px",
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)",
                  boxShadow: "0 12px 32px rgba(99, 102, 241, 0.45)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: colors.grey[600],
                  color: colors.grey[400],
                  boxShadow: "none",
                },
              }}
            >
              {editingAccount ? "Update Account" : "Create Account"}
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
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AccountsPage;
