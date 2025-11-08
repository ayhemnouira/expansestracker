import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { DoughnutChartProps } from "../types";
import { useTheme, Box } from "@mui/material";

interface TooltipPayload {
  name: string;
  value: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Professional color palette
  const colors = [
    "#1e3a8a",
    "#0d9488",
    "#f97316",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  // Use actual account data instead of hardcoded values
  const data: ChartDataItem[] = accounts.map((account, index) => ({
    name: account.name,
    value: account.currentBalance,
    color: colors[index % colors.length],
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: isDark
              ? theme.palette.grey[800]
              : theme.palette.common.white,
            color: isDark ? theme.palette.grey[100] : theme.palette.grey[900],
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: "4px 0 0 0", color: payload[0].fill }}>
            {payload[0].value.toLocaleString()} TND
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.7 }}>
            {((payload[0].value / total) * 100).toFixed(1)}%
          </p>
        </Box>
      );
    }
    return null;
  };

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={(entry) => {
              const dataEntry = entry as unknown as ChartDataItem;
              return `${((dataEntry.value / total) * 100).toFixed(0)}%`;
            }}
            labelLine={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              color: isDark ? theme.palette.grey[300] : theme.palette.grey[700],
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DoughnutChart;
