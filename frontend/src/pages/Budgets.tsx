import { useState, useEffect } from "react";
import {
  Box,
  Container,
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
} from "@mui/material";

import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  AccountBalance,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import type { BudgetSummary as BudgetSummaryType } from "../types/budget";
import type { Budget } from "../types/budget";
import budgetService from "../api/budgetService";

import BudgetForm from "../components/budget/BudgetForm";
import { getCategoryInfo } from "../utils/categories";

const Budgets = () => {
  const theme = useTheme();
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
      const message = error instanceof Error ? error.message : "Failed to load budgets";
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
      const message = error instanceof Error ? error.message : "Failed to delete budget";
      toast.error(message);
      console.error(error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const filteredBudgets = budgets.filter((budget) =>
    budget.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SAFE":
        return theme.palette.success.main;
      case "WARNING":
        return theme.palette.warning.main;
      case "EXCEEDED":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SAFE":
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case "WARNING":
        return <Warning sx={{ fontSize: 20 }} />;
      case "EXCEEDED":
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 4 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Budget Management
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                onClick={loadData}
                disabled={isLoadingData}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <RefreshIcon className={isLoadingData ? "animate-spin" : ""} />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                }}
              >
                New Budget
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Track your spending and stay within your budget limits
          </Typography>
        </Box>

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Budgets
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {summary.totalBudgets}
                      </Typography>
                    </Box>
                    <AccountBalance
                      sx={{
                        fontSize: 40,
                        color: theme.palette.primary.main,
                        opacity: 0.8,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        On Track
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="success.main"
                      >
                        {summary.safeBudgets}
                      </Typography>
                    </Box>
                    <CheckCircle
                      sx={{
                        fontSize: 40,
                        color: theme.palette.success.main,
                        opacity: 0.8,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Warning
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="warning.main"
                      >
                        {summary.warningBudgets}
                      </Typography>
                    </Box>
                    <Warning
                      sx={{
                        fontSize: 40,
                        color: theme.palette.warning.main,
                        opacity: 0.8,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Exceeded
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="error.main"
                      >
                        {summary.exceededBudgets}
                      </Typography>
                    </Box>
                    <ErrorIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.error.main,
                        opacity: 0.8,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Overall Progress Card */}
            <Grid size={{ xs: 12 }}>
              <Card
                sx={(theme) => ({
                  background:
                    theme.palette.mode === "dark"
                      ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: "white", // force high contrast
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 4px 20px rgba(0,0,0,0.6)"
                      : "0 4px 20px rgba(0,0,0,0.1)",
                  borderRadius: 3,
                  p: 1,
                })}
              >
                <CardContent>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, color: "#f0f0f0" }}
                      >
                        Overall Budget Usage
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{ color: "#fff" }}
                      >
                        {summary.overallPercentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                    <TrendingUp
                      sx={{ fontSize: 48, opacity: 0.9, color: "#fff" }}
                    />
                  </Box>

                  {/* Progress Bar */}
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(summary.overallPercentage, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "rgba(255,255,255,0.3)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#fff",
                      },
                    }}
                  />

                  {/* Footer Info */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.9, color: "#f0f0f0" }}
                      >
                        Total Spent
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: "#fff" }}
                      >
                        {summary.totalSpent?.toFixed(2)} TND
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.9, color: "#f0f0f0" }}
                      >
                        Total Budget
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: "#fff" }}
                      >
                        {summary.totalBudgeted?.toFixed(2)} TND
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search budgets by category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Budget Cards */}
        {isLoadingData ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredBudgets.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <AccountBalance
                sx={{
                  fontSize: 64,
                  color: theme.palette.text.disabled,
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? "No budgets found" : "No budgets yet"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first budget to start tracking"}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsFormOpen(true)}
                >
                  Create Your First Budget
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredBudgets.map((budget) => {
              const categoryInfo = getCategoryInfo(budget.category);
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={budget.id}>
                  <Card
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    {/* Card Header */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(getStatusColor(budget.status), 0.1),
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", gap: 2, alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              fontSize: 32,
                              width: 48,
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: alpha(
                                getStatusColor(budget.status),
                                0.2
                              ),
                              borderRadius: 2,
                            }}
                          >
                            {categoryInfo.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {categoryInfo.label}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                              <Chip
                                label={budget.period}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`${budget.daysRemaining} days left`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </Box>
                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(budget)}
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(budget.id)}
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <CardContent>
                      {/* Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {budget.spent.toFixed(2)} TND /{" "}
                            {budget.amount.toFixed(2)} TND
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {getStatusIcon(budget.status)}
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ color: getStatusColor(budget.status) }}
                            >
                              {budget.percentageUsed.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(budget.percentageUsed, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(getStatusColor(budget.status), 0.1),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: getStatusColor(budget.status),
                            },
                          }}
                        />
                      </Box>

                      {/* Remaining Amount */}
                      <Card
                        variant="outlined"
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                          mb: 2,
                        }}
                      >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Remaining
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <TrendingUp
                                sx={{
                                  fontSize: 16,
                                  color:
                                    budget.remaining >= 0
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                  color:
                                    budget.remaining >= 0
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                }}
                              >
                                {Math.abs(budget.remaining).toFixed(2)} TND
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Alert Messages */}
                      {budget.status === "WARNING" && (
                        <Alert
                          severity="warning"
                          icon={<Warning fontSize="small" />}
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="caption">
                            You've reached {budget.alertThreshold}% of your
                            budget
                          </Typography>
                        </Alert>
                      )}

                      {budget.status === "EXCEEDED" && (
                        <Alert
                          severity="error"
                          icon={<ErrorIcon fontSize="small" />}
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="caption">
                            Budget exceeded by{" "}
                            {(budget.spent - budget.amount).toFixed(2)} TND
                          </Typography>
                        </Alert>
                      )}

                      {/* Period Dates */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          pt: 2,
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {new Date(budget.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          →
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(budget.endDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Budget Form Modal */}
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
              toast.success("Budget updated successfully! ✅");
            } else {
              await budgetService.createBudget(data);
              toast.success("Budget created successfully! 🎉");
            }
            setIsFormOpen(false);
            setEditingBudget(null);
            loadData();
          } catch (error) {
            const errorMessage =
              error instanceof Error && 'response' in error && 
              typeof error.response === 'object' && 
              error.response !== null &&
              'data' in error.response &&
              typeof error.response.data === 'object' &&
              error.response.data !== null &&
              'message' in error.response.data
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