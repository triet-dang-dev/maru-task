import { createTheme } from "@mui/material/styles";

import { designTokens } from "./tokens";

const { brand, neutral } = designTokens.color;

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1440,
    },
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: "center",
          borderRadius: designTokens.radius.md,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          fontWeight: 600,
          minHeight: 36,
          paddingInline: 12,
          textTransform: "none",
          transition: `background-color ${designTokens.motion.durationFast} ${designTokens.motion.easing}, border-color ${designTokens.motion.durationFast} ${designTokens.motion.easing}, color ${designTokens.motion.durationFast} ${designTokens.motion.easing}, transform ${designTokens.motion.durationFast} ${designTokens.motion.easing}`,
          "&:active": {
            transform: "translateY(1px) scale(0.99)",
          },
          "&:focus-visible": {
            boxShadow: designTokens.shadow.focus,
            outline: "none",
          },
        },
        sizeLarge: {
          minHeight: 40,
          paddingInline: 16,
        },
        sizeSmall: {
          minHeight: 32,
          paddingInline: 10,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.sm,
          "&:focus-visible": {
            boxShadow: designTokens.shadow.focus,
          },
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          fontSize: "0.75rem",
          fontWeight: 600,
          height: 26,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${neutral[200]}`,
          borderRadius: designTokens.radius.lg,
          boxShadow: designTokens.shadow.raised,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          transition: `background-color ${designTokens.motion.durationFast} ${designTokens.motion.easing}, transform ${designTokens.motion.durationFast} ${designTokens.motion.easing}`,
          "&:active": {
            transform: "scale(0.96)",
          },
          "&:focus-visible": {
            boxShadow: designTokens.shadow.focus,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 550,
          "&.MuiInputLabel-outlined.MuiInputLabel-shrink": {
            backgroundColor: neutral[0],
            paddingInline: 4,
            transform: "translate(11px, -9px) scale(0.75)",
          },
          "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
            transform: "translate(14px, 11px) scale(1)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          backgroundColor: neutral[0],
          transition: `box-shadow ${designTokens.motion.durationFast} ${designTokens.motion.easing}`,
          "&.Mui-focused": {
            boxShadow: designTokens.shadow.focus,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1,
          },
        },
        input: {
          paddingBlock: 8.5,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        rounded: {
          borderRadius: designTokens.radius.md,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: neutral[600],
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        },
        root: {
          borderColor: neutral[200],
          padding: "14px 16px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color ${designTokens.motion.durationFast} ${designTokens.motion.easing}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: designTokens.radius.sm,
          fontSize: "0.75rem",
          padding: "6px 10px",
        },
      },
    },
  },
  cssVariables: true,
  palette: {
    action: {
      active: neutral[600],
      hover: "#f6f8fa",
      selected: "#d1e1ed",
    },
    background: {
      default: neutral[0],
      paper: neutral[0],
    },
    divider: neutral[200],
    error: {
      main: "#9E2A1C",
    },
    info: {
      main: brand[600],
    },
    primary: {
      contrastText: neutral[0],
      dark: brand[700],
      light: brand[100],
      main: brand[600],
    },
    secondary: {
      contrastText: neutral[0],
      dark: neutral[900],
      light: neutral[600],
      main: neutral[800],
    },
    success: {
      main: "#1F883D",
    },
    text: {
      primary: neutral[900],
      secondary: neutral[600],
    },
    warning: {
      main: "#F99601",
    },
  },
  shape: {
    borderRadius: designTokens.radius.md,
  },
  spacing: 4,
  typography: {
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.5,
    },
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    fontWeightBold: 600,
    fontWeightMedium: 600,
    fontWeightRegular: 400,
    h1: {
        fontSize: "2rem",
        fontWeight: 600,
        letterSpacing: 0,
        lineHeight: 1.5,
    },
    h2: {
        fontSize: "1.5rem",
        fontWeight: 600,
        letterSpacing: 0,
        lineHeight: 1.5,
    },
    h3: {
        fontSize: "1.25rem",
        fontWeight: 600,
        letterSpacing: 0,
        lineHeight: 1.5,
    },
    h4: {
      fontSize: "1.125rem",
      fontWeight: 650,
      letterSpacing: "-0.015em",
      lineHeight: 1.35,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 650,
      lineHeight: 1.45,
    },
  },
});
