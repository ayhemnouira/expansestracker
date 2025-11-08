import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { SignUpFormData } from "./schema";

import { Box } from "@mui/material";
import SignUpForm from "../authform/SignUpForm";
import { registerUser } from "../../../api/authApi";

const SignUpPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ Use object destructuring with rest operator - confirmPassword is automatically excluded
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(60px)",
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translate(0, 0)" },
            "50%": { transform: "translate(-50px, 50px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          filter: "blur(60px)",
          animation: "float 15s ease-in-out infinite reverse",
        }}
      />

      <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} error={error} />
    </Box>
  );
};

export default SignUpPage;
