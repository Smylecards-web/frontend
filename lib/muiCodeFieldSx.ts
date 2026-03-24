import type { SxProps, Theme } from "@mui/material/styles";

export function centeredNumericCodeFieldSx(digits: 4 | 6): SxProps<Theme> {
  return {
    "& .MuiOutlinedInput-input": {
      textAlign: "center",
      letterSpacing: digits === 6 ? "0.35em" : "0.5em",
      fontSize: "1.375rem",
      fontWeight: 500,
    },
  };
}
