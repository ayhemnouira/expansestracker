import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Fade } from "@mui/material";
import type { SignUpFormData } from "./schema";
import SignUpForm from "../authform/SignUpForm";
import { registerUser, loginUser } from "../../../api/authApi";
import { useAuth } from "../../../context/use-auth";
import backgroundImg from "../../../assets/background.jpg";

const SignUpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
const { confirmPassword, ...registerData } = data;

      await registerUser(registerData);

      // Auto-login after signup
      const loginResponse = await loginUser({
        email: data.email,
        password: data.password,
      });
      
      login(loginResponse.user, loginResponse.accessToken, loginResponse.refreshToken);
      navigate("/dashboard");
      
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