import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "../SignInPage/schema";
import { Link } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  TrendingUp,
} from "@mui/icons-material";
import InputField from "../Common/InputField";
import AlertMessage from "../Common/AlertMessage";
import ReButton from "../Common/ReButton";

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => void;
  isLoading?: boolean;
  error: string | null;
}

const SignInForm = ({
  onSubmit,
  isLoading = false,
  error,
}: SignInFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  return (
    <Paper
      elevation={24}
      sx={{
        maxWidth: 480,
        width: "100%",
        mx: 2,
        p: 5,
        borderRadius: 4,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 1,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Logo & Title */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "20px",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            mb: 2,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        >
          <TrendingUp sx={{ fontSize: 48, color: "white" }} />
        </Box>
        <Typography
          variant="h4"
          fontWeight="800"
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to continue to ExpansesTracker
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <AlertMessage severity="error" message={error} />
        </Box>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <InputField
            label="Email Address"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )}`,
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
              },
            }}
          />

          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )}`,
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
              },
            }}
          />

          <ReButton
            loading={isLoading}
            type="submit"
            label="Sign In"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `0 6px 24px ${alpha(
                  theme.palette.primary.main,
                  0.5
                )}`,
                transform: "translateY(-2px)",
              },
            }}
          />

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                to="/signUp"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default SignInForm;
