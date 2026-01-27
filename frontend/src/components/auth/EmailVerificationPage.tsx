import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import backgroundImg from "../../assets/background.jpg";
import { verifyEmail } from "../../api/authApi";

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please check your email for the correct link.",
      );
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(response.message);

        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          navigate("/signIn");
        }, 3000);
      } catch (err) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Verification failed. The link may be expired or invalid.",
        );
      }
    };

    verify();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
                mb: 4,
                boxShadow: "0 10px 30px rgba(253, 183, 81, 0.3)",
                position: "relative",
              }}
            >
              <CircularProgress
                size={90}
                thickness={2}
                sx={{
                  color: "#FDB751",
                  position: "absolute",
                }}
              />
              <TrendingUp size={40} color="white" />
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
              Verifying Your Email
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#6B7280",
                fontSize: "0.95rem",
              }}
            >
              Please wait while we verify your account...
            </Typography>
          </>
        );

      case "success":
        return (
          <>
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
              Email Verified!
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
              {message || "Your email has been successfully verified."}
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
          </>
        );

      case "error":
        return (
          <>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                mb: 3,
                boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
              }}
            >
              <XCircle size={48} color="white" />
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
              Verification Failed
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
              {message}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate("/signUp")}
                sx={{
                  py: 1.75,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  textTransform: "none",
                  borderColor: "#F59E0B",
                  color: "#F59E0B",
                  borderWidth: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    borderColor: "#D97706",
                    backgroundColor: "rgba(253, 183, 81, 0.08)",
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Try Again
              </Button>

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
                  background:
                    "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
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
                Go to Sign In
              </Button>
            </Box>
          </>
        );
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
        {renderContent()}
      </Paper>
    </Box>
  );
};

export default EmailVerificationPage;
