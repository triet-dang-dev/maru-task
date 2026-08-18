"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

import { useUiStore } from "@/stores/use-ui-store";
import { designTokens } from "@/theme/tokens";

import { AppShellSidebar } from "./AppShellSidebar";
import type { AppShellProps } from "./types";

export type { AppShellNavigationItem, AppShellProps } from "./types";

export function AppShell({
  actions,
  brand,
  children,
  contextLabel = "Workspace",
  isCollapsed: controlledIsCollapsed,
  navigation,
  onToggleCollapse: controlledToggleCollapse,
  projectNavigation,
  projectScope,
  sidebarFooter,
}: AppShellProps) {
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const storeIsCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const storeToggleCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);

  const isCollapsed = controlledIsCollapsed ?? storeIsCollapsed;
  const toggleCollapse = controlledToggleCollapse ?? storeToggleCollapsed;

  const currentDrawerWidth = isCollapsed
    ? designTokens.layout.sidebarCollapsedWidth
    : designTokens.layout.sidebarWidth;

  return (
    <Box sx={{ bgcolor: "background.default", display: "flex", minHeight: "100dvh" }}>
      <AppBar
        color="primary"
        elevation={0}
        position="fixed"
        sx={{
          bgcolor: "primary.main",
          borderBottom: 0,
          color: "primary.contrastText",
          ml: { md: `${currentDrawerWidth}px` },
          transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1), margin 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        }}
      >
        <Toolbar
          sx={{
            gap: 2,
            minHeight: `${designTokens.layout.headerHeight}px !important`,
            px: { xs: 3, sm: 4 },
          }}
        >
          <IconButton
            aria-label="Open navigation"
            edge="start"
            onClick={toggleSidebar}
            sx={{ display: { md: "none" } }}
          >
            <Menu aria-hidden="true" size={20} strokeWidth={1.8} />
          </IconButton>
          <Typography
            sx={{ display: { sm: "block", xs: "none" }, flexGrow: 1, fontWeight: 600 }}
            variant="body2"
          >
            {contextLabel}
          </Typography>
          <Box sx={{ flexShrink: 0, minWidth: 0 }}>{actions}</Box>
        </Toolbar>
      </AppBar>

      <Box
        component="aside"
        sx={{
          flexShrink: { md: 0 },
          transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          width: { md: currentDrawerWidth },
        }}
      >
        {/* Mobile Temporary Drawer (Always full width) */}
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={closeSidebar}
          open={isSidebarOpen}
          sx={{
            display: { md: "none" },
            "& .MuiDrawer-paper": { width: designTokens.layout.sidebarWidth },
          }}
          variant="temporary"
        >
          <AppShellSidebar
            brand={brand}
            isCollapsed={false}
            navigation={navigation}
            onNavigate={closeSidebar}
            projectNavigation={projectNavigation}
            projectScope={projectScope}
            sidebarFooter={sidebarFooter}
          />
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          open
          sx={{
            display: { md: "block", xs: "none" },
            "& .MuiDrawer-paper": {
              borderRightColor: "divider",
              overflowX: "hidden",
              transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              width: currentDrawerWidth,
            },
          }}
          variant="permanent"
        >
          <AppShellSidebar
            brand={brand}
            isCollapsed={isCollapsed}
            navigation={navigation}
            onToggleCollapse={toggleCollapse}
            projectNavigation={projectNavigation}
            projectScope={projectScope}
            sidebarFooter={sidebarFooter}
          />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: `${designTokens.layout.headerHeight}px`,
          transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
