"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Menu } from "lucide-react";

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
  navigation,
  projectNavigation,
  sidebarFooter,
}: AppShellProps) {
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const drawerWidth = designTokens.layout.sidebarWidth;

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
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
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

      <Box component="aside" sx={{ flexShrink: { md: 0 }, width: { md: drawerWidth } }}>
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={closeSidebar}
          open={isSidebarOpen}
          sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
          variant="temporary"
        >
          <AppShellSidebar
            brand={brand}
            navigation={navigation}
            onNavigate={closeSidebar}
            projectNavigation={projectNavigation}
            sidebarFooter={sidebarFooter}
          />
        </Drawer>
        <Drawer
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { borderRightColor: "divider", width: drawerWidth },
          }}
          variant="permanent"
        >
          <AppShellSidebar
            brand={brand}
            navigation={navigation}
            projectNavigation={projectNavigation}
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
