"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

dayjs.locale("en-gb");

const muiTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#09090b",
      paper: "#18181b",
    },
    text: {
      primary: "#fafafa",
      secondary: "#a1a1aa",
    },
    primary: {
      main: "#fafafa",
    },
    divider: "#27272a",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        size: "medium",
      },
      styleOverrides: {
        root: {
          display: "block",
          marginTop: 0,
          marginBottom: 0,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginTop: 0,
          marginBottom: 0,
          verticalAlign: "top",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          backgroundColor: "rgb(24 24 27)",
          color: "rgb(244 244 245)",
          "& fieldset": {
            borderColor: "rgb(39 39 42)",
          },
          "&:hover fieldset": {
            borderColor: "rgb(63 63 70)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "rgb(161 161 170)",
            borderWidth: "1px",
          },
        },
        input: {
          fontSize: "0.875rem",
          lineHeight: 1.5,
          padding: "14px 16px",
        },
        inputMultiline: {
          padding: "14px 16px",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgb(161 161 170)",
          "&.Mui-focused": {
            color: "rgb(212 212 216)",
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "rgb(161 161 170)",
          marginTop: "6px",
          fontSize: "0.75rem",
        },
      },
    },
  },
});

export function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
