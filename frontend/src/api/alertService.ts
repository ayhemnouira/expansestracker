import type { ApiResponse, BudgetAlert } from "../types/budget";
import API from "./axiosConfig";


const alertService = {
  // Get unread alerts
  getUnreadAlerts: async (): Promise<BudgetAlert[]> => {
    const response = await API.get<ApiResponse<BudgetAlert[]>>('/api/alerts');
    return response.data.data;
  },

  // Get all alerts
  getAllAlerts: async (limit: number = 10): Promise<BudgetAlert[]> => {
    const response = await API.get<ApiResponse<BudgetAlert[]>>('/api/alerts/all', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await API.get<ApiResponse<number>>('/api/alerts/count');
    return response.data.data;
  },

  // Mark alert as read
  markAsRead: async (alertId: number): Promise<void> => {
    await API.put<ApiResponse<void>>(`/api/alerts/${alertId}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await API.put<ApiResponse<void>>('/api/alerts/read-all');
  }
};

export default alertService;