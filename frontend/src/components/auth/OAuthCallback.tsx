// src/components/auth/OAuthCallback.tsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useAuth } from "../../context/use-auth";
import API from "../../api/axiosConfig";
import type { UserDto } from "../../types/auth";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        email_not_provided: "Email not provided by OAuth provider",
        account_exists_with_password:
          "An account with this email already exists. Please sign in with your password.",
        email_send_failed: "Failed to send verification email",
        oauth_failed: "OAuth authentication failed",
      };

      const errorMessage = errorMessages[errorParam] || "Authentication failed";
      navigate("/signIn", { state: { error: errorMessage } });
      return;
    }

    if (!token) {
      navigate("/signIn");
      return;
    }

    const fetchUserData = async () => {
      try {
        // Store token first so the API interceptor can use it
        localStorage.setItem("accessToken", token);

        // Fetch user profile using the token
        const response = await API.get<{ user: UserDto }>("/api/user/profile");

        if (response.data?.user) {
          login(response.data.user, token, null);
          navigate("/dashboard");
        } else {
          throw new Error("No user data returned");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);

        // Clear the token on error
        localStorage.removeItem("accessToken");

        setError("Failed to complete authentication");

        setTimeout(() => {
          navigate("/signIn", {
            state: {
              error: "Failed to complete authentication. Please try again.",
            },
          });
        }, 2000);
      }
    };

    fetchUserData();
  }, [searchParams, navigate, login]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Completing authentication...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuthCallback;
