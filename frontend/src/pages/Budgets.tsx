import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Grid,
  Stack,
  Fade,
  Grow,
  Divider,
} from "@mui/material";

import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  AccountBalance,
  CalendarToday,
  Savings,
  Receipt,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import type { BudgetSummary as BudgetSummaryType } from "../types/budget";
import type { Budget } from "../types/budget";
import budgetService from "../api/budgetService";

import BudgetForm from "../components/budget/BudgetForm";
import { getCategoryInfo } from "../utils/categories";

const Budgets = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummaryType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [budgetsData, summaryData] = await Promise.all([
        budgetService.getBudgets(true),
        budgetService.getBudgetSummary(),
      ]);
      setBudgets(budgetsData);
      setSummary(summaryData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load budgets";
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }
    try {
      await budgetService.deleteBudget(id);
      toast.success("Budget deleted successfully");
      loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete budget";
      toast.error(message);
      console.error(error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const filteredBudgets = budgets.filter((budget) =>
    budget.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SAFE":
        return "#10b981";
      case "WARNING":
        return "#f59e0b";
      case "EXCEEDED":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SAFE":
        return <CheckCircle sx={{ fontSize: 18 }} />;
      case "WARNING":
        return <Warning sx={{ fontSize: 18 }} />;
      case "EXCEEDED":
        return <ErrorIcon sx={{ fontSize: 18 }} />;
      default:
        return null;
    }
  };

  if (isLoadingData) {
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
        <Box sx={{ position: "relative" }}>
          <CircularProgress
            size={70}
            thickness={3}
            sx={{ color: isDark ? "#6366f1" : "#4f46e5" }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <AccountBalance
              sx={{
                fontSize: 28,
                color: isDark ? "#6366f1" : "#4f46e5",
                opacity: 0.5,
              }}
            />
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
          Loading budgets...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3, pl: 0 }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box mb={{ xs: 3, md: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
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
                Budget Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              >
                Track spending and stay within limits
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <IconButton
                onClick={loadData}
                disabled={isLoadingData}
                sx={{
                  bgcolor: isDark ? alpha("#fff", 0.04) : alpha("#6366f1", 0.1),
                  borderRadius: "12px",
                  width: 44,
                  height: 44,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: isDark
                      ? alpha("#fff", 0.08)
                      : alpha("#6366f1", 0.15),
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <RefreshIcon
                  sx={{ color: isDark ? "#6366f1" : "#4f46e5", fontSize: 20 }}
                />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
                fullWidth={false}
                sx={{
                  flex: { xs: 1, sm: "unset" },
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", md: "0.95rem" },
                  px: { xs: 2.5, md: 3 },
                  py: 1.25,
                  background: isDark
                    ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: isDark
                    ? "0 4px 14px rgba(79, 70, 229, 0.25)"
                    : "0 4px 14px rgba(99, 102, 241, 0.4)",
                  "&:hover": {
                    background: isDark
                      ? "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)"
                      : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: isDark
                      ? "0 6px 20px rgba(79, 70, 229, 0.35)"
                      : "0 6px 20px rgba(99, 102, 241, 0.5)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                New Budget
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Fade>

      {/* Summary Cards */}
      {summary && (
        <Box mb={{ xs: 3, md: 4 }}>
          {/* Stats Row */}
          <Grid
            container
            spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
            mb={{ xs: 1.5, sm: 2, md: 2.5 }}
          >
            <Grid size={{ xs: 6, sm: 3 }}>
              <Grow in timeout={800}>
                <Card
                  sx={{
                    background: isDark
                      ? "linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)"
                      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: { xs: "14px", md: "16px" },
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(55, 48, 163, 0.2)"
                      : "0 4px 20px rgba(99, 102, 241, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(55, 48, 163, 0.3)"
                        : "0 8px 30px rgba(99, 102, 241, 0.35)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: isDark
                        ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  <Stack spacing={{ xs: 0.5, md: 1 }} position="relative">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                        lineHeight: 1,
                      }}
                    >
                      {summary.totalBudgets}
                    </Typography>
                  </Stack>
                </Card>
              </Grow>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Grow in timeout={1000}>
                <Card
                  sx={{
                    background: isDark
                      ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: { xs: "14px", md: "16px" },
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(5, 95, 70, 0.2)"
                      : "0 4px 20px rgba(16, 185, 129, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(5, 95, 70, 0.3)"
                        : "0 8px 30px rgba(16, 185, 129, 0.35)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: isDark
                        ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  <Stack spacing={{ xs: 0.5, md: 1 }} position="relative">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Safe
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                        lineHeight: 1,
                      }}
                    >
                      {summary.safeBudgets}
                    </Typography>
                  </Stack>
                </Card>
              </Grow>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Grow in timeout={1200}>
                <Card
                  sx={{
                    background: isDark
                      ? "linear-gradient(135deg, #b45309 0%, #d97706 100%)"
                      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    borderRadius: { xs: "14px", md: "16px" },
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(180, 83, 9, 0.2)"
                      : "0 4px 20px rgba(245, 158, 11, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(180, 83, 9, 0.3)"
                        : "0 8px 30px rgba(245, 158, 11, 0.35)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: isDark
                        ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  <Stack spacing={{ xs: 0.5, md: 1 }} position="relative">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Warning
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                        lineHeight: 1,
                      }}
                    >
                      {summary.warningBudgets}
                    </Typography>
                  </Stack>
                </Card>
              </Grow>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Grow in timeout={1400}>
                <Card
                  sx={{
                    background: isDark
                      ? "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)"
                      : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    borderRadius: { xs: "14px", md: "16px" },
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(153, 27, 27, 0.2)"
                      : "0 4px 20px rgba(239, 68, 68, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(153, 27, 27, 0.3)"
                        : "0 8px 30px rgba(239, 68, 68, 0.35)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: isDark
                        ? "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  <Stack spacing={{ xs: 0.5, md: 1 }} position="relative">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Over
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                        lineHeight: 1,
                      }}
                    >
                      {summary.exceededBudgets}
                    </Typography>
                  </Stack>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Main Progress Card */}
          <Grow in timeout={1600}>
            <Card
              sx={{
                background: isDark
                  ? "linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)"
                  : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                borderRadius: { xs: "16px", md: "20px" },
                p: { xs: 2.5, sm: 3, md: 4 },
                position: "relative",
                overflow: "hidden",
                boxShadow: isDark
                  ? "0 8px 24px rgba(55, 48, 163, 0.25)"
                  : "0 8px 32px rgba(79, 70, 229, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark
                    ? "0 12px 32px rgba(55, 48, 163, 0.35)"
                    : "0 12px 40px rgba(79, 70, 229, 0.4)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: { xs: 250, md: 350 },
                  height: { xs: 250, md: 350 },
                  background: isDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                  borderRadius: "50%",
                },
              }}
            >
              <Box position="relative">
                {/* Header */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={{ xs: 2, sm: 0 }}
                  mb={3}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: "0.85rem", md: "0.95rem" },
                      }}
                    >
                      Overall Budget Usage
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      {summary.overallPercentage?.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: { xs: 56, md: 72 },
                      height: { xs: 56, md: 72 },
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrendingUp
                      sx={{ fontSize: { xs: 32, md: 40 }, color: "white" }}
                    />
                  </Box>
                </Stack>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={Math.min(summary.overallPercentage, 100)}
                  sx={{
                    height: { xs: 8, md: 10 },
                    borderRadius: "8px",
                    bgcolor: "rgba(255,255,255,0.15)",
                    mb: { xs: 2.5, md: 3 },
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#fff",
                      borderRadius: "8px",
                    },
                  }}
                />

                {/* Stats Grid */}
                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      sx={{
                        background: "rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        p: { xs: 1.5, md: 2 },
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                      >
                        <Savings
                          sx={{
                            fontSize: 18,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: { xs: "0.65rem", md: "0.7rem" },
                            letterSpacing: "0.5px",
                          }}
                        >
                          Spent
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: { xs: "1.15rem", md: "1.35rem" },
                        }}
                      >
                        {summary.totalSpent?.toFixed(2)}{" "}
                        <Typography
                          component="span"
                          sx={{ fontSize: "0.7em", opacity: 0.8 }}
                        >
                          TND
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      sx={{
                        background: "rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        p: { xs: 1.5, md: 2 },
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                      >
                        <Receipt
                          sx={{
                            fontSize: 18,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: { xs: "0.65rem", md: "0.7rem" },
                            letterSpacing: "0.5px",
                          }}
                        >
                          Budget
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: { xs: "1.15rem", md: "1.35rem" },
                        }}
                      >
                        {summary.totalBudgeted?.toFixed(2)}{" "}
                        <Typography
                          component="span"
                          sx={{ fontSize: "0.7em", opacity: 0.8 }}
                        >
                          TND
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      sx={{
                        background: "rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        p: { xs: 1.5, md: 2 },
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                      >
                        {(summary.totalBudgeted || 0) -
                          (summary.totalSpent || 0) >=
                        0 ? (
                          <TrendingUp
                            sx={{
                              fontSize: 18,
                              color: "rgba(255,255,255,0.9)",
                            }}
                          />
                        ) : (
                          <TrendingDown
                            sx={{
                              fontSize: 18,
                              color: "rgba(255,255,255,0.9)",
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: { xs: "0.65rem", md: "0.7rem" },
                            letterSpacing: "0.5px",
                          }}
                        >
                          Left
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: { xs: "1.15rem", md: "1.35rem" },
                        }}
                      >
                        {(
                          (summary.totalBudgeted || 0) -
                          (summary.totalSpent || 0)
                        ).toFixed(2)}{" "}
                        <Typography
                          component="span"
                          sx={{ fontSize: "0.7em", opacity: 0.8 }}
                        >
                          TND
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grow>
        </Box>
      )}

      {/* Search */}
      <Fade in timeout={1800}>
        <Card
          sx={{
            borderRadius: { xs: "14px", md: "16px" },
            mb: { xs: 2.5, md: 3 },
            boxShadow: isDark
              ? "0 2px 12px rgba(0,0,0,0.2)"
              : "0 2px 12px rgba(0,0,0,0.06)",
            bgcolor: isDark ? alpha("#1e293b", 0.4) : "#fff",
            border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <TextField
              fullWidth
              placeholder="Search budgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
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
                  borderRadius: "12px",
                  bgcolor: isDark ? alpha("#0f172a", 0.3) : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark
                      ? alpha("#fff", 0.06)
                      : alpha("#6366f1", 0.15),
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#6366f1" : "#4f46e5",
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </Fade>

      {/* Budget Cards */}
      <Fade in timeout={2000}>
        <Box>
          {filteredBudgets.length === 0 ? (
            <Card
              sx={{
                borderRadius: { xs: "16px", md: "20px" },
                border: `2px dashed ${isDark ? "#334155" : "#cbd5e1"}`,
                bgcolor: isDark
                  ? "rgba(17, 24, 39, 0.3)"
                  : "rgba(255, 255, 255, 0.5)",
                p: { xs: 4, sm: 6, md: 8 },
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: { xs: 70, md: 90 },
                  height: { xs: 70, md: 90 },
                  borderRadius: { xs: "16px", md: "20px" },
                  background: isDark
                    ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2.5,
                  boxShadow: isDark
                    ? "0 8px 24px rgba(79, 70, 229, 0.2)"
                    : "0 8px 24px rgba(99, 102, 241, 0.25)",
                }}
              >
                <AccountBalance
                  sx={{ fontSize: { xs: 36, md: 44 }, color: "white" }}
                />
              </Box>
              <Typography
                variant="h5"
                fontWeight="800"
                sx={{
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  mb: 1,
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                {searchQuery ? "No budgets found" : "No budgets yet"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mb: 3,
                  maxWidth: 400,
                  mx: "auto",
                  fontSize: { xs: "0.9rem", md: "0.95rem" },
                }}
              >
                {searchQuery
                  ? "Try adjusting your search"
                  : "Create your first budget to start tracking"}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsFormOpen(true)}
                  sx={{
                    background: isDark
                      ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: "12px",
                    px: 3,
                    py: 1.25,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: isDark
                      ? "0 4px 14px rgba(79, 70, 229, 0.25)"
                      : "0 4px 14px rgba(99, 102, 241, 0.3)",
                    "&:hover": {
                      background: isDark
                        ? "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)"
                        : "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: isDark
                        ? "0 6px 20px rgba(79, 70, 229, 0.35)"
                        : "0 6px 20px rgba(99, 102, 241, 0.4)",
                    },
                  }}
                >
                  Create First Budget
                </Button>
              )}
            </Card>
          ) : (
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              {filteredBudgets.map((budget, index) => {
                const categoryInfo = getCategoryInfo(budget.category);
                const statusColor = getStatusColor(budget.status);

                return (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={budget.id}>
                    <Grow in timeout={2000 + index * 80}>
                      <Card
                        sx={{
                          borderRadius: { xs: "14px", md: "16px" },
                          boxShadow: isDark
                            ? "0 2px 12px rgba(0,0,0,0.2)"
                            : "0 2px 12px rgba(0,0,0,0.06)",
                          bgcolor: isDark ? alpha("#1e293b", 0.4) : "#fff",
                          border: `1px solid ${isDark ? alpha("#fff", 0.05) : alpha("#000", 0.05)}`,
                          transition: "all 0.3s ease",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isDark
                              ? "0 8px 24px rgba(0,0,0,0.3)"
                              : "0 8px 28px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        {/* Header */}
                        <Box
                          sx={{
                            p: { xs: 2, md: 2.5 },
                            background: `linear-gradient(135deg, ${alpha(statusColor, isDark ? 0.1 : 0.12)} 0%, ${alpha(statusColor, isDark ? 0.03 : 0.04)} 100%)`,
                            borderBottom: `2px solid ${alpha(statusColor, isDark ? 0.12 : 0.15)}`,
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1.5}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              flex={1}
                              minWidth={0}
                            >
                              <Box
                                sx={{
                                  width: { xs: 42, md: 48 },
                                  height: { xs: 42, md: 48 },
                                  borderRadius: "12px",
                                  bgcolor: alpha(
                                    statusColor,
                                    isDark ? 0.12 : 0.15,
                                  ),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: { xs: "1.35rem", md: "1.5rem" },
                                  flexShrink: 0,
                                }}
                              >
                                {categoryInfo.icon}
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography
                                  variant="h6"
                                  fontWeight="800"
                                  sx={{
                                    color: isDark ? "#e2e8f0" : "#0f172a",
                                    mb: 0.5,
                                    fontSize: { xs: "0.95rem", md: "1rem" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {categoryInfo.label}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.75}
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    label={budget.period}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(
                                        statusColor,
                                        isDark ? 0.1 : 0.12,
                                      ),
                                      color: statusColor,
                                      fontWeight: 700,
                                      fontSize: "0.65rem",
                                      height: "20px",
                                      borderRadius: "6px",
                                    }}
                                  />
                                  <Chip
                                    icon={
                                      <CalendarToday sx={{ fontSize: 11 }} />
                                    }
                                    label={`${budget.daysRemaining}d`}
                                    size="small"
                                    sx={{
                                      bgcolor: isDark
                                        ? alpha("#fff", 0.04)
                                        : alpha("#000", 0.04),
                                      fontWeight: 700,
                                      fontSize: "0.65rem",
                                      height: "20px",
                                      borderRadius: "6px",
                                    }}
                                  />
                                </Stack>
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={0.5} flexShrink={0}>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(budget)}
                                sx={{
                                  bgcolor: alpha(
                                    isDark ? "#4f46e5" : "#6366f1",
                                    0.1,
                                  ),
                                  color: isDark ? "#6366f1" : "#4f46e5",
                                  borderRadius: "8px",
                                  width: { xs: 30, md: 34 },
                                  height: { xs: 30, md: 34 },
                                  "&:hover": {
                                    bgcolor: alpha(
                                      isDark ? "#4f46e5" : "#6366f1",
                                      0.15,
                                    ),
                                  },
                                }}
                              >
                                <EditIcon
                                  sx={{ fontSize: { xs: 15, md: 17 } }}
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(budget.id)}
                                sx={{
                                  bgcolor: alpha(
                                    isDark ? "#b91c1c" : "#ef4444",
                                    0.1,
                                  ),
                                  color: isDark ? "#ef4444" : "#dc2626",
                                  borderRadius: "8px",
                                  width: { xs: 30, md: 34 },
                                  height: { xs: 30, md: 34 },
                                  "&:hover": {
                                    bgcolor: alpha(
                                      isDark ? "#b91c1c" : "#ef4444",
                                      0.15,
                                    ),
                                  },
                                }}
                              >
                                <DeleteIcon
                                  sx={{ fontSize: { xs: 15, md: 17 } }}
                                />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Box>

                        {/* Content */}
                        <CardContent
                          sx={{ p: { xs: 2, md: 2.5 }, flexGrow: 1 }}
                        >
                          {/* Progress */}
                          <Box mb={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography
                                variant="body2"
                                fontWeight="600"
                                sx={{
                                  color: "#64748b",
                                  fontSize: { xs: "0.8rem", md: "0.85rem" },
                                }}
                              >
                                {budget.spent.toFixed(2)} /{" "}
                                {budget.amount.toFixed(2)} TND
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                {getStatusIcon(budget.status)}
                                <Typography
                                  variant="h6"
                                  fontWeight="800"
                                  sx={{
                                    color: statusColor,
                                    fontSize: { xs: "0.95rem", md: "1rem" },
                                  }}
                                >
                                  {budget.percentageUsed.toFixed(1)}%
                                </Typography>
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(budget.percentageUsed, 100)}
                              sx={{
                                height: { xs: 7, md: 8 },
                                borderRadius: "6px",
                                bgcolor: alpha(
                                  statusColor,
                                  isDark ? 0.1 : 0.12,
                                ),
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: statusColor,
                                  borderRadius: "6px",
                                },
                              }}
                            />
                          </Box>

                          {/* Remaining */}
                          <Card
                            sx={{
                              bgcolor: alpha(
                                budget.remaining >= 0 ? "#10b981" : "#ef4444",
                                isDark ? 0.06 : 0.06,
                              ),
                              border: `1px solid ${alpha(budget.remaining >= 0 ? "#10b981" : "#ef4444", isDark ? 0.15 : 0.2)}`,
                              borderRadius: "12px",
                              p: { xs: 1.5, md: 1.75 },
                              mb: 1.5,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                fontWeight="700"
                                sx={{
                                  color:
                                    budget.remaining >= 0
                                      ? "#10b981"
                                      : "#ef4444",
                                  textTransform: "uppercase",
                                  fontSize: "0.65rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Remaining
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                {budget.remaining >= 0 ? (
                                  <TrendingUp
                                    sx={{ fontSize: 16, color: "#10b981" }}
                                  />
                                ) : (
                                  <TrendingDown
                                    sx={{ fontSize: 16, color: "#ef4444" }}
                                  />
                                )}
                                <Typography
                                  variant="h6"
                                  fontWeight="800"
                                  sx={{
                                    color:
                                      budget.remaining >= 0
                                        ? "#10b981"
                                        : "#ef4444",
                                    fontSize: { xs: "0.95rem", md: "1rem" },
                                  }}
                                >
                                  {Math.abs(budget.remaining).toFixed(2)} TND
                                </Typography>
                              </Stack>
                            </Stack>
                          </Card>

                          {/* Alerts */}
                          {budget.status === "WARNING" && (
                            <Alert
                              severity="warning"
                              icon={<Warning sx={{ fontSize: 18 }} />}
                              sx={{
                                mb: 1.5,
                                py: 0.75,
                                borderRadius: "10px",
                                fontSize: { xs: "0.75rem", md: "0.8rem" },
                                fontWeight: 600,
                              }}
                            >
                              {budget.alertThreshold}% threshold reached
                            </Alert>
                          )}

                          {budget.status === "EXCEEDED" && (
                            <Alert
                              severity="error"
                              icon={<ErrorIcon sx={{ fontSize: 18 }} />}
                              sx={{
                                mb: 1.5,
                                py: 0.75,
                                borderRadius: "10px",
                                fontSize: { xs: "0.75rem", md: "0.8rem" },
                                fontWeight: 600,
                              }}
                            >
                              Over by{" "}
                              {(budget.spent - budget.amount).toFixed(2)} TND
                            </Alert>
                          )}

                          {/* Period */}
                          <Divider sx={{ my: 1.5 }} />
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              fontWeight="600"
                              sx={{
                                color: "#64748b",
                                fontSize: { xs: "0.7rem", md: "0.75rem" },
                              }}
                            >
                              {new Date(budget.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              →
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="600"
                              sx={{
                                color: "#64748b",
                                fontSize: { xs: "0.7rem", md: "0.75rem" },
                              }}
                            >
                              {new Date(budget.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Fade>

      {/* Form */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBudget(null);
        }}
        editingBudget={editingBudget}
        isLoading={isLoading}
        onSubmit={async (data) => {
          setIsLoading(true);
          try {
            if (editingBudget) {
              await budgetService.updateBudget(editingBudget.id, data);
              toast.success("Budget updated! ✅");
            } else {
              await budgetService.createBudget(data);
              toast.success("Budget created! 🎉");
            }
            setIsFormOpen(false);
            setEditingBudget(null);
            loadData();
          } catch (error) {
            const errorMessage =
              error instanceof Error &&
              "response" in error &&
              typeof error.response === "object" &&
              error.response !== null &&
              "data" in error.response &&
              typeof error.response.data === "object" &&
              error.response.data !== null &&
              "message" in error.response.data
                ? String(error.response.data.message)
                : "Failed to save budget";
            toast.error(errorMessage);
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </Box>
  );
};

export default Budgets;
