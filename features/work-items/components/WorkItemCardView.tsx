"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Calendar, Info } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import type { WorkItemListItem } from "../types";
import { WorkItemContextMenu } from "./WorkItemContextMenu";

interface WorkItemCardViewProps {
  items: WorkItemListItem[];
  onCopyWorkItem?: (item: WorkItemListItem) => void;
  onDeleteWorkItem?: (item: WorkItemListItem) => void;
  onReminderWorkItem?: (item: WorkItemListItem) => void;
  onSelectWorkItem: (item: WorkItemListItem) => void;
  onShareWorkItem?: (item: WorkItemListItem) => void;
  projectId: string;
  selectedWorkItemId?: string | null;
}

function getStatusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("closed") || s.includes("done") || s.includes("resolved")) {
    return {
      bg: "rgba(46, 125, 50, 0.08)",
      border: "rgba(46, 125, 50, 0.2)",
      color: "#2e7d32",
      highlight: "#2e7d32",
    };
  }
  if (s.includes("progress") || s.includes("review")) {
    return {
      bg: "rgba(237, 108, 2, 0.08)",
      border: "rgba(237, 108, 2, 0.2)",
      color: "#ed6c02",
      highlight: "#ed6c02",
    };
  }
  return {
    bg: "rgba(2, 136, 209, 0.08)",
    border: "rgba(2, 136, 209, 0.2)",
    color: "#0288d1",
    highlight: "#0288d1",
  };
}

function formatCardDate(isoDate: string) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function WorkItemSingleCard({
  item,
  onCopy,
  onDelete,
  onReminder,
  onSelect,
  onShare,
  projectId,
  isSelected,
}: {
  isSelected?: boolean;
  item: WorkItemListItem;
  onCopy?: () => void;
  onDelete?: () => void;
  onReminder?: () => void;
  onSelect: () => void;
  onShare?: () => void;
  projectId: string;
}) {
  const tone = getStatusTone(item.status);
  const formattedDate = formatCardDate(item.updatedAt);

  return (
    <Box
      aria-label={`Card #${item.id}: ${item.subject}`}
      className="op-wp-single-card group"
      data-selected={isSelected}
      data-test-selector="op-wp-single-card"
      onClick={onSelect}
      role="article"
      sx={{
        bgcolor: isSelected ? "action.selected" : "background.paper",
        border: "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 2,
        position: "relative",
        transition: "all 0.15s ease-in-out",
        "&:hover": {
          boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
          borderColor: "primary.light",
        },
      }}
      tabIndex={0}
    >
      {/* Top highlight strip */}
      <Box
        aria-hidden="true"
        sx={{
          bgcolor: tone.highlight,
          borderRadius: "4px 4px 0 0",
          height: 3,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      {/* Top row: Type / ID / Status */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip
            label="TASK"
            size="small"
            sx={{
              bgcolor: "grey.100",
              color: "text.secondary",
              fontSize: "0.6875rem",
              fontWeight: 700,
              height: 20,
              letterSpacing: "0.04em",
            }}
          />
          <Typography
            component={Link}
            href={`/projects/${projectId}/work-items/${item.id}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline", color: "primary.main" },
            }}
          >
            #{item.id}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Chip
            label={item.status}
            size="small"
            sx={{
              bgcolor: tone.bg,
              border: `1px solid ${tone.border}`,
              color: tone.color,
              fontSize: "0.6875rem",
              fontWeight: 600,
              height: 20,
            }}
          />
          <WorkItemContextMenu
            onCopy={onCopy}
            onDelete={onDelete}
            onOpenDetails={onSelect}
            onReminder={onReminder}
            onShare={onShare}
            workItemId={item.id}
          />
        </Stack>
      </Stack>

      {/* Subject */}
      <Typography
        className="op-wp-single-card--content-subject"
        data-test-selector="op-wp-single-card--content-subject"
        sx={{
          color: "text.primary",
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {item.subject}
      </Typography>

      {/* Bottom row: Assignee avatar & Dates & Action icons */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Avatar
            alt="Assignee"
            sx={{
              bgcolor: "primary.main",
              fontSize: "0.6875rem",
              fontWeight: 700,
              height: 22,
              width: 22,
            }}
          >
            {item.subject.slice(0, 1).toUpperCase()}
          </Avatar>

          {formattedDate ? (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary", fontSize: "0.75rem" }}>
              <Calendar aria-hidden="true" size={13} />
              <span>{formattedDate}</span>
            </Stack>
          ) : null}
        </Stack>

        <Button
          aria-label={`Open details for #${item.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          size="small"
          startIcon={<Info aria-hidden="true" size={14} />}
          sx={{ minWidth: "auto", p: 0.5 }}
          type="button"
          variant="text"
        />
      </Stack>
    </Box>
  );
}

export function WorkItemCardView({
  items,
  onCopyWorkItem,
  onDeleteWorkItem,
  onReminderWorkItem,
  onSelectWorkItem,
  onShareWorkItem,
  projectId,
  selectedWorkItemId,
}: WorkItemCardViewProps) {
  return (
    <Box
      aria-label="Work packages card view"
      className="op-wp-card-view"
      data-test-selector="op-wp-card-view"
      role="region"
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
        },
        py: 1,
      }}
    >
      {items.map((item) => (
        <WorkItemSingleCard
          isSelected={selectedWorkItemId === item.id}
          item={item}
          key={item.id}
          onCopy={onCopyWorkItem ? () => onCopyWorkItem(item) : undefined}
          onDelete={onDeleteWorkItem ? () => onDeleteWorkItem(item) : undefined}
          onReminder={onReminderWorkItem ? () => onReminderWorkItem(item) : undefined}
          onSelect={() => onSelectWorkItem(item)}
          onShare={onShareWorkItem ? () => onShareWorkItem(item) : undefined}
          projectId={projectId}
        />
      ))}
    </Box>
  );
}
