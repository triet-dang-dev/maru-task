"use client";

import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import {
  BookOpen,
  CalendarDays,
  ChartGantt,
  Clock,
  Columns3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { AppShell, type AppShellNavigationItem } from "@/components/layout/AppShell";
import { SessionGate } from "@/features/auth/components/SessionGate";
import { logout, type BrowserSession } from "@/features/auth/service";
import {
  NotificationCenter,
  type NotificationItem,
} from "@/features/notifications/components/NotificationCenter";
import { getProjects } from "@/features/projects/service";
import type { ProjectListItem } from "@/features/projects/types";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";

import { navigationTree, type NavigationTreeItem } from "../navigation-tree";
import { ProjectScopeSelector } from "./ProjectScopeSelector";

const iconProps = { size: 18, strokeWidth: 1.8 };

const placeholderNotifications: NotificationItem[] = [
  {
    actor: "Dana Chen",
    id: "notification-1",
    message: "mentioned you in Review the release checklist",
    read: false,
    timestamp: "18 minutes ago",
  },
  {
    actor: "Morgan Tate",
    id: "notification-2",
    message: "assigned you WP-138",
    read: false,
    timestamp: "Yesterday",
  },
  {
    actor: "Riley Park",
    id: "notification-3",
    message: "updated WP-131",
    read: true,
    timestamp: "Monday",
  },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function getContextLabel(pathname: string) {
  if (pathname.startsWith("/projects/")) return "Project workspace";
  if (pathname === "/projects") return "Projects";
  if (pathname === "/my/page") return "Personal workspace";
  if (pathname === "/home") return "Home";
  return "Dashboard";
}

function isProjectsActive(pathname: string) {
  return (
    pathname === "/projects" ||
    /^\/projects\/[^/]+$/.test(pathname) ||
    ["active", "mine", "favorites", "archived", "status"].some((view) =>
      pathname.startsWith(`/projects/${view}`),
    )
  );
}

function getNavigationIcon(label: string) {
  const icons: Record<string, ReactNode> = {
    Boards: <Columns3 {...iconProps} />,
    "Gantt charts": <ChartGantt {...iconProps} />,
    Home: <LayoutDashboard {...iconProps} />,
    Meetings: <CalendarDays {...iconProps} />,
    "My page": <LayoutDashboard {...iconProps} />,
    "My time tracking": <Clock {...iconProps} />,
    News: <FileText {...iconProps} />,
    Portfolios: <FolderKanban {...iconProps} />,
    Projects: <FolderKanban {...iconProps} />,
    Requirements: <FileText {...iconProps} />,
    "Time and costs": <Clock {...iconProps} />,
    Wiki: <BookOpen {...iconProps} />,
    "Work packages": <ListTodo {...iconProps} />,
  };

  return icons[label];
}

function resolveNavigationHref(href: string | undefined, projectId: string | null) {
  if (!href?.includes(":projectId")) return href;
  return projectId ? href.replace(":projectId", projectId) : undefined;
}

function toAppShellNavigation(
  items: NavigationTreeItem[],
  pathname: string,
  projectId: string | null,
): AppShellNavigationItem[] {
  return items.map((item) => {
    const href = resolveNavigationHref(item.href, projectId);
    const hasChildren = Boolean(item.children?.length);
    const active =
      item.label === "Projects"
        ? isProjectsActive(pathname)
        : href
          ? isActive(pathname, href)
          : false;

    return {
      active,
      disabled: item.availability === "planned" || !href,
      href,
      icon: getNavigationIcon(item.label),
      label: item.label,
      submenu: hasChildren
        ? {
            items: toAppShellNavigation(item.children!, pathname, projectId),
            title: item.label,
          }
        : undefined,
    };
  });
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
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getProjects()
      .then((response) => {
        if (isMounted) setProjectList(response.items);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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

  const selectedProjectId = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  ).get("projectId");
  const projectId = selectedProjectId ?? pathname.match(/^\/projects\/(\d+)/)?.[1] ?? null;
  const navigation = toAppShellNavigation(navigationTree, pathname, projectId);

  const updateProjectScope = (nextProjectId: string | null) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (nextProjectId) searchParams.set("projectId", nextProjectId);
    else searchParams.delete("projectId");

    const search = searchParams.toString();
    router.replace(search ? `${pathname}?${search}` : pathname);
  };

  return (
    <AppShell
      actions={
        <Stack
          direction="row"
          spacing={{ sm: 1, xs: 0.5 }}
          sx={{ alignItems: "center", minWidth: 0 }}
        >
          <GlobalSearch />
          <NotificationCenter notifications={placeholderNotifications} />
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              ml: 2,
              pl: 2,
            }}
          >
            <Avatar
              aria-label={session.displayName}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.14)",
                border: 1,
                borderColor: "rgba(255, 255, 255, 0.42)",
                fontSize: "0.75rem",
                fontWeight: 700,
                height: 30,
                width: 30,
              }}
            >
              {initials}
            </Avatar>
            <IconButton
              aria-label="Sign out"
              disabled={isSigningOut}
              onClick={signOut}
              size="small"
              sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.14)" }, color: "inherit" }}
            >
              <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
            </IconButton>
          </Stack>
        </Stack>
      }
      brand="Maru Task"
      contextLabel={getContextLabel(pathname)}
      navigation={navigation}
      projectScope={
        <ProjectScopeSelector
          onChange={updateProjectScope}
          projects={projectList}
          value={selectedProjectId}
        />
      }
    >
      {children}
    </AppShell>
  );
}
