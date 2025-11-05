import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Stack,
  Chip,
} from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { TrendingDown } from "@mui/icons-material";
import { useMemo } from "react";

type ExpenseSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
};

interface Transaction {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  accountId: number;
  accountName: string;
}

interface MonthlyExpensesChartProps {
  title?: string;
  transactions?: Transaction[];
}

// Category colors mapping
const categoryColors: Record<string, string> = {
  Groceries: "#EF4444",
  Dining: "#F59E0B",
  Transport: "#8B5CF6",
  Utilities: "#3B82F6",
  Shopping: "#10B981",
  Healthcare: "#EC4899",
  Entertainment: "#6366F1",
  Housing: "#14B8A6",
  Travel: "#F97316",
  Other: "#6B7280",
};

const defaultData: ExpenseSlice[] = [
  { id: "Food", label: "Food & Dining", value: 450, color: "#EF4444" },
  { id: "Transport", label: "Transport", value: 280, color: "#F59E0B" },
  { id: "Shopping", label: "Shopping", value: 320, color: "#8B5CF6" },
  { id: "Bills", label: "Bills", value: 180, color: "#3B82F6" },
  { id: "Other", label: "Other", value: 120, color: "#10B981" },
];

function MonthlyExpensesChart({
  title = "Monthly Expenses",
  transactions = [],
}: MonthlyExpensesChartProps) {
  const theme = useTheme();

  // Transform transactions into chart data
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return defaultData;
    }

    // Get current month expenses only
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expensesByCategory: Record<string, number> = {};

    transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === "EXPENSE" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .forEach((t) => {
        const category = t.category || "Other";
        expensesByCategory[category] =
          (expensesByCategory[category] || 0) + t.amount;
      });

    // Convert to chart format
    const data = Object.entries(expensesByCategory).map(
      ([category, value]) => ({
        id: category,
        label: category,
        value: value,
        color: categoryColors[category] || categoryColors.Other,
      })
    );

    return data.length > 0 ? data : defaultData;
  }, [transactions]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentage change (mock for now - you can implement real logic)
  const percentageChange = -8.2;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
              {total.toFixed(2)} TND
            </Typography>
          </Stack>
          <Chip
            icon={<TrendingDown />}
            label={`${
              percentageChange > 0 ? "+" : ""
            }${percentageChange.toFixed(1)}%`}
            size="small"
            sx={{
              bgcolor:
                percentageChange < 0
                  ? theme.palette.success.light
                  : theme.palette.error.light,
              color:
                percentageChange < 0
                  ? theme.palette.success.dark
                  : theme.palette.error.dark,
              fontWeight: 600,
            }}
          />
        </Stack>

        {/* Chart */}
        <Box sx={{ height: 250 }}>
          <ResponsivePie
            data={chartData}
            margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
            innerRadius={0.65}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={{ datum: "data.color" }}
            enableArcLinkLabels={false}
            enableArcLabels={false}
            borderWidth={2}
            borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
            theme={{
              tooltip: {
                container: {
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  borderRadius: 8,
                  boxShadow: theme.shadows[3],
                },
              },
            }}
            tooltip={({ datum }) => (
              <Box
                sx={{
                  background: theme.palette.background.paper,
                  padding: "9px 12px",
                  borderRadius: 1,
                  boxShadow: theme.shadows[3],
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {datum.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {datum.value.toFixed(2)} TND (
                  {((datum.value / total) * 100).toFixed(1)}%)
                </Typography>
              </Box>
            )}
          />
        </Box>

        {/* Legend */}
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2 }}>
          {chartData.map((slice) => (
            <Stack
              key={slice.id}
              direction="row"
              alignItems="center"
              spacing={0.5}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: slice.color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {slice.label}: {slice.value.toFixed(0)} TND
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MonthlyExpensesChart;
