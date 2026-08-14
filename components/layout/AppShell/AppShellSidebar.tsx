import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { AppShellNavigationItem, AppShellNavigationSubmenu, AppShellProps } from "./types";

function Navigation({
  items,
  label,
  onNavigate,
  onOpenSubmenu,
  title,
}: {
  items: AppShellNavigationItem[];
  label: string;
  onNavigate?: () => void;
  onOpenSubmenu?: (submenu: AppShellNavigationSubmenu) => void;
  title?: string;
}) {
  return (
    <Box aria-label={label} component="nav" sx={{ px: 3, py: 3 }}>
      {title ? (
        <Typography color="text.secondary" sx={{ fontWeight: 700, mb: 1, px: 3 }} variant="caption">
          {title}
        </Typography>
      ) : null}
      <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
        {items.map((item) => (
          <ListItemButton
            aria-current={item.active ? "page" : undefined}
            aria-label={item.submenu ? `Open ${item.label} menu` : undefined}
            component={item.submenu ? "button" : Link}
            href={item.submenu ? undefined : item.href}
            key={item.href}
            onClick={item.submenu ? () => onOpenSubmenu?.(item.submenu!) : onNavigate}
            selected={item.active}
            sx={{
              border: "1px solid transparent",
              borderRadius: 1,
              minHeight: 36,
              px: 3,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                color: "primary.dark",
                "& .MuiListItemIcon-root": { color: "primary.dark" },
              },
            }}
          >
            {item.icon ? (
              <ListItemIcon sx={{ color: "text.secondary", minWidth: 32 }}>
                {item.icon}
              </ListItemIcon>
            ) : null}
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: 14, fontWeight: item.active ? 700 : 550 } } }}
            />
            {item.submenu ? (
              <ChevronRight aria-hidden="true" size={17} strokeWidth={1.8} />
            ) : (
              item.trailing
            )}
          </ListItemButton>
        ))}
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
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Box sx={{ alignItems: "center", display: "flex", gap: 1, minHeight: 55, px: 3 }}>
        <IconButton aria-label="Back to main menu" onClick={onBack} size="small">
          <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.8} />
        </IconButton>
        <Typography component="h2" variant="body2">
          {submenu.title}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflowY: "auto", px: 3, py: 3 }}>
        {submenu.searchPlaceholder ? (
          <TextField
            aria-label={submenu.searchPlaceholder}
            fullWidth
            onChange={(event) => setSearch(event.target.value)}
            placeholder={submenu.searchPlaceholder}
            size="small"
            slotProps={{
              htmlInput: { "aria-label": submenu.searchPlaceholder },
              input: { startAdornment: <Search aria-hidden="true" size={17} strokeWidth={1.8} /> },
            }}
            value={search}
          />
        ) : null}
        <Navigation items={mainItems} label={`${submenu.title} views`} onNavigate={onNavigate} />
        {sections?.map((section) => (
          <Box key={section.title} sx={{ mt: 3 }}>
            <Typography sx={{ fontWeight: 700, px: 3 }} variant="caption">
              {section.title}
            </Typography>
            <Navigation
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
  navigation,
  onNavigate,
  projectNavigation,
  sidebarFooter,
}: Pick<AppShellProps, "brand" | "navigation" | "projectNavigation" | "sidebarFooter"> & {
  onNavigate?: () => void;
}) {
  const [submenu, setSubmenu] = useState<AppShellNavigationSubmenu | null>(null);

  if (submenu) {
    return (
      <SubmenuPane onBack={() => setSubmenu(null)} onNavigate={onNavigate} submenu={submenu} />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ alignItems: "center", display: "flex", gap: 2, minHeight: 55, px: 3 }}>
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
        <Typography component="span" variant="subtitle1">
          {brand}
        </Typography>
        {onNavigate ? (
          <IconButton aria-label="Close navigation" onClick={onNavigate} sx={{ ml: "auto" }}>
            <X aria-hidden="true" size={20} strokeWidth={1.8} />
          </IconButton>
        ) : null}
      </Box>
      <Divider />
      <Navigation
        items={navigation}
        label="Primary navigation"
        onNavigate={onNavigate}
        onOpenSubmenu={setSubmenu}
      />
      {projectNavigation && projectNavigation.length > 0 ? (
        <>
          <Divider />
          <Navigation
            items={projectNavigation}
            label="Project navigation"
            onNavigate={onNavigate}
            title="Project"
          />
        </>
      ) : null}
      {sidebarFooter ? (
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: "auto", p: 4 }}>{sidebarFooter}</Box>
      ) : null}
    </Box>
  );
}
