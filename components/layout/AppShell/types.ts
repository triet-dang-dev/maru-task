import type { ReactNode } from "react";

export interface AppShellNavigationSubmenu {
  items: AppShellNavigationItem[];
  searchPlaceholder?: string;
  sections?: Array<{ items: AppShellNavigationItem[]; title: string }>;
  title: string;
}

export interface AppShellNavigationItem {
  active?: boolean;
  disabled?: boolean;
  href?: string;
  icon?: ReactNode;
  label: string;
  submenu?: AppShellNavigationSubmenu;
  trailing?: ReactNode;
}

export interface AppShellProps {
  actions?: ReactNode;
  brand: string;
  children: ReactNode;
  contextLabel?: string;
  navigation: AppShellNavigationItem[];
  projectNavigation?: AppShellNavigationItem[];
  projectScope?: ReactNode;
  sidebarFooter?: ReactNode;
}
