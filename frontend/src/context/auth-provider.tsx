// src/context/auth-provider.tsx

import { useState, useEffect, type ReactNode } from "react";
import type { UserDto } from "../types/auth";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = (
    user: UserDto,
    accessToken: string,
    refreshToken: string | null
  ) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Only store refresh token if it exists
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      // Remove refresh token from storage if it's null (OAuth flow)
      localStorage.removeItem("refreshToken");
    }
    
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};