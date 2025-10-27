import { createContext, useState, useMemo } from "react";
import { createTheme, type Theme } from "@mui/material/styles";

interface ColorTokens {
  grey: { [key: number]: string };
  primary: { [key: number]: string };
  success: { [key: number]: string };
  error: { [key: number]: string };
  warning: { [key: number]: string };
  info: { [key: number]: string };
  chart: string[];
}

export const tokens = (mode: "light" | "dark"): ColorTokens => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#1e1e1e",
          900: "#121212",
        },
        primary: {
          100: "#cfe2ff",
          200: "#9ec5fe",
          300: "#6ea8fe",
          400: "#3d8bfd",
          500: "#0d6efd",
          600: "#0a58ca",
          700: "#084298",
          800: "#052c65",
          900: "#031633",
        },
        success: {
          100: "#d1e7dd",
          200: "#a3cfbb",
          300: "#75b798",
          400: "#479f76",
          500: "#198754",
          600: "#146c43",
          700: "#0f5132",
          800: "#0a3622",
          900: "#051b11",
        },
        error: {
          100: "#f8d7da",
          200: "#f1aeb5",
          300: "#ea868f",
          400: "#e35d6a",
          500: "#dc3545",
          600: "#b02a37",
          700: "#842029",
          800: "#58151c",
          900: "#2c0b0e",
        },
        warning: {
          100: "#fff3cd",
          200: "#ffe69c",
          300: "#ffda6a",
          400: "#ffcd39",
          500: "#ffc107",
          600: "#cc9a06",
          700: "#997404",
          800: "#664d03",
          900: "#332701",
        },
        info: {
          100: "#cff4fc",
          200: "#9eeaf9",
          300: "#6edff6",
          400: "#3dd5f3",
          500: "#0dcaf0",
          600: "#0aa2c0",
          700: "#087990",
          800: "#055160",
          900: "#032830",
        },
        chart: [
          "#0d6efd",
          "#198754",
          "#dc3545",
          "#ffc107",
          "#0dcaf0",
          "#6f42c1",
          "#fd7e14",
        ],
      }
    : {
        // FIXED LIGHT MODE - proper order
        grey: {
          100: "#f5f5f5", // Lightest
          200: "#e0e0e0",
          300: "#c2c2c2",
          400: "#a3a3a3",
          500: "#858585",
          600: "#666666",
          700: "#525252",
          800: "#3d3d3d",
          900: "#1e1e1e", // Darkest
        },
        primary: {
          100: "#cfe2ff",
          200: "#9ec5fe",
          300: "#6ea8fe",
          400: "#3d8bfd",
          500: "#0d6efd",
          600: "#0a58ca",
          700: "#084298",
          800: "#052c65",
          900: "#031633",
        },
        success: {
          100: "#d1e7dd",
          200: "#a3cfbb",
          300: "#75b798",
          400: "#479f76",
          500: "#198754",
          600: "#146c43",
          700: "#0f5132",
          800: "#0a3622",
          900: "#051b11",
        },
        error: {
          100: "#f8d7da",
          200: "#f1aeb5",
          300: "#ea868f",
          400: "#e35d6a",
          500: "#dc3545",
          600: "#b02a37",
          700: "#842029",
          800: "#58151c",
          900: "#2c0b0e",
        },
        warning: {
          100: "#fff3cd",
          200: "#ffe69c",
          300: "#ffda6a",
          400: "#ffcd39",
          500: "#ffc107",
          600: "#cc9a06",
          700: "#997404",
          800: "#664d03",
          900: "#332701",
        },
        info: {
          100: "#cff4fc",
          200: "#9eeaf9",
          300: "#6edff6",
          400: "#3dd5f3",
          500: "#0dcaf0",
          600: "#0aa2c0",
          700: "#087990",
          800: "#055160",
          900: "#032830",
        },
        chart: [
          "#0d6efd",
          "#198754",
          "#dc3545",
          "#ffc107",
          "#0dcaf0",
          "#6f42c1",
          "#fd7e14",
        ],
      }),
});

export const themeSettings = (mode: "light" | "dark") => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      primary: {
        main: colors.primary[500],
        light: colors.primary[300],
        dark: colors.primary[700],
      },
      success: {
        main: colors.success[500],
        light: colors.success[300],
        dark: colors.success[700],
      },
      error: {
        main: colors.error[500],
        light: colors.error[300],
        dark: colors.error[700],
      },
      warning: {
        main: colors.warning[500],
        light: colors.warning[300],
        dark: colors.warning[700],
      },
      info: {
        main: colors.info[500],
        light: colors.info[300],
        dark: colors.info[700],
      },
      background: {
        default: mode === "dark" ? colors.grey[900] : "#ffffff",
        paper: mode === "dark" ? colors.grey[800] : "#f8f9fa",
      },
      text: {
        primary: mode === "dark" ? colors.grey[100] : colors.grey[900],
        secondary: mode === "dark" ? colors.grey[300] : colors.grey[600],
      },
    },
    typography: {
      fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(
        ","
      ),
      fontSize: 14,
      h1: {
        fontSize: 40,
        fontWeight: 700,
      },
      h2: {
        fontSize: 32,
        fontWeight: 600,
      },
      h3: {
        fontSize: 24,
        fontWeight: 600,
      },
      h4: {
        fontSize: 20,
        fontWeight: 600,
      },
      h5: {
        fontSize: 16,
        fontWeight: 500,
      },
      h6: {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none" as const,
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "dark"
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      // Fix input fields for light mode
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-input": {
              color: mode === "dark" ? colors.grey[100] : colors.grey[900],
            },
            "& .MuiInputLabel-root": {
              color: mode === "dark" ? colors.grey[300] : colors.grey[600],
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor:
                  mode === "dark" ? colors.grey[700] : colors.grey[300],
              },
              "&:hover fieldset": {
                borderColor:
                  mode === "dark" ? colors.grey[600] : colors.grey[400],
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? colors.grey[100] : colors.grey[900],
          },
        },
      },
    },
  };
};

export const ColorModeContext = createContext<{
  toggleColorMode: () => void;
}>({
  toggleColorMode: () => {},
});

export const useMode = (): [Theme, { toggleColorMode: () => void }] => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prevMode) => (prevMode === "dark" ? "light" : "dark")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};
