import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { ColorModeContext, useMode } from "./theme/theme";
import { AuthProvider } from "./context/auth-provider";

import SignInPage from "./components/auth/SignInPage/SignInPage";
import SignUpPage from "./components/auth/SignUpPage/SignUpPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/dashboard";
import TransactionsPage from "./pages/Transactions";
import AccountsPage from "./pages/AccountsPage";
import Budgets from "./pages/Budgets";
import DocumentsPage from "./pages/DocumentsPage"; // Add this import

const App = () => {
  const [theme, colorMode] = useMode();

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Routes>
                {/* Public routes */}
                <Route path="/signIn" element={<SignInPage />} />
                <Route path="/signUp" element={<SignUpPage />} />

                {/* Protected routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                </Route>
              </Routes>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background:
                      theme.palette.mode === "dark" ? "#363636" : "#fff",
                    color: theme.palette.mode === "dark" ? "#fff" : "#363636",
                    boxShadow: theme.shadows[8],
                    borderRadius: "12px",
                    padding: "16px",
                  },
                  success: {
                    iconTheme: {
                      primary: theme.palette.success.main,
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: theme.palette.error.main,
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </Box>
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
};

export default App;
