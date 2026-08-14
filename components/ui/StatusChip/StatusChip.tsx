import Chip, { type ChipProps } from "@mui/material/Chip";

import type { StatusTone } from "@/theme/tokens";

export interface StatusChipProps extends Omit<ChipProps, "color" | "variant"> {
  tone?: StatusTone;
}

const toneColor: Record<StatusTone, ChipProps["color"]> = {
  error: "error",
  info: "info",
  neutral: "default",
  success: "success",
  warning: "warning",
};

export function StatusChip({ tone = "neutral", ...props }: StatusChipProps) {
  return <Chip color={toneColor[tone]} data-tone={tone} variant="outlined" {...props} />;
}
