import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Alert, Fade } from "@mui/material";
import { Mail, CheckCircle2 } from "lucide-react";
import type { SignUpFormData } from "./schema";
import SignUpForm from "../authform/SignUpForm";
import { registerUser } from "../../../api/authApi";
import backgroundImg from "../../../assets/background.jpg";

const SignUpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;

      const response = await registerUser(registerData);

      // Registration successful - show email verification message
      setUserEmail(data.email);
      setRegistrationSuccess(true);

      console.log("Registration successful:", response.message);
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after registration
  if (registrationSuccess) {
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
        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Fade in timeout={800}>
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: { xs: 3, sm: 4 },
                p: { xs: 4, sm: 5, md: 6 },
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 72, sm: 80 },
                    height: { xs: 72, sm: 80 },
                    borderRadius: "50%",
                    backgroundColor: "success.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={48} color="#2e7d32" />
                </Box>
              </Box>

              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}
              >
                Check Your Email
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                We've sent a verification link to
              </Typography>

              <Alert
                icon={<Mail size={24} />}
                severity="info"
                sx={{
                  mb: 4,
                  fontWeight: "medium",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {userEmail}
              </Alert>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
              >
                Please check your inbox and click the verification link to
                activate your account. The link will expire in 24 hours.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/signIn")}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "12px",
                    border: "2px solid #1976d2",
                    backgroundColor: "white",
                    color: "#1976d2",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  Go to Sign In
                </button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 4,
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                }}
              >
                Didn't receive the email? Check your spam folder or contact
                support.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
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
      <Fade in timeout={800}>
        <Box
          sx={{
            zIndex: 1,
            width: "100%",
            maxWidth: { xs: "100%", sm: "520px", md: "560px" },
          }}
        >
          <SignUpForm
            onSubmit={handleSignUp}
            isLoading={isLoading}
            error={error}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default SignUpPage;
