import { describe, expect, it } from "vitest";

import { designTokens } from "./tokens";
import { theme } from "./theme";

describe("design system theme", () => {
  it("matches the OpenProject brand palette and system typography", () => {
    expect(designTokens.color.brand[600]).toBe("#1A67A3");
    expect(theme.palette.primary.main).toBe(designTokens.color.brand[600]);
    expect(theme.palette.success.main).toBe("#1F883D");
    expect(theme.palette.background.default).toBe("#ffffff");
    expect(theme.typography.fontFamily).toContain("Noto Sans");
    expect(theme.typography.fontFamily).not.toContain("Inter");
  });

  it("uses the documented responsive breakpoints and layout bounds", () => {
    expect(theme.breakpoints.values).toEqual({
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1440,
    });
    expect(designTokens.layout.headerHeight).toBe(55);
    expect(designTokens.layout.sidebarWidth).toBe(280);
  });

  it("keeps component radii on the shared radius scale", () => {
    expect(theme.shape.borderRadius).toBe(designTokens.radius.md);
    expect(designTokens.radius.md).toBe(4);
  });

  it("aligns outlined labels with compact inputs and masks the focus ring", () => {
    expect(theme.components?.MuiInputLabel?.styleOverrides?.root).toMatchObject({
      "&.MuiInputLabel-outlined.MuiInputLabel-shrink": {
        backgroundColor: designTokens.color.neutral[0],
        paddingInline: 4,
        transform: "translate(11px, -9px) scale(0.75)",
      },
      "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
        transform: "translate(14px, 11px) scale(1)",
      },
    });
  });
});
