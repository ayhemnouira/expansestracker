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
import { getCategoryColor, getCategoryInfo } from "../utils/categories";

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

const defaultData: ExpenseSlice[] = [
  {
    id: "food",
    label: getCategoryInfo("Food").label,
    value: 450,
    color: getCategoryColor("Food"),
  },
  {
    id: "groceries",
    label: getCategoryInfo("Groceries").label,
    value: 380,
    color: getCategoryColor("Groceries"),
  },
  {
    id: "dining",
    label: getCategoryInfo("Dining").label,
    value: 250,
    color: getCategoryColor("Dining"),
  },
  {
    id: "transport",
    label: getCategoryInfo("Transport").label,
    value: 280,
    color: getCategoryColor("Transport"),
  },
  {
    id: "shopping",
    label: getCategoryInfo("Shopping").label,
    value: 320,
    color: getCategoryColor("Shopping"),
  },
  {
    id: "entertainment",
    label: getCategoryInfo("Entertainment").label,
    value: 200,
    color: getCategoryColor("Entertainment"),
  },
  {
    id: "health",
    label: getCategoryInfo("Health").label,
    value: 150,
    color: getCategoryColor("Health"),
  },
  {
    id: "education",
    label: getCategoryInfo("Education").label,
    value: 180,
    color: getCategoryColor("Education"),
  },
  {
    id: "bills",
    label: getCategoryInfo("Bills").label,
    value: 180,
    color: getCategoryColor("Bills"),
  },
  {
    id: "utilities",
    label: getCategoryInfo("Utilities").label,
    value: 140,
    color: getCategoryColor("Utilities"),
  },
  {
    id: "housing",
    label: getCategoryInfo("Housing").label,
    value: 500,
    color: getCategoryColor("Housing"),
  },
  {
    id: "other",
    label: getCategoryInfo("Other").label,
    value: 120,
    color: getCategoryColor("Other"),
  },
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
        // ✅ Normalize category to lowercase for consistent grouping
        const category = (t.category || "other").toLowerCase().trim();
        expensesByCategory[category] =
          (expensesByCategory[category] || 0) + t.amount;
      });

    // Convert to chart format
    const data = Object.entries(expensesByCategory).map(([category, value]) => {
      const categoryInfo = getCategoryInfo(category);
      return {
        id: category,
        label: categoryInfo.label,
        value: value,
        color: getCategoryColor(category), // ✅ Use the color function
      };
    });

    // Sort by value descending
    data.sort((a, b) => b.value - a.value);

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
            colors={{ datum: "data.color" }} // ✅ Use colors from data
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
