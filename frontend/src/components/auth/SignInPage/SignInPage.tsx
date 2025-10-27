import { use, useState } from "react";
import type { SignInFormData } from "./schema";
import { Box } from "@mui/material";
import SignInForm from "../authform/SignInForm";
import { loginUser } from "../../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      // perform sign in logic here
      const response = await loginUser(data);
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
      <SignInForm onSubmit={handleSignIn} isLoading={isLoading} error={error} />
    </Box>
  );
};

export default SignInPage;
