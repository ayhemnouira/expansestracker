// src/components/BudgetAlertNotification.tsx
import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Collapse,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import type { BudgetAlert } from "../../types/budget";
import alertService from "../../api/alertService";

const BudgetAlertNotification = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch alerts on mount and every 30 seconds
  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchAlerts(true); // Silent refresh
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const alertsData = await alertService.getUnreadAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
      if (!silent) {
        toast.error("Failed to load alerts");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await alertService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch alert count", error);
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await alertService.markAsRead(alertId);
      await fetchAlerts();
      await fetchUnreadCount();
      toast.success("Alert marked as read");
    } catch (error) {
      console.error("Failed to mark alert as read", error);
      toast.error("Failed to update alert");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await alertService.markAllAsRead();
      await fetchAlerts();
      await fetchUnreadCount();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success("All alerts marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      toast.error("Failed to update alerts");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAlerts();
      await fetchUnreadCount();
      toast.success("Alerts refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAlertIcon = (type: string) => {
    if (type === "BUDGET_EXCEEDED") {
      return (
        <ErrorIcon
          sx={{
            color: theme.palette.error.main,
            fontSize: 24,
          }}
        />
      );
    }
    return (
      <WarningIcon
        sx={{
          color: theme.palette.warning.main,
          fontSize: 24,
        }}
      />
    );
  };

  const getAlertColor = (type: string) => {
    return type === "BUDGET_EXCEEDED"
      ? theme.palette.error.main
      : theme.palette.warning.main;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* Notification Bell Button */}
      <IconButton
        onClick={handleOpen}
        sx={{
          color: theme.palette.text.primary,
          position: "relative",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
        aria-label="budget notifications"
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 700,
              fontSize: "0.75rem",
              minWidth: "20px",
              height: "20px",
              animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.1)" },
                "100%": { transform: "scale(1)" },
              },
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Alerts Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 420,
            maxWidth: "95vw",
            maxHeight: 600,
            borderRadius: 3,
            boxShadow: theme.shadows[12],
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Budget Alerts
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="error"
                sx={{
                  height: 24,
                  minWidth: 24,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{ color: theme.palette.primary.main }}
            >
              <RefreshIcon
                fontSize="small"
                sx={{
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Success Message */}
        <Collapse in={showSuccess}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mx: 2, mt: 2, borderRadius: 2 }}
          >
            All alerts marked as read!
          </Alert>
        </Collapse>

        {/* Alert List */}
        <Box
          sx={{
            maxHeight: 400,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: alpha(theme.palette.text.primary, 0.2),
              borderRadius: 4,
            },
          }}
        >
          {isLoading && !isRefreshing ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          ) : alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <MenuItem
                key={alert.id}
                onClick={() => handleMarkAsRead(alert.id)}
                sx={{
                  py: 2,
                  px: 3,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  borderBottom:
                    index < alerts.length - 1
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                  bgcolor: alpha(getAlertColor(alert.type), 0.03),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(getAlertColor(alert.type), 0.08),
                    transform: "translateX(4px)",
                  },
                }}
              >
                {/* Alert Icon */}
                <Box
                  sx={{
                    mt: 0.5,
                    p: 1,
                    borderRadius: "50%",
                    bgcolor: alpha(getAlertColor(alert.type), 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getAlertIcon(alert.type)}
                </Box>

                {/* Alert Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ color: theme.palette.text.primary }}
                    >
                      {alert.budgetCategory}
                    </Typography>
                    <Chip
                      label={
                        alert.type === "BUDGET_EXCEEDED"
                          ? "EXCEEDED"
                          : "WARNING"
                      }
                      size="small"
                      color={
                        alert.type === "BUDGET_EXCEEDED" ? "error" : "warning"
                      }
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 0.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {alert.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    🕒 {formatTimeAgo(alert.triggeredAt)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <Box
              sx={{
                py: 8,
                px: 3,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: "0 auto",
                  mb: 2,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.success.main,
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                All Clear! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have no budget alerts at the moment
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        {alerts.length > 0 && (
          <>
            <Divider />
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={16} /> : <DoneAllIcon />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                }}
                variant="contained"
                color="primary"
              >
                Mark All as Read
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default BudgetAlertNotification;
