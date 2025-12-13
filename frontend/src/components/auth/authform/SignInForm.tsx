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
      elevation={0}
      sx={{
        maxWidth: 450,
        width: "100%",
        mx: 2,
        p: { xs: 3, sm: 5 },
        borderRadius: 4,
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
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 3,
            background: "#FDB751",
            mb: 2.5,
            boxShadow: "0 10px 30px rgba(253, 183, 81, 0.3)",
          }}
        >
          <TrendingUp sx={{ fontSize: 40, color: "white" }} />
        </Box>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            color: theme.palette.text.primary,
            mb: 0.5,
            fontSize: { xs: "1.75rem", sm: "2rem" },
          }}
        >
          Welcome Back
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.95rem" }}
        >
          Sign in to continue to ExpensesTracker
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
              sx={{ mb: 1, color: theme.palette.text.primary }}
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
                        color: alpha(theme.palette.text.primary, 0.5),
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
                  py: 1.5,
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{ mb: 1, color: theme.palette.text.primary }}
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
                        color: alpha(theme.palette.text.primary, 0.5),
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
                        color: alpha(theme.palette.text.primary, 0.6),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08
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
                  py: 1.5,
                },
              }}
            />
          </Box>

          <ReButton
            loading={isLoading}
            type="submit"
            label="Sign In"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.75,
              mt: 1,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: "1.05rem",
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

          {/* Divider */}
          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                to="/signUp"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
