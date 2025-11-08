import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { forwardRef } from "react";

interface InputFieldProps extends Omit<TextFieldProps, "variant"> {
  label: string;
  type?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, type = "text", helperText, ...props }, ref) => {
    return (
      <TextField
        label={label}
        type={type}
        helperText={helperText}
        inputRef={ref}
        variant="outlined"
        {...props}
      />
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
