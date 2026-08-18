import Box from "@mui/material/Box";
import type { ReactNode } from "react";

import { designTokens } from "@/theme/tokens";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        mx: "auto",
        px: { xs: 3, sm: 4, lg: 5 },
        py: { xs: 4, sm: 5, lg: 6 },
        width: "100%",
        maxWidth: designTokens.layout.contentMaxWidth,
      }}
    >
      {children}
    </Box>
  );
}
