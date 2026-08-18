import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { NavigationShell } from "@/features/navigation/components/NavigationShell";

import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Maru Task Boilerplate",
    template: "%s | Maru Task Boilerplate",
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
          {/* Suspense required by useSearchParams inside NavigationShell */}
          <Suspense>
            <NavigationShell>{children}</NavigationShell>
          </Suspense>
        </AppProviders>
      </body>
    </html>
  );
}
