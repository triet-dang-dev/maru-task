import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NavigationShell } from "@/features/navigation/components/NavigationShell";

import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Northstar UI Boilerplate",
    template: "%s | Northstar UI Boilerplate",
  },
  description:
    "A production-ready Next.js, MUI, and Tailwind design-system foundation for enterprise applications.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <AppProviders>
          <NavigationShell>{children}</NavigationShell>
        </AppProviders>
      </body>
    </html>
  );
}
