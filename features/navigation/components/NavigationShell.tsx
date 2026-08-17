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
  Settings,
  UsersRound,
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
  if (pathname === "/") return "Personal workspace";
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
    {
      href: `${projectPath}/team-planner`,
      icon: <UsersRound {...iconProps} />,
      label: "Team planner",
    },
    { href: `${projectPath}/backlogs`, icon: <ListTodo {...iconProps} />, label: "Backlogs" },
    { href: `${projectPath}/gantt`, icon: <ChartGantt {...iconProps} />, label: "Gantt" },
    { href: `${projectPath}/calendar`, icon: <CalendarDays {...iconProps} />, label: "Calendar" },
    { href: `${projectPath}/documents`, icon: <FileText {...iconProps} />, label: "Documents" },
    { href: `${projectPath}/wiki`, icon: <BookOpen {...iconProps} />, label: "Wiki" },
    {
      href: `${projectPath}/reports/time-cost`,
      icon: <Clock {...iconProps} />,
      label: "Time and costs",
    },
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
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getProjects()
      .then((res) => {
        if (isMounted && res.items) {
          setProjectList(res.items);
        }
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

  const navigation: AppShellNavigationItem[] = [
    {
      active: isActive(pathname, "/"),
      href: "/",
      icon: <LayoutDashboard {...iconProps} />,
      label: "My page",
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
          ...(projectList.length > 0
            ? [
                {
                  items: projectList.map((proj) => ({
                    active: pathname.startsWith(`/projects/${proj.id}`),
                    href: `/projects/${proj.id}`,
                    label: proj.name,
                  })),
                  title: "All projects",
                },
              ]
            : []),
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
      href: "/projects/42/work-items",
      icon: <ListTodo {...iconProps} />,
      label: "My work",
    },
  ];
  const projectNavigation = getProjectNavigation(pathname);

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
      projectNavigation={projectNavigation}
    >
      {children}
    </AppShell>
  );
}
