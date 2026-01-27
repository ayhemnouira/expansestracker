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
import { TrendingDown, BarChart } from "@mui/icons-material";
import { useMemo } from "react";
import { getCategoryColor, getCategoryInfo } from "../utils/categories";

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

function MonthlyExpensesChart({
  title = "Monthly Expenses",
  transactions = [],
}: MonthlyExpensesChartProps) {
  const theme = useTheme();

  // Transform transactions into chart data
  const chartData = useMemo(() => {
    // Get current month expenses only
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expensesByCategory: Record<string, number> = {};

    if (transactions && transactions.length > 0) {
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
    }

    // Convert to chart format
    const data = Object.entries(expensesByCategory).map(([category, value]) => {
      const categoryInfo = getCategoryInfo(category);
      return {
        id: category,
        label: categoryInfo.label,
        value: value,
        color: getCategoryColor(category),
      };
    });

    // Sort by value descending
    data.sort((a, b) => b.value - a.value);

    return data; // Return empty array if no data
  }, [transactions]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentage change (mock for now - you can implement real logic)
  const percentageChange = -8.2;
  const hasData = chartData.length > 0;

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
          {hasData && (
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
          )}
        </Stack>

        {/* Chart or Empty State */}
        <Box sx={{ height: 250 }}>
          {hasData ? (
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
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <BarChart
                sx={{
                  fontSize: 64,
                  color: theme.palette.grey[300],
                }}
              />
              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color="text.secondary"
                >
                  No Expenses Yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Start tracking your expenses this month
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Legend */}
        {hasData && (
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
        )}
      </CardContent>
    </Card>
  );
}

export default MonthlyExpensesChart;
