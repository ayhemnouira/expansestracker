import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Stack,
} from "@mui/material";
import { AccountBalance, TrendingUp } from "@mui/icons-material";
import AnimatedCounter from "./AnimatedCounter";
import DoughnutChart from "./DoughnutChart";
import type { Account } from "../types";

interface TotalBalanceBoxProps {
  accounts: Account[];
  totalBanks: number;
  totalCurrentBalance: number;
}

function TotalBalanceBox({
  accounts = [],
  totalBanks,
  totalCurrentBalance,
}: TotalBalanceBoxProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        background: isDark
          ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.common.white,
        boxShadow: theme.shadows[8],
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.05)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `${theme.palette.success.main}15`,
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <AccountBalance
            sx={{
              fontSize: 28,
              color: theme.palette.success.light,
            }}
          />
          <Typography variant="h5" fontWeight={600}>
            Total Balance
          </Typography>
        </Stack>

        {/* Balance Amount */}
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
          <AnimatedCounter amount={totalCurrentBalance} /> TND
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 3 }}>
          <TrendingUp
            sx={{
              fontSize: 18,
              color: theme.palette.success.light,
            }}
          />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            +12.5% from last month
          </Typography>
        </Stack>

        {/* Chart */}
        {accounts.length > 0 && (
          <Box sx={{ height: 180, mt: 2 }}>
            <DoughnutChart accounts={accounts} />
          </Box>
        )}

        {/* Total Banks */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.common.white}33`,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Total Banks
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {totalBanks}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TotalBalanceBox;
