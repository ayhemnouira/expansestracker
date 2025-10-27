import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";
import { ColorModeContext, useMode } from "./theme/theme";

function Root() {
  const [theme, colorMode] = useMode();

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}
createRoot(document.getElementById("root")!).render(<Root />);
