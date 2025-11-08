import { Alert, type AlertProps } from "@mui/material";
import type { ReactNode } from "react";

interface AlertMessageProps extends AlertProps {
  message?: string;
  children?: ReactNode;
}

const AlertMessage = ({ message, ...props }: AlertMessageProps) => {
  return (
    <Alert {...props}>
      {message || props.children || "This is an alert message."}
    </Alert>
  );
};

export default AlertMessage;
