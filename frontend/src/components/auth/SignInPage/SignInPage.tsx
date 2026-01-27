import { useState } from "react";
import { useAuth } from "../../../context/use-auth";
import { useNavigate } from "react-router-dom";
import type { SignInFormData } from "./schema";
import { loginUser } from "../../../api/authApi";
import { Box, Fade } from "@mui/material";
import SignInForm from "../authform/SignInForm";
import backgroundImg from "../../../assets/background.jpg";

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await loginUser(data);
      login(response.user, response.accessToken, response.refreshToken);

      // Show success feedback before navigation
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/dashboard");
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message ||
          error.message ||
          "Invalid credentials. Please try again.",
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
          <SignInForm
            onSubmit={handleSignIn}
            isLoading={isLoading}
            error={error}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default SignInPage;
