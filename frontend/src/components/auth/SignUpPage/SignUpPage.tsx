import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SignUpFormData } from "./schema";
import { Box } from "@mui/material";
import SignUpForm from "../authform/SignUpForm";
import { registerUser } from "../../../api/authApi";
import { useAuth } from "../../../context/use-auth";
import backgroundImg from "../../../assets/background.jpg";

const SignUpPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;

      const response = await registerUser(registerData);

      console.log("User registered:", response);
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
      <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} error={error} />
    </Box>
  );
};

export default SignUpPage;
