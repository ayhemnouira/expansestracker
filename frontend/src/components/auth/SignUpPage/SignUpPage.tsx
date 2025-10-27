import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { SignUpFormData } from "./schema";
import { registerUser } from "../../../api/authApi";
import { Box } from "@mui/material";
import SignUpForm from "../authform/SignUpForm";

const SignUpPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { confirmPassword, ...registerData } = data;

      const response = await registerUser(registerData);

      console.log("User registered:", response);

      login(response.user, response.accessToken, response.refreshToken);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} error={error} />
    </Box>
  );
};
export default SignUpPage;
