import { useState } from "react";
import { useAuth } from "../../../context/use-auth";
import { useNavigate } from "react-router-dom";
import type { SignInFormData } from "./schema";
import { loginUser } from "../../../api/authApi";
import { Box } from "@mui/material";
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
      navigate("/dashboard");
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred"
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
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SignInForm onSubmit={handleSignIn} isLoading={isLoading} error={error} />
    </Box>
  );
};

export default SignInPage;
