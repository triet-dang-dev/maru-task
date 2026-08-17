"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FileText, Plus, Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";

const pages = [
  {
    content:
      "Follow the release checklist, validate the deployment, then publish the change summary.",
    slug: "release-process",
    title: "Release process",
  },
  {
    content: "Project conventions and decision records are maintained here.",
    slug: "project-handbook",
    title: "Project handbook",
  },
];

export function ProjectWikiWorkspace({
  initialSlug = "release-process",
}: {
  initialSlug?: string;
}) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [isEditing, setIsEditing] = useState(false);
  const selectedPage = pages.find((page) => page.slug === selectedSlug);

  if (!selectedPage) {
    return (
      <EmptyState
        description="Choose another page or create a new one."
        title="Wiki page not found"
      />
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 4,
        gridTemplateColumns: { md: "minmax(13rem, 0.35fr) minmax(0, 1fr)" },
      }}
    >
      <Stack
        aria-label="Wiki pages"
        component="ul"
        spacing={0.5}
        sx={{
          borderRight: { md: 1 },
          borderColor: "divider",
          listStyle: "none",
          m: 0,
          p: { md: 0, xs: 0 },
        }}
      >
        <Button startIcon={<Plus aria-hidden="true" size={16} />} variant="outline">
          New page
        </Button>
        {pages.map((page) => (
          <Button
            aria-current={page.slug === selectedSlug ? "page" : undefined}
            key={page.slug}
            onClick={() => {
              setSelectedSlug(page.slug);
              setIsEditing(false);
            }}
            sx={{ justifyContent: "flex-start" }}
            variant="ghost"
          >
            {page.title}
          </Button>
        ))}
      </Stack>
      <Stack spacing={3}>
        <Stack
          direction={{ sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <FileText aria-hidden="true" size={20} />
            <Typography component="h1" variant="h1">
              {selectedPage.title}
            </Typography>
          </Stack>
          <Button
            onClick={() => setIsEditing((editing) => !editing)}
            startIcon={<Pencil aria-hidden="true" size={16} />}
            variant="outline"
          >
            {isEditing ? "Preview" : "Edit page"}
          </Button>
        </Stack>
        {isEditing ? (
          <TextField
            defaultValue={selectedPage.content}
            label="Page content"
            multiline
            minRows={12}
          />
        ) : (
          <Typography sx={{ whiteSpace: "pre-wrap" }}>{selectedPage.content}</Typography>
        )}
      </Stack>
    </Box>
  );
}
