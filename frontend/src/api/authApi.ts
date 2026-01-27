

import type {
  AuthResponse,
  LoginRequestDto,
  RegisterRequestDto,
  MessageResponseDto,
  UserDto,
} from "../types/auth";
import API from "./axiosConfig";

export const registerUser = async (
  data: RegisterRequestDto
): Promise<MessageResponseDto> => {
  const response = await API.post<MessageResponseDto>("/api/auth/register", data);
  return response.data;
};

export const verifyEmail = async (token: string): Promise<MessageResponseDto> => {
  const response = await API.post<MessageResponseDto>("/api/auth/verify-email", {
    token,
  });
  return response.data;
};

export const loginUser = async (data: LoginRequestDto): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/api/auth/login", data);
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  
  // Only store refresh token if it exists
  if (response.data.refreshToken) {
    localStorage.setItem("refreshToken", response.data.refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }
  
  return response.data;
};

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/api/auth/refresh-token", {
    refreshToken,
  });
  localStorage.setItem("accessToken", response.data.accessToken);
  
  // Only store refresh token if it exists
  if (response.data.refreshToken) {
    localStorage.setItem("refreshToken", response.data.refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }
  
  return response.data;
};

export const forgotPassword = async (email: string): Promise<MessageResponseDto> => {
  const response = await API.post<MessageResponseDto>("/api/auth/forgot-password", {
    email,
  });
  return response.data;
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<MessageResponseDto> => {
  const response = await API.post<MessageResponseDto>("/api/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export const logoutUser = async (): Promise<MessageResponseDto> => {
  const response = await API.post<MessageResponseDto>("/api/auth/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  return response.data;
};

export const validateToken = async (token: string): Promise<MessageResponseDto> => {
  const response = await API.get<MessageResponseDto>("/api/auth/validate-token", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Add a helper function to get current user profile
export const getCurrentUser = async (): Promise<UserDto> => {
  const response = await API.get<{ user: UserDto }>("/api/user/profile");
  return response.data.user;
};