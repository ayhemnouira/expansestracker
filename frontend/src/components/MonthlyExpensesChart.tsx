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

type ExpenseSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
};

interface MonthlyExpensesChartProps {
  title?: string;
  data?: ExpenseSlice[];
}

const defaultData: ExpenseSlice[] = [
  { id: "Food", label: "Food & Dining", value: 450, color: "#EF4444" },
  { id: "Transport", label: "Transport", value: 280, color: "#F59E0B" },
  { id: "Shopping", label: "Shopping", value: 320, color: "#8B5CF6" },
  { id: "Bills", label: "Bills", value: 180, color: "#3B82F6" },
  { id: "Other", label: "Other", value: 120, color: "#10B981" },
];

function MonthlyExpensesChart({
  title = "Monthly Expenses",
  data = defaultData,
}: MonthlyExpensesChartProps) {
  const theme = useTheme();

  const total = data.reduce((sum, item) => sum + item.value, 0);

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
            label="-8.2%"
            size="small"
            sx={{
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.dark,
              fontWeight: 600,
            }}
          />
        </Stack>

        {/* Chart */}
        <Box sx={{ height: 250 }}>
          <ResponsivePie
            data={data}
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
          />
        </Box>

        {/* Legend */}
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2 }}>
          {data.map((slice) => (
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
                {slice.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MonthlyExpensesChart;
