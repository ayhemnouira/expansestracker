import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
  Divider,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "../SignInPage/schema";
import { Link } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
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
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 480, md: 520 },
        mx: "auto",
        p: { xs: 3, sm: 4, md: 5 },
        borderRadius: { xs: 3, sm: 4 },
        background: "#FFFFFF",
        border: "1px solid",
        borderColor: "rgba(0, 0, 0, 0.06)",
        position: "relative",
        zIndex: 1,
        boxShadow:
          "0 25px 70px rgba(0, 0, 0, 0.12), 0 10px 30px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Logo & Title */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 64, sm: 72 },
            height: { xs: 64, sm: 72 },
            borderRadius: 3,
            background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
            mb: { xs: 2, sm: 2.5 },
            boxShadow: "0 10px 30px rgba(253, 183, 81, 0.3)",
          }}
        >
          <TrendingUp sx={{ fontSize: { xs: 36, sm: 40 }, color: "white" }} />
        </Box>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            color: "#1a1a1a",
            mb: 1,
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Welcome to ExpensesTracker
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
            color: "#6B7280",
            fontWeight: 400,
          }}
        >
          Sign in to continue managing your expenses
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{ mb: 1, color: "#374151", fontSize: "0.875rem" }}
            >
              Email Address
            </Typography>
            <InputField
              label=""
              type="email"
              fullWidth
              placeholder="Enter your email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email
                      sx={{
                        color: "#9CA3AF",
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  transition: "all 0.2s ease",
                  "& fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{ mb: 1, color: "#374151", fontSize: "0.875rem" }}
            >
              Password
            </Typography>
            <InputField
              label=""
              type={showPassword ? "text" : "password"}
              fullWidth
              placeholder="Enter your password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock
                      sx={{
                        color: "#9CA3AF",
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{
                        color: "#9CA3AF",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08,
                          ),
                        },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  transition: "all 0.2s ease",
                  "& fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
          </Box>

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: "right", mt: -1.5 }}>
            <Link
              to="/forgot-password"
              style={{
                color: "#F59E0B",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#D97706";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#F59E0B";
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Forgot your password?
            </Link>
          </Box>

          <ReButton
            loading={isLoading}
            type="submit"
            label="Sign In"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: { xs: 1.5, sm: 1.75 },
              mt: 1,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              textTransform: "none",
              background: "linear-gradient(135deg, #FDB751 0%, #F59E0B 100%)",
              boxShadow: "0 10px 25px rgba(253, 183, 81, 0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transition: "left 0.5s",
              },
              "&:hover": {
                boxShadow: "0 14px 35px rgba(253, 183, 81, 0.5)",
                transform: "translateY(-3px)",
                "&::before": {
                  left: "100%",
                },
              },
              "&:active": {
                transform: "translateY(-1px)",
              },
            }}
          />
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={() => {
              window.location.href =
                /*"https://expense-tracker-api-dbbzh6dsc6fbhzaz.francecentral-01.azurewebsites.net/oauth2/authorization/google";*/ "http://localhost:8080/oauth2/authorization/google";
            }}
            sx={{
              py: { xs: 1.5, sm: 1.75 },
              mt: 2,
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              textTransform: "none",
              borderColor: "#FDB751",
              borderWidth: 2,
              color: "#F59E0B",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#F59E0B",
                borderWidth: 2,
                backgroundColor: alpha("#FDB751", 0.08),
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(253, 183, 81, 0.25)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <Divider sx={{ my: { xs: 0.5, sm: 1 } }}>
            <Typography
              variant="caption"
              sx={{
                color: "#9CA3AF",
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.8rem" },
              }}
            >
              OR
            </Typography>
          </Divider>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6B7280",
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signUp"
                style={{
                  color: "#F59E0B",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#D97706";
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#F59E0B";
                  e.currentTarget.style.textDecoration = "none";
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
