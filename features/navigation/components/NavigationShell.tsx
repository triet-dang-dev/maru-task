"use client";

import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  CalendarDays,
  ChartGantt,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AppShell, type AppShellNavigationItem } from "@/components/layout/AppShell";
import { SessionGate } from "@/features/auth/components/SessionGate";
import { logout, type BrowserSession } from "@/features/auth/service";

const iconProps = { size: 18, strokeWidth: 1.8 };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function getContextLabel(pathname: string) {
  if (pathname.startsWith("/projects/")) return "Project workspace";
  if (pathname === "/projects") return "Projects";
  return "Dashboard";
}

function isProjectsActive(pathname: string) {
  return pathname === "/projects";
}

function getProjectNavigation(pathname: string): AppShellNavigationItem[] {
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  if (!projectMatch) return [];

  const projectPath = `/projects/${projectMatch[1]}`;
  const items = [
    { href: projectPath, icon: <LayoutDashboard {...iconProps} />, label: "Overview" },
    {
      href: `${projectPath}/work-items`,
      icon: <ListTodo {...iconProps} />,
      label: "Work packages",
    },
    { href: `${projectPath}/boards`, icon: <Columns3 {...iconProps} />, label: "Boards" },
    { href: `${projectPath}/backlogs`, icon: <ListTodo {...iconProps} />, label: "Backlogs" },
    { href: `${projectPath}/gantt`, icon: <ChartGantt {...iconProps} />, label: "Gantt" },
    { href: `${projectPath}/calendar`, icon: <CalendarDays {...iconProps} />, label: "Calendar" },
    { href: `${projectPath}/settings`, icon: <Settings {...iconProps} />, label: "Settings" },
  ];

  return items.map((item) => ({
    ...item,
    active: item.href === projectPath ? pathname === projectPath : isActive(pathname, item.href),
  }));
}

export function NavigationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;

  return (
    <SessionGate>
      {(session) => (
        <AuthenticatedNavigationShell pathname={pathname} session={session}>
          {children}
        </AuthenticatedNavigationShell>
      )}
    </SessionGate>
  );
}

function AuthenticatedNavigationShell({
  children,
  pathname,
  session,
}: {
  children: ReactNode;
  pathname: string;
  session: BrowserSession;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initials = session.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const navigation: AppShellNavigationItem[] = [
    {
      active: isActive(pathname, "/"),
      href: "/",
      icon: <LayoutDashboard {...iconProps} />,
      label: "Dashboard",
    },
    {
      active: isProjectsActive(pathname),
      href: "/projects",
      icon: <FolderKanban {...iconProps} />,
      label: "Projects",
      submenu: {
        items: [
          { active: pathname === "/projects", href: "/projects", label: "Active projects" },
          { href: "/projects?view=mine", label: "My projects" },
          { href: "/projects?view=favorites", label: "Favorite projects" },
          { href: "/projects?view=archived", label: "Archived projects" },
        ],
        searchPlaceholder: "Search by name",
        sections: [
          {
            items: [
              { href: "/projects?status=on-track", label: "On track" },
              { href: "/projects?status=off-track", label: "Off track" },
              { href: "/projects?status=at-risk", label: "At risk" },
            ],
            title: "Status",
          },
        ],
        title: "Projects",
      },
    },
    {
      active: pathname === "/my-work",
      href: "/projects/42",
      icon: <ListTodo {...iconProps} />,
      label: "My work",
    },
  ];
  const projectNavigation = getProjectNavigation(pathname);

  return (
    <AppShell
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Avatar
            aria-label={session.displayName}
            sx={{ bgcolor: "primary.main", height: 32, width: 32 }}
          >
            {initials}
          </Avatar>
          <IconButton aria-label="Sign out" disabled={isSigningOut} onClick={signOut} size="small">
            <LogOut aria-hidden="true" size={18} strokeWidth={1.8} />
          </IconButton>
        </Stack>
      }
      brand="Maru Task"
      contextLabel={getContextLabel(pathname)}
      navigation={navigation}
      projectNavigation={projectNavigation}
      sidebarFooter={
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "secondary.main", height: 30, width: 30 }}>{initials}</Avatar>
          <Stack spacing={0}>
            <Typography sx={{ fontWeight: 700 }} variant="body2">
              {session.displayName}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {session.role}
            </Typography>
          </Stack>
        </Stack>
      }
    >
      {children}
    </AppShell>
  );
}
