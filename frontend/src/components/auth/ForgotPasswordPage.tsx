import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  alpha,
  useTheme,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Mail, ArrowLeft, Send, CheckCircle2, TrendingUp } from "lucide-react";
import backgroundImg from "../../assets/background.jpg";
import { forgotPassword } from "../../api/authApi";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setEmailSent(true);
    } catch (err) {
      // For security, always show success message even if email doesn't exist
      console.error("Password reset error:", err);
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
            Check Your Email
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#6B7280",
              mb: 3,
              fontSize: "0.95rem",
            }}
          >
            If an account exists for
          </Typography>

          <Alert
            icon={<Mail size={24} />}
            severity="info"
            sx={{
              mb: 4,
              fontWeight: 600,
              backgroundColor: alpha("#FDB751", 0.1),
              color: "#1a1a1a",
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: "#F59E0B",
              },
            }}
          >
            {email}
          </Alert>

          <Typography
            variant="body2"
            sx={{
              color: "#6B7280",
              mb: 4,
              lineHeight: 1.7,
              fontSize: "0.9rem",
            }}
          >
            You will receive a password reset link shortly. The link will expire
            in 1 hour. If you don't see the email, check your spam folder.
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
            Back to Sign In
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
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/signIn")}
          sx={{
            mb: 3,
            textTransform: "none",
            color: "#6B7280",
            fontWeight: 600,
            fontSize: "0.9rem",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: "#374151",
            },
          }}
        >
          Back to Sign In
        </Button>

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
          Forgot Password?
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
          No worries! Enter your email address and we'll send you a link to
          reset your password.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
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
              Email Address
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} style={{ color: "#9CA3AF" }} />
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading}
            endIcon={!isLoading && <Send size={20} />}
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
            {isLoading ? "Sending..." : "Send Reset Link"}
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
              color: "#6B7280",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#374151" }}>Note:</strong> For security
            reasons, we'll send a reset link if the email is registered. The
            link expires in 1 hour.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
