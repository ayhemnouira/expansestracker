// src/components/auth/Verify2FAPage.tsx

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/use-auth";
import API from "../../api/axiosConfig";
import backgroundImg from "../../assets/background.jpg";
import type { AuthResponse } from "../../types/auth";

const Verify2FAPage = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const otpId = searchParams.get("id");

  useEffect(() => {
    if (!otpId) {
      navigate("/signIn");
    }
  }, [otpId, navigate]);

  const handleVerify = async () => {
    if (!otpId || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await API.post<AuthResponse>("/api/auth/2fa/verify", {
        id: otpId,
        otp: otp,
      });

      const { user, accessToken } = response.data;
      login(user, accessToken, null); // 2FA flow returns no refresh token
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Invalid verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        px: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter the 6-digit code sent to your email
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          inputProps={{
            maxLength: 6,
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              letterSpacing: "0.5rem",
            },
          }}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
          sx={{
            py: 1.5,
            background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : "Verify"}
        </Button>
      </Paper>
    </Box>
  );
};

export default Verify2FAPage;
