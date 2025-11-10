import {
  Avatar,
  Box,
  Typography,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Savings as SavingsIcon,
  Subscriptions as SubscriptionsIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Account } from "../../types";
import BankCard from "../../components/BankCard";

interface RightSidebarProps {
  imageUrl?: string;
  banks?: Account[];
  userName?: string;
  userEmail?: string;
}

// Mock categories data
const mockCategories = [
  {
    id: "savings",
    name: "Savings",
    icon: <SavingsIcon />,
    amount: 2450,
    period: "This month",
    gradient: ["#10B981", "#059669"],
    type: "positive" as const,
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    icon: <SubscriptionsIcon />,
    amount: -285,
    period: "Monthly",
    gradient: ["#3B82F6", "#2563EB"],
    type: "negative" as const,
  },
  {
    id: "food",
    name: "Food & Dining",
    icon: <RestaurantIcon />,
    amount: -156,
    period: "This week",
    gradient: ["#EF4444", "#DC2626"],
    type: "negative" as const,
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: <ShoppingCartIcon />,
    amount: -423,
    period: "This month",
    gradient: ["#8B5CF6", "#7C3AED"],
    type: "negative" as const,
  },
];

const RightSidebar: React.FC<RightSidebarProps> = ({
  imageUrl,
  banks = [],
  userName = "Guest",
  userEmail,
}) => {
  const theme = useTheme();

  const navigate = useNavigate();

  const headerImageUrl =
    imageUrl ||
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=60";

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        height: "108vh",
        overflowY: "auto",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        bgcolor: theme.palette.background.paper,
        p: 2,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.divider,
          borderRadius: "3px",
        },
      }}
    >
      {/* Header Image with Profile Overlay */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 160,
          borderRadius: 2,
          overflow: "hidden",
          backgroundImage: `url("${headerImageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
          },
        }}
      >
        {/* Profile Avatar Positioned at Bottom */}
        <Avatar
          sx={{
            position: "absolute",
            bottom: -30,
            left: "50%",
            transform: "translateX(-50%)",
            width: 70,
            height: 70,
            border: `3px solid ${theme.palette.background.paper}`,
            bgcolor: theme.palette.primary.main,
            fontSize: 28,
            fontWeight: 700,
            boxShadow: theme.shadows[4],
          }}
        >
          {userName?.charAt(0).toUpperCase() || "G"}
        </Avatar>
      </Box>

      {/* Profile Info */}
      <Box sx={{ textAlign: "center", mt: 5, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          {userName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {userEmail}
        </Typography>
      </Box>

      {/* My Banks Section */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : theme.palette.grey[50],
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            My Banks
          </Typography>
          <IconButton
            size="small"
            onClick={() => navigate("/accounts?add=true")}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              width: 32,
              height: 32,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Bank Cards - Stacked Layout */}
        {banks.length > 0 ? (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              width: "100%",
            }}
          >
            {/* First Bank Card (Front) */}
            <Box
              sx={{
                position: "relative",
                zIndex: 10,
                width: "100%",
              }}
            >
              <BankCard
                key={banks[0].id}
                account={banks[0]}
                userName={userName}
                showBalance={false}
              />
            </Box>

            {/* Second Bank Card (Behind, Slightly Offset) */}
            {banks[1] && (
              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 16,
                  zIndex: 0,
                  width: "90%",
                  opacity: 0.7,
                }}
              >
                <BankCard
                  key={banks[1].id}
                  account={banks[1]}
                  userName={userName}
                  showBalance={false}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No banks connected yet
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{
                cursor: "pointer",
                mt: 1,
                display: "block",
                fontWeight: 500,
              }}
              onClick={() => navigate("/accounts?add=true")}
            >
              Add your first bank
            </Typography>
          </Box>
        )}
      </Box>

      {/* Top Categories Section */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Top Categories
        </Typography>

        <Stack spacing={1.5}>
          {mockCategories.map((category) => (
            <Card
              key={category.id}
              sx={{
                background: `linear-gradient(135deg, ${category.gradient[0]} 0%, ${category.gradient[1]} 100%)`,
                color: "white",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "none",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {category.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {category.period}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="h6" fontWeight={700}>
                    {category.amount > 0 ? "+" : ""}
                    {category.amount.toFixed(0)} TND
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default RightSidebar;
