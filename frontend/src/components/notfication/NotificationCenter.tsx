// src/components/NotificationCenter.tsx
import { useState, useEffect } from 'react';

import { 
  IconButton, 
  Badge, 
  Popover, 
  List, 
  ListItem, 
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { toast } from 'react-hot-toast';
import budgetService from '../../api/budgetService';
import { AlertTriangle, Bell } from 'lucide-react';
import { X } from '@mui/icons-material';

interface Notification {
  id: number;
  type: 'warning' | 'exceeded' | 'success';
  message: string;
  budgetName: string;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check budgets periodically
  useEffect(() => {
    const checkBudgets = async () => {
      try {
        const budgets = await budgetService.getBudgets(true);
        
        budgets.forEach(budget => {
          // Check if budget just crossed alert threshold
          if (budget.status === 'WARNING' && budget.percentageUsed >= budget.alertThreshold) {
            addNotification({
              type: 'warning',
              message: `You've reached ${budget.percentageUsed.toFixed(1)}% of your ${budget.category} budget`,
              budgetName: budget.category,
            });
          }
          
          // Check if budget exceeded
          if (budget.status === 'EXCEEDED') {
            addNotification({
              type: 'exceeded',
              message: `Your ${budget.category} budget has been exceeded by ${(budget.spent - budget.amount).toFixed(2)} TND`,
              budgetName: budget.category,
            });
          }
        });
      } catch (error) {
        console.error('Error checking budgets:', error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkBudgets, 5 * 60 * 1000);
    checkBudgets(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.error(notif.message, {
      duration: 5000,
      icon: <AlertTriangle />,
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Mark all as read
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <Bell />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <X />
            </IconButton>
          </Box>
          <Divider />
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  sx={{
                    bgcolor: notif.read ? 'transparent' : 'action.hover',
                    borderLeft: `4px solid ${
                      notif.type === 'exceeded' ? 'error.main' : 
                      notif.type === 'warning' ? 'warning.main' : 
                      'success.main'
                    }`,
                  }}
                >
                  <ListItemText
                    primary={notif.message}
                    secondary={notif.timestamp.toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;