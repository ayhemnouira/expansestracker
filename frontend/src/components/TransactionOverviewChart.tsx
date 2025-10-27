import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  alpha,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { TrendingUp, TrendingDown, AccountBalance } from "@mui/icons-material";
import type { Transaction } from "../types";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

interface TransactionOverviewChartProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionOverviewChart: React.FC<TransactionOverviewChartProps> = ({
  transactions,
  title = "Transaction Overview",
}) => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState<string>("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange as keyof typeof DATE_RANGES];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    // Group transactions by date
    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      // Handle both positive and negative amounts
      if (transaction.amount > 0) {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += Math.abs(transaction.amount);
      }
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions, dateRange]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const netAmount = totals.income - totals.expense;

  const handleDateRangeChange = (event: SelectChangeEvent<string>) => {
    setDateRange(event.target.value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="caption"
              sx={{
                display: "block",
                color: entry.color,
                fontWeight: 500,
              }}
            >
              {entry.name}: {entry.value.toFixed(2)} TND
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <AccountBalance sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          </Stack>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="date-range-label">Period</InputLabel>
            <Select
              labelId="date-range-label"
              value={dateRange}
              label="Period"
              onChange={handleDateRangeChange}
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.divider,
                },
              }}
            >
              {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Summary Cards */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          {/* Income */}
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.success.main, 0.15),
                }}
              >
                <TrendingUp
                  sx={{
                    fontSize: 18,
                    color: theme.palette.success.main,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Total Income
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {totals.income.toFixed(2)} TND
            </Typography>
          </Box>

          {/* Expenses */}
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.error.main, 0.15),
                }}
              >
                <TrendingDown
                  sx={{
                    fontSize: 18,
                    color: theme.palette.error.main,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Total Expenses
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {totals.expense.toFixed(2)} TND
            </Typography>
          </Box>

          {/* Net */}
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(
                netAmount >= 0
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                0.08
              ),
              border: `1px solid ${alpha(
                netAmount >= 0
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                0.2
              )}`,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(
                    netAmount >= 0
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    0.15
                  ),
                }}
              >
                <AccountBalance
                  sx={{
                    fontSize: 18,
                    color:
                      netAmount >= 0
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Net Balance
              </Typography>
            </Stack>
            <Typography
              variant="h5"
              fontWeight={700}
              color={netAmount >= 0 ? "success.main" : "error.main"}
            >
              {netAmount >= 0 ? "+" : ""}
              {netAmount.toFixed(2)} TND
            </Typography>
          </Box>
        </Stack>

        {/* Chart */}
        <Box sx={{ height: 380, mt: 2 }}>
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "14px",
                  }}
                  iconType="circle"
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill={theme.palette.success.main}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill={theme.palette.error.main}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.text.secondary,
              }}
            >
              <Typography variant="body1">
                No transaction data available for this period
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionOverviewChart;
