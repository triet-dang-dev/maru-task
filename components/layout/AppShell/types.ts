import type { ReactNode } from "react";

export interface AppShellNavigationSubmenu {
  items: AppShellNavigationItem[];
  searchPlaceholder?: string;
  sections?: Array<{ items: AppShellNavigationItem[]; title: string }>;
  title: string;
}

export interface AppShellNavigationItem {
  active?: boolean;
  badge?: ReactNode;
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
  isCollapsed?: boolean;
  navigation: AppShellNavigationItem[];
  onToggleCollapse?: () => void;
  projectNavigation?: AppShellNavigationItem[];
  projectScope?: ReactNode;
  sidebarFooter?: ReactNode;
}

