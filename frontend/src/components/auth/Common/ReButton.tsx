import { Button, CircularProgress, type ButtonProps } from "@mui/material";

interface ReButtonProps extends ButtonProps {
  loading?: boolean;
  label?: string;
}

const ReButton = ({
  loading = false,
  label,
  children,
  disabled,
  ...props
}: ReButtonProps) => {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        label || children
      )}
    </Button>
  );
};

export default ReButton;
