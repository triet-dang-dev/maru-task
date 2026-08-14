"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { ReactNode } from "react";

import { AppToastProvider } from "@/components/common/AppToast";
import { MuiProvider } from "@/providers/MuiProvider";
import { QueryProvider } from "@/providers/QueryProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MuiProvider>
        <QueryProvider>
          {children}
          <AppToastProvider />
        </QueryProvider>
      </MuiProvider>
    </AppRouterCacheProvider>
  );
}
