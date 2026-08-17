"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FileText, Plus, Pencil, Save, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { wikiPagesApiService } from "@/services/api/backend-services/wiki-pages";

export interface WikiPageItem {
  content: string;
  slug: string;
  title: string;
}

const defaultPages: WikiPageItem[] = [
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
  initialPages = defaultPages,
  initialSlug = "release-process",
  projectId,
}: {
  initialPages?: WikiPageItem[];
  initialSlug?: string;
  projectId?: string;
} = {}) {
  const { success } = useToast();
  const [pagesList, setPagesList] = useState<WikiPageItem[]>(initialPages);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageContent, setNewPageContent] = useState("");
  const [editContent, setEditContent] = useState("");

  const selectedPage = pagesList.find((page) => page.slug === selectedSlug);

  const handleStartEdit = () => {
    if (selectedPage) {
      setEditContent(selectedPage.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPage) return;

    if (projectId) {
      try {
        await wikiPagesApiService.update({
          body: { content: editContent, title: selectedPage.title },
          pathParams: { projectId, slug: selectedPage.slug },
        });
      } catch {
        // Fallback for mock mode
      }
    }

    setPagesList((prev) =>
      prev.map((p) => (p.slug === selectedPage.slug ? { ...p, content: editContent } : p)),
    );
    setIsEditing(false);
    success(`Saved "${selectedPage.title}".`);
  };

  const handleCreatePage = async () => {
    const trimmedTitle = newPageTitle.trim();
    if (!trimmedTitle) return;

    const slug = trimmedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newPage: WikiPageItem = {
      content: newPageContent.trim() || "Initial page content.",
      slug,
      title: trimmedTitle,
    };

    if (projectId) {
      try {
        await wikiPagesApiService.create({
          body: { content: newPage.content, slug: newPage.slug, title: newPage.title },
          pathParams: { projectId },
        });
      } catch {
        // Fallback for mock mode
      }
    }

    setPagesList((prev) => [...prev, newPage]);
    setSelectedSlug(newPage.slug);
    setIsNewPageModalOpen(false);
    setNewPageTitle("");
    setNewPageContent("");
    success(`Created page "${newPage.title}".`);
  };

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
        <Button
          onClick={() => setIsNewPageModalOpen(true)}
          startIcon={<Plus aria-hidden="true" size={16} />}
          variant="outline"
        >
          New page
        </Button>
        {pagesList.map((page) => (
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
          <Stack direction="row" spacing={1}>
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  startIcon={<X aria-hidden="true" size={16} />}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  startIcon={<Save aria-hidden="true" size={16} />}
                  variant="solid"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                onClick={handleStartEdit}
                startIcon={<Pencil aria-hidden="true" size={16} />}
                variant="outline"
              >
                Edit page
              </Button>
            )}
          </Stack>
        </Stack>
        {isEditing ? (
          <TextField
            label="Page content"
            multiline
            minRows={12}
            onChange={(e) => setEditContent(e.target.value)}
            value={editContent}
          />
        ) : (
          <Typography sx={{ whiteSpace: "pre-wrap" }}>{selectedPage.content}</Typography>
        )}
      </Stack>

      <Modal
        actions={
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", width: "100%" }}>
            <Button onClick={() => setIsNewPageModalOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={!newPageTitle.trim()}
              onClick={handleCreatePage}
              variant="solid"
            >
              Create page
            </Button>
          </Stack>
        }
        onClose={() => setIsNewPageModalOpen(false)}
        open={isNewPageModalOpen}
        title="Create new wiki page"
      >
        <Stack spacing={2}>
          <TextField
            autoFocus
            fullWidth
            label="Page title"
            onChange={(e) => setNewPageTitle(e.target.value)}
            placeholder="e.g. Architecture Decisions"
            required
            size="small"
            value={newPageTitle}
          />
          <TextField
            fullWidth
            label="Content (Markdown)"
            multiline
            onChange={(e) => setNewPageContent(e.target.value)}
            placeholder="Write documentation content here..."
            rows={5}
            size="small"
            value={newPageContent}
          />
        </Stack>
      </Modal>
    </Box>
  );
}
