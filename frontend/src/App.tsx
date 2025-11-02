import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ColorModeContext, useMode } from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";

import SignInPage from "./components/auth/SignInPage/SignInPage";
import SignUpPage from "./components/auth/SignUpPage/SignUpPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/dashboard";

const App = () => {
  const [theme, colorMode] = useMode();

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/signIn" element={<SignInPage />} />
              <Route path="/signUp" element={<SignUpPage />} />

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
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
};

export default App;
