import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import backgroundImg from "../../assets/background.jpg";
import { resetPassword } from "../../api/authApi";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate("/signIn");
      }, 3000);
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to reset password. The link may be expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          backgroundRepeat: "no-repeat",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 0,
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 500,
            width: "100%",
            mx: 2,
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            background: "#FFFFFF",
            border: "1px solid",
            borderColor: "rgba(0, 0, 0, 0.06)",
            position: "relative",
            zIndex: 1,
            boxShadow:
              "0 25px 70px rgba(0, 0, 0, 0.12), 0 10px 30px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              mb: 3,
              boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
            }}
          >
            <CheckCircle2 size={48} color="white" />
          </Box>

          <Typography
            variant="h4"
            fontWeight="700"
            sx={{
              color: "#1a1a1a",
              mb: 1.5,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Password Reset Successful!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#6B7280",
              mb: 3,
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            Your password has been successfully reset. You can now sign in with
            your new password.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#9CA3AF",
              mb: 4,
              fontSize: "0.875rem",
            }}
          >
            Redirecting to sign in page...
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => navigate("/signIn")}
            sx={{
              py: 1.75,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: "1.05rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
              boxShadow: "0 10px 25px rgba(253, 183, 81, 0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                boxShadow: "0 14px 35px rgba(253, 183, 81, 0.5)",
                transform: "translateY(-3px)",
              },
              "&:active": {
                transform: "translateY(-1px)",
              },
            }}
          >
            Go to Sign In Now
          </Button>
        </Paper>
      </Box>
    );
  }

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
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 500,
          width: "100%",
          mx: 2,
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          background: "#FFFFFF",
          border: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.06)",
          position: "relative",
          zIndex: 1,
          boxShadow:
            "0 25px 70px rgba(0, 0, 0, 0.12), 0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 3,
              background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
              mb: 2.5,
              boxShadow: "0 10px 30px rgba(253, 183, 81, 0.3)",
            }}
          >
            <TrendingUp size={40} color="white" />
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            color: "#1a1a1a",
            mb: 1.5,
            fontSize: { xs: "1.75rem", sm: "2rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Reset Your Password
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#6B7280",
            mb: 4,
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          Enter your new password below. Make sure it's at least 8 characters
          long and secure.
        </Typography>

        {error && !token && (
          <Alert
            severity="error"
            icon={<XCircle size={24} />}
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/forgot-password")}
                sx={{ fontWeight: 600 }}
              >
                Request New Link
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{ mb: 1, color: "#374151", fontSize: "0.875rem" }}
            >
              New Password
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} style={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{
                        color: "#9CA3AF",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08,
                          ),
                        },
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  transition: "all 0.2s ease",
                  "& fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  py: 1.5,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{ mb: 1, color: "#374151", fontSize: "0.875rem" }}
            >
              Confirm New Password
            </Typography>
            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} style={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      size="small"
                      sx={{
                        color: "#9CA3AF",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08,
                          ),
                        },
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  transition: "all 0.2s ease",
                  "& fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  py: 1.5,
                },
              }}
            />
          </Box>

          {error && token && (
            <Alert
              severity="error"
              icon={<XCircle size={24} />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading || !token}
            sx={{
              py: 1.75,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: "1.05rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
              boxShadow: "0 10px 25px rgba(253, 183, 81, 0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transition: "left 0.5s",
              },
              "&:hover": {
                boxShadow: "0 14px 35px rgba(253, 183, 81, 0.5)",
                transform: "translateY(-3px)",
                "&::before": {
                  left: "100%",
                },
              },
              "&:active": {
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "#E5E7EB",
                color: "#9CA3AF",
                boxShadow: "none",
              },
            }}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: alpha("#FDB751", 0.08),
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha("#FDB751", 0.2),
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#374151",
              fontSize: "0.875rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            Password Requirements:
          </Typography>
          <Typography
            variant="body2"
            component="ul"
            sx={{
              color: "#6B7280",
              fontSize: "0.875rem",
              lineHeight: 1.8,
              pl: 2.5,
              m: 0,
            }}
          >
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters (recommended)</li>
            <li>Includes numbers and special characters (recommended)</li>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
