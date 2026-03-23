export const theme = {
  defaultColorScheme: "dark" as const,
  colors: {
    brand: "#E235BA",
    background: {
      dark: "#09090b",
      light: "#ffffff",
    },
    foreground: {
      dark: "#fafafa",
      light: "#171717",
    },
  },
} as const;

export type Theme = typeof theme;
