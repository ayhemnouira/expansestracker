import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import InputField from "../Common/InputField";
import AlertMessage from "../Common/AlertMessage";
import ReButton from "../Common/ReButton";

import { zodResolver } from "@hookform/resolvers/zod";

import { signInSchema, type SignInFormData } from "../SignInPage/schema";
import { Link } from "react-router-dom";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

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

        <ReButton loading={isLoading} type="submit" label="Sign In" />
        <nav>
          <Link to="/signUp">Don't have an account? Sign Up</Link>
        </nav>
      </Box>
    </form>
  );
};
export default SignInForm;
