import Box from "@mui/material/Box";
import type { ReactNode } from "react";

import { designTokens } from "@/theme/tokens";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        mx: "auto",
        px: { xs: 4, sm: 6, lg: 8 },
        py: { xs: 8, sm: 10, lg: 12 },
        width: "100%",
        maxWidth: designTokens.layout.contentMaxWidth,
      }}
    >
      {children}
    </Box>
  );
}
