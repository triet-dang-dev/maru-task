import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { AppShellNavigationItem, AppShellNavigationSubmenu, AppShellProps } from "./types";

function NavigationItemContent({
  isCollapsed,
  item,
  onNavigate,
  onOpenSubmenu,
}: {
  isCollapsed?: boolean;
  item: AppShellNavigationItem;
  onNavigate?: () => void;
  onOpenSubmenu?: (submenu: AppShellNavigationSubmenu) => void;
}) {
  const button = (
    <ListItemButton
      aria-current={item.active ? "page" : undefined}
      aria-label={item.submenu ? `Open ${item.label} menu` : undefined}
      component={item.submenu || item.disabled ? "button" : Link}
      disabled={item.disabled}
      href={item.submenu || item.disabled ? undefined : item.href}
      onClick={item.submenu ? () => onOpenSubmenu?.(item.submenu!) : onNavigate}
      selected={item.active}
      sx={{
        alignItems: "center",
        border: "1px solid transparent",
        borderLeft: isCollapsed
          ? item.active
            ? "3px solid"
            : "1px solid transparent"
          : item.active
            ? "5px solid"
            : "1px solid transparent",
        borderLeftColor: item.active ? "primary.main" : "transparent",
        borderRadius: 1,
        boxSizing: "border-box",
        height: isCollapsed ? 40 : 36,
        justifyContent: isCollapsed ? "center" : "flex-start",
        minHeight: isCollapsed ? 40 : 36,
        mx: isCollapsed ? "auto" : 0,
        p: isCollapsed ? 0 : undefined,
        pl: isCollapsed ? 0 : 1,
        pr: isCollapsed ? 0 : 1.5,
        width: isCollapsed ? 40 : "100%",
        "&.Mui-selected": {
          bgcolor: "action.selected",
          borderColor: "#c0d7e8",
          borderLeft: isCollapsed ? "3px solid !important" : "5px solid !important",
          borderLeftColor: "primary.main !important",
          color: "primary.dark",
          "& .MuiListItemIcon-root": { color: "primary.main" },
        },
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "action.hover",
          borderLeftColor: item.active ? "primary.main" : "transparent",
        },
      }}
    >
      {item.icon ? (
        <ListItemIcon
          sx={{
            alignItems: "center",
            color: item.active ? "primary.main" : "text.secondary",
            display: "flex",
            flexShrink: 0,
            justifyContent: "center",
            margin: 0,
            minWidth: isCollapsed ? "unset" : 30,
            width: isCollapsed ? "100%" : "auto",
            "& svg": {
              display: "block",
              flexShrink: 0,
              height: 20,
              minHeight: 20,
              minWidth: 20,
              width: 20,
            },
          }}
        >
          {item.icon}
        </ListItemIcon>
      ) : null}
      {!isCollapsed ? (
        <>
          <ListItemText
            primary={item.label}
            slotProps={{ primary: { sx: { fontSize: 14, fontWeight: item.active ? 700 : 550 } } }}
          />
          {item.badge ? (
            <Box
              component="span"
              sx={{
                bgcolor: item.active ? "primary.main" : "action.selected",
                borderRadius: 999,
                color: item.active ? "primary.contrastText" : "text.primary",
                fontSize: 11,
                fontWeight: 700,
                mr: item.submenu ? 1 : 0,
                px: 1,
                py: 0.2,
              }}
            >
              {item.badge}
            </Box>
          ) : null}
          {item.submenu ? (
            <ChevronRight
              aria-hidden="true"
              size={17}
              strokeWidth={1.8}
              style={{ flexShrink: 0, marginLeft: "auto" }}
            />
          ) : (
            item.trailing
          )}
        </>
      ) : null}
    </ListItemButton>
  );

  if (isCollapsed) {
    return (
      <Tooltip arrow placement="right" title={item.label}>
        <Box component="li" sx={{ listStyle: "none" }}>
          {button}
        </Box>
      </Tooltip>
    );
  }

  return button;
}

function Navigation({
  isCollapsed,
  items,
  label,
  onNavigate,
  onOpenSubmenu,
  title,
}: {
  isCollapsed?: boolean;
  items: AppShellNavigationItem[];
  label: string;
  onNavigate?: () => void;
  onOpenSubmenu?: (submenu: AppShellNavigationSubmenu) => void;
  title?: string;
}) {
  return (
    <Box aria-label={label} component="nav" sx={{ px: isCollapsed ? 1 : 3, py: 2 }}>
      {title && !isCollapsed ? (
        <Typography color="text.secondary" sx={{ fontWeight: 700, mb: 1, px: 1 }} variant="caption">
          {title}
        </Typography>
      ) : null}
      <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
        {items.map((item) => (
          <NavigationItemContent
            isCollapsed={isCollapsed}
            item={item}
            key={`${item.label}:${item.href}`}
            onNavigate={onNavigate}
            onOpenSubmenu={onOpenSubmenu}
          />
        ))}
      </List>
    </Box>
  );
}

function InlineNavigation({
  items,
  label,
  onNavigate,
}: {
  items: AppShellNavigationItem[];
  label: string;
  onNavigate?: () => void;
}) {
  const [expandedLabels, setExpandedLabels] = useState<string[]>([]);

  const toggleExpanded = (labelToToggle: string) => {
    setExpandedLabels((currentLabels) =>
      currentLabels.includes(labelToToggle)
        ? currentLabels.filter((label) => label !== labelToToggle)
        : [...currentLabels, labelToToggle],
    );
  };

  return (
    <Box aria-label={label} component="nav">
      <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
        {items.map((item) => {
          const isExpanded = expandedLabels.includes(item.label);

          return (
            <Box key={`${item.label}:${item.href}`}>
              <ListItemButton
                aria-current={item.active ? "page" : undefined}
                aria-expanded={item.submenu ? isExpanded : undefined}
                aria-label={item.submenu ? `Open ${item.label} menu` : undefined}
                component={item.submenu || item.disabled ? "button" : Link}
                disabled={item.disabled}
                href={item.submenu || item.disabled ? undefined : item.href}
                onClick={item.submenu ? () => toggleExpanded(item.label) : onNavigate}
                selected={item.active}
                sx={{
                  alignItems: "center",
                  border: "1px solid transparent",
                  borderLeft: item.active ? "5px solid" : "1px solid transparent",
                  borderLeftColor: item.active ? "primary.main" : "transparent",
                  borderRadius: 1,
                  boxSizing: "border-box",
                  display: "flex",
                  justifyContent: "space-between",
                  minHeight: 36,
                  pl: 1,
                  pr: 1.5,
                  width: "100%",
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    borderColor: "#c0d7e8",
                    borderLeft: "5px solid !important",
                    borderLeftColor: "primary.main !important",
                    color: "primary.dark",
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "action.hover",
                    borderLeftColor: item.active ? "primary.main" : "transparent",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { sx: { flex: "1 1 auto", fontSize: 14, fontWeight: item.active ? 700 : 550 } },
                  }}
                  sx={{ flex: "1 1 auto", minWidth: 0 }}
                />
                {item.badge ? (
                  <Box
                    component="span"
                    sx={{
                      bgcolor: item.active ? "primary.main" : "action.selected",
                      borderRadius: 999,
                      color: item.active ? "primary.contrastText" : "text.primary",
                      fontSize: 11,
                      fontWeight: 700,
                      mr: item.submenu ? 1 : 0,
                      px: 1,
                      py: 0.2,
                    }}
                  >
                    {item.badge}
                  </Box>
                ) : null}
                {item.submenu ? (
                  <ChevronRight
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.8}
                    style={{
                      flexShrink: 0,
                      marginLeft: "auto",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 150ms ease",
                    }}
                  />
                ) : (
                  item.trailing
                )}
              </ListItemButton>
              {item.submenu ? (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 2 }}>
                    <InlineNavigation
                      items={item.submenu.items}
                      label={`${item.label} views`}
                      onNavigate={onNavigate}
                    />
                  </Box>
                </Collapse>
              ) : null}
            </Box>
          );
        })}
      </List>
    </Box>
  );
}

function SubmenuPane({
  onBack,
  onNavigate,
  submenu,
}: {
  onBack: () => void;
  onNavigate?: () => void;
  submenu: AppShellNavigationSubmenu;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase());
  const filterItems = (items: AppShellNavigationItem[]) =>
    deferredSearch
      ? items.filter((item) => item.label.toLocaleLowerCase().includes(deferredSearch))
      : items;

  const mainItems = filterItems(submenu.items);
  const sections = submenu.sections
    ?.map((section) => ({ ...section, items: filterItems(section.items) }))
    .filter((section) => section.items.length > 0);

  return (
    <Box
      aria-label={`${submenu.title} menu`}
      component="nav"
      sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
    >
      <Box sx={{ alignItems: "center", display: "flex", gap: 1, minHeight: 48, px: 3, pt: 1 }}>
        <IconButton aria-label="Back to main menu" onClick={onBack} size="small">
          <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.8} />
        </IconButton>
        <Typography component="h2" sx={{ fontWeight: 700 }} variant="body2">
          {submenu.title}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
        {submenu.searchPlaceholder ? (
          <Box sx={{ mb: 2, px: 1, pt: 1 }}>
            <TextField
              aria-label={submenu.searchPlaceholder}
              fullWidth
              onChange={(event) => setSearch(event.target.value)}
              placeholder={submenu.searchPlaceholder}
              size="small"
              slotProps={{
                htmlInput: { "aria-label": submenu.searchPlaceholder },
                input: {
                  startAdornment: <Search aria-hidden="true" size={17} strokeWidth={1.8} />,
                },
              }}
              value={search}
            />
          </Box>
        ) : null}
        <InlineNavigation
          items={mainItems}
          label={`${submenu.title} views`}
          onNavigate={onNavigate}
        />
        {sections?.map((section) => (
          <Box key={section.title} sx={{ mt: 3 }}>
            <Typography sx={{ fontWeight: 700, px: 1 }} variant="caption">
              {section.title}
            </Typography>
            <InlineNavigation
              items={section.items}
              label={`${section.title} filters`}
              onNavigate={onNavigate}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function AppShellSidebar({
  brand,
  isCollapsed = false,
  navigation,
  onNavigate,
  onToggleCollapse,
  projectNavigation,
  projectScope,
  sidebarFooter,
}: Pick<
  AppShellProps,
  | "brand"
  | "isCollapsed"
  | "navigation"
  | "onToggleCollapse"
  | "projectNavigation"
  | "projectScope"
  | "sidebarFooter"
> & {
  onNavigate?: () => void;
}) {
  const [submenu, setSubmenu] = useState<AppShellNavigationSubmenu | null>(null);

  // If sidebar is collapsed, close submenu pane to maintain clean icon strip
  const activeSubmenu = isCollapsed ? null : submenu;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand Header: Always visible with top collapse toggle */}
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          gap: isCollapsed ? 0 : 1.5,
          justifyContent: isCollapsed ? "center" : "flex-start",
          minHeight: 55,
          px: isCollapsed ? 1 : 2.5,
        }}
      >
        {!isCollapsed ? (
          <>
            <Box
              aria-hidden="true"
              sx={{
                alignItems: "center",
                bgcolor: "primary.main",
                borderRadius: 1,
                color: "primary.contrastText",
                display: "flex",
                fontSize: 13,
                fontWeight: 800,
                height: 34,
                justifyContent: "center",
                letterSpacing: 0,
                width: 34,
              }}
            >
              NS
            </Box>
            <Typography component="span" sx={{ fontWeight: 700 }} variant="subtitle1">
              {brand}
            </Typography>
            {onToggleCollapse ? (
              <Tooltip arrow placement="bottom" title="Collapse sidebar">
                <IconButton
                  aria-label="Collapse sidebar"
                  onClick={onToggleCollapse}
                  size="small"
                  sx={{
                    display: { md: "inline-flex", xs: "none" },
                    ml: "auto",
                  }}
                >
                  <ChevronLeft aria-hidden="true" size={18} strokeWidth={2} />
                </IconButton>
              </Tooltip>
            ) : null}
            {onNavigate ? (
              <IconButton
                aria-label="Close navigation"
                onClick={onNavigate}
                size="small"
                sx={{ display: { md: "none", xs: "inline-flex" }, ml: "auto" }}
              >
                <X aria-hidden="true" size={20} strokeWidth={1.8} />
              </IconButton>
            ) : null}
          </>
        ) : (
          <Tooltip arrow placement="right" title="Expand sidebar">
            <IconButton
              aria-label="Expand sidebar"
              onClick={onToggleCollapse}
              size="small"
              sx={{
                bgcolor: "action.hover",
                borderRadius: 1,
                height: 36,
                width: 36,
              }}
            >
              <ChevronRight aria-hidden="true" size={20} strokeWidth={2} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider />
      {projectScope && !isCollapsed ? <Box sx={{ px: 3, py: 2 }}>{projectScope}</Box> : null}

      {activeSubmenu ? (
        <SubmenuPane onBack={() => setSubmenu(null)} onNavigate={onNavigate} submenu={activeSubmenu} />
      ) : (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Navigation
            isCollapsed={isCollapsed}
            items={navigation}
            label="Primary navigation"
            onNavigate={onNavigate}
            onOpenSubmenu={setSubmenu}
          />
          {projectNavigation && projectNavigation.length > 0 ? (
            <>
              <Divider sx={{ my: 1 }} />
              <Navigation
                isCollapsed={isCollapsed}
                items={projectNavigation}
                label="Project navigation"
                onNavigate={onNavigate}
                title="Project"
              />
            </>
          ) : null}
        </Box>
      )}

      {sidebarFooter && !activeSubmenu && !isCollapsed ? (
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: "auto", p: 4 }}>{sidebarFooter}</Box>
      ) : null}
    </Box>
  );
}
