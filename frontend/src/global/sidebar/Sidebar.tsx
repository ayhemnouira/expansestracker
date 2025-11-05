import { useState } from "react";
import AddCardIcon from "@mui/icons-material/AddCard";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  HomeOutlined,
  ReceiptLong,
  AccountBalanceWallet,
  UploadFile,
  PersonOutlined,
  Menu as MenuIcon,
  ChevronLeft,
  ExitToApp,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ColorModeContext } from "../../theme/theme";
import { useContext } from "react";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

interface MenuItem {
  title: string;
  to: string;
  icon: React.ReactNode;
  category?: string;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", to: "/dashboard", icon: <HomeOutlined /> },
  {
    title: "Transactions",
    to: "/transactions",
    icon: <ReceiptLong />,
    category: "Data",
  },
  {
    title: "Budgets",
    to: "/budgets",
    icon: <AccountBalanceWallet />,
    category: "Data",
  },
  {
    title: "Documents",
    to: "/documents",
    icon: <UploadFile />,
    category: "Data",
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <PersonOutlined />,
    category: "Pages",
  },
  {
    title: "Accounts",
    to: "/accounts",
    icon: <AddCardIcon />,
    category: "Pages",
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Main";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="white" fontWeight={700}>
                ET
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} color="primary">
              ExpansesTracker
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleToggle} size="small">
          {collapsed ? <MenuIcon /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider />

      {/* User Profile Card */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            mx: 2,
            mt: 2,
            borderRadius: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={600} noWrap>
                {user?.username || "Guest"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email || "guest@example.com"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {Object.entries(groupedItems).map(([category, items]) => (
          <Box key={category}>
            {!collapsed && category !== "Main" && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: "block",
                  color: theme.palette.text.secondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {category}
              </Typography>
            )}
            {items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <ListItemButton
                  key={item.to}
                  onClick={() => handleNavigation(item.to)}
                  selected={isActive}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    justifyContent: collapsed ? "center" : "flex-start",
                    "&.Mui-selected": {
                      bgcolor: theme.palette.primary.main,
                      color: "#fff",
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                      "& .MuiListItemIcon-root": {
                        color: "#fff",
                      },
                    },
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      justifyContent: "center",
                      color: isActive ? "#fff" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.title} />}
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>

      <Divider />

      {/* Bottom Actions */}
      <Box sx={{ p: 1 }}>
        {/* Theme Toggle */}
        <ListItemButton
          onClick={colorMode.toggleColorMode}
          sx={{
            mb: 0.5,
            borderRadius: 2,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <ListItemIcon
            sx={{ minWidth: collapsed ? 0 : 40, justifyContent: "center" }}
          >
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={
                theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"
              }
            />
          )}
        </ListItemButton>

        {/* Logout */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            mb: 1,
            borderRadius: 2,
            justifyContent: collapsed ? "center" : "flex-start",
            color: theme.palette.error.main,
            "&:hover": {
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.dark,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 40,
              justifyContent: "center",
              color: theme.palette.error.main,
            }}
          >
            <ExitToApp />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Logout" />}
        </ListItemButton>

        {/* App Version */}
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: theme.palette.text.secondary,
              py: 1,
            }}
          >
            v1.0.0 • ExpansesTracker
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              boxSizing: "border-box",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
