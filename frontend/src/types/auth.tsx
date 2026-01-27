// src/types/auth.ts

export interface RegisterRequestDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface MessageResponseDto {
  message: string;
}

export interface UserDto {
  id: number;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  avatarUrl?: string | null;
  authProviders?: string[];
  googleId?: string | null;
  githubId?: string | null;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string | null; // Changed to nullable for OAuth flows
}

export interface AuthContextType {
  user: UserDto | null;
  login: (
    user: UserDto,
    accessToken: string,
    refreshToken: string | null,
  ) => void; // Changed to nullable
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Add 2FA types
export interface Verify2FARequestDto {
  id: string;
  otp: string;
}

export interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
  email: string;
}

export interface OAuthProvidersResponse {
  providers: string[];
  hasLocalAuth: boolean;
  hasOAuthAuth: boolean;
  googleLinked: boolean;
  githubLinked: boolean;
}
