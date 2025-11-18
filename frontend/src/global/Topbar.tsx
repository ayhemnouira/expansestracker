import { useState, useContext, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  useTheme,
  alpha,
  Chip,
  Button,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Brightness4,
  Brightness7,
  Logout,
  Person,
  Warning as WarningIcon,
  Error as ErrorIcon,
  DoneAll as DoneAllIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import type { BudgetAlert } from "../types/budget";
import alertService from "../api/alertService";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);

  // Budget alerts state
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Fetch alerts on mount and poll every 30 seconds
  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchAlerts();
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const alertsData = await alertService.getUnreadAlerts();
      setAlerts(alertsData);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await alertService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch alert count", err);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/signin");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate("/settings");
  };

  const markAsRead = async (alertId: number) => {
    try {
      await alertService.markAsRead(alertId);
      fetchAlerts();
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark alert as read", err);
    }
  };

  const markAllAsRead = async () => {
    setIsLoadingAlerts(true);
    try {
      await alertService.markAllAsRead();
      fetchAlerts();
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const getAlertIcon = (type: string) => {
    if (type === "BUDGET_EXCEEDED") {
      return (
        <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
      );
    }
    return (
      <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
    );
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
    return `${diffInDays}d ago`;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left Side - Menu Button & Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          {/* Hamburger Menu for Mobile */}
          {isMobile && (
            <IconButton
              onClick={onMenuClick}
              edge="start"
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.05)
                  : alpha(theme.palette.common.black, 0.03),
              borderRadius: 2,
              px: 2,
              py: 0.5,
              width: { xs: "100%", sm: 400 },
              maxWidth: { xs: "100%", sm: 400 },
              transition: "all 0.3s ease",
              "&:focus-within": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.common.black, 0.05),
                boxShadow: `0 0 0 2px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
              },
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            <InputBase
              placeholder="Search transactions, budgets..."
              sx={{ flex: 1, fontSize: 14 }}
              inputProps={{ "aria-label": "search" }}
            />
          </Box>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Theme Toggle */}
          <IconButton
            onClick={colorMode.toggleColorMode}
            sx={{
              color: theme.palette.text.primary,
              display: { xs: "none", sm: "flex" },
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            aria-label="toggle theme"
          >
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Budget Alerts Notification */}
          <IconButton
            onClick={handleNotificationsOpen}
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            aria-label="budget notifications"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          {/* Settings 
          <IconButton
            onClick={handleSettings}
            sx={{
              color: theme.palette.text.primary,
              display: { xs: "none", md: "flex" },
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton> */}

          {/* User Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              p: 0,
              ml: 1,
              border: `2px solid ${theme.palette.divider}`,
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            }}
            aria-label="user menu"
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body1" fontWeight={600}>
            {user?.username || "Guest"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || "guest@example.com"}
          </Typography>
        </Box>
        <Divider />

        <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
          <Person sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
          <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: theme.palette.error.main,
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Budget Alerts Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 380,
            maxWidth: "100%",
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {/* Alerts Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Budget Alerts
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Divider />

        {/* Alert Items */}
        <Box sx={{ maxHeight: 350, overflow: "auto" }}>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <MenuItem
                key={alert.id}
                onClick={() => markAsRead(alert.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                {/* Alert Icon */}
                <Box sx={{ mt: 0.5 }}>{getAlertIcon(alert.type)}</Box>

                {/* Alert Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      mb: 0.5,
                    }}
                  >
                    {alert.budgetCategory} Budget
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {alert.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                    }}
                  >
                    {formatTimeAgo(alert.triggeredAt)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              <NotificationsIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.text.disabled,
                  mb: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                No new budget alerts
              </Typography>
              <Typography variant="caption" color="text.disabled">
                You'll be notified when budgets reach their limits
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        {alerts.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
              <Button
                onClick={markAllAsRead}
                disabled={isLoadingAlerts}
                startIcon={
                  isLoadingAlerts ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DoneAllIcon />
                  )
                }
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Mark all as read
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Topbar;
