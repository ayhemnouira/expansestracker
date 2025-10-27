import { useState, useContext } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Brightness4,
  Brightness7,
  Logout,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);

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

  // Mock notifications (replace with real data later)
  const notifications = [
    {
      id: 1,
      title: "Budget Alert",
      message: "You've spent 85% of your monthly budget",
      time: "5 min ago",
    },
    {
      id: 2,
      title: "New Transaction",
      message: "Carrefour - 45.50 TND",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Bill Reminder",
      message: "Internet bill due in 3 days",
      time: "2 hours ago",
    },
  ];

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
            transition: "all 0.3s ease",
            "&:focus-within": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.1)
                  : alpha(theme.palette.common.black, 0.05),
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
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

        {/* Right Side Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Theme Toggle */}
          <IconButton
            onClick={colorMode.toggleColorMode}
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            aria-label="toggle theme"
          >
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationsOpen}
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            aria-label="notifications"
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Settings */}
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
          </IconButton>

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
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body1" fontWeight={600}>
            {user?.username || "Guest"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || "guest@example.com"}
          </Typography>
        </Box>
        <Divider />

        {/* Menu Items */}
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

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 360,
            maxWidth: "100%",
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {/* Notifications Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Divider />

        {/* Notification Items */}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {notification.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="primary" sx={{ mt: 0.5 }}>
                {notification.time}
              </Typography>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        )}

        <Divider />
        <Box sx={{ p: 1 }}>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              justifyContent: "center",
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            View All Notifications
          </MenuItem>
        </Box>
      </Menu>
    </AppBar>
  );
};

export default Topbar;
