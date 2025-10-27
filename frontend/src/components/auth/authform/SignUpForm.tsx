import { useForm } from "react-hook-form";
import { signUpSchema, type SignUpFormData } from "../SignUpPage/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../Common/InputField";
import AlertMessage from "../Common/AlertMessage";
import ReButton from "../Common/ReButton";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}
const SignUpForm = ({
  onSubmit,
  isLoading = false,
  error,
}: SignUpFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 2,
          width: 300,
          border: "1px solid #ccc",
          p: 2,
        }}
      >
        {error && <AlertMessage severity="error" message={error} />}

        <InputField
          label="Username"
          type="text"
          error={!!errors.username}
          helperText={errors.username?.message}
          {...register("username")}
        />
        <InputField
          label="Email"
          type="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
        />

        <InputField
          label="Password"
          type="password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password")}
        />
        <InputField
          label="Confirm Password"
          type="password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <ReButton loading={isLoading} type="submit" label="Sign Up" />
        <nav>
          <Link to="/signIn">Already have an account? Sign In</Link>
        </nav>
      </Box>
    </form>
  );
};
export default SignUpForm;
