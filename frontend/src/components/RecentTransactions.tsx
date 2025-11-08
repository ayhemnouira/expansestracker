import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { Receipt, TrendingUp, TrendingDown } from "@mui/icons-material";
import type { Transaction } from "../types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  maxDisplay?: number;
}

const RecentTransactions = ({
  transactions,
  maxDisplay = 10,
}: RecentTransactionsProps) => {
  const theme = useTheme();

  // Sort by date (most recent first) and limit display
  const displayTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxDisplay);

  // Format date to be more readable
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Receipt sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={600}>
            Recent Transactions
          </Typography>
          <Chip
            label={displayTransactions.length}
            size="small"
            color="primary"
            sx={{ ml: "auto" }}
          />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {displayTransactions.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="body2">No transactions yet</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} sx={{ maxHeight: 500, overflowY: "auto" }}>
            {displayTransactions.map((transaction) => (
              <Box
                key={transaction.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  border: `1px solid transparent`,
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                    transform: "translateX(4px)",
                    borderColor: theme.palette.divider,
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor:
                        transaction.type === "INCOME"
                          ? theme.palette.success.light + "20"
                          : theme.palette.error.light + "20",
                    }}
                  >
                    {transaction.type === "INCOME" ? (
                      <TrendingUp
                        sx={{
                          color: theme.palette.success.main,
                          fontSize: 20,
                        }}
                      />
                    ) : (
                      <TrendingDown
                        sx={{
                          color: theme.palette.error.main,
                          fontSize: 20,
                        }}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {transaction.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(transaction.date)} • {transaction.category}
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color:
                      transaction.type === "INCOME"
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {transaction.amount.toFixed(2)} TND
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
