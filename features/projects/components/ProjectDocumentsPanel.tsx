"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";

export interface ProjectDocumentItem {
  fileName: string;
  id: string;
  size: string;
  status: "Uploaded" | "Uploading";
  uploadedAt: string;
}

export function ProjectDocumentsPanel({ documents }: { documents: ProjectDocumentItem[] }) {
  const [isUploading, setIsUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ProjectDocumentItem | null>(null);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Box>
          <Typography component="h2" variant="h2">
            Documents
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Files shared with this project.
          </Typography>
        </Box>
        <Button
          onClick={() => setIsUploading(true)}
          startIcon={<Upload aria-hidden="true" size={16} />}
        >
          Upload document
        </Button>
      </Stack>
      {isUploading ? (
        <Box aria-label="Uploading document" role="status">
          <Typography variant="body2">Preparing secure upload...</Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </Box>
      ) : null}
      <Stack
        aria-label="Project documents"
        component="ul"
        spacing={0}
        sx={{ border: 1, borderColor: "divider", borderRadius: 1, listStyle: "none", m: 0, p: 0 }}
      >
        {documents.map((document) => (
          <Stack
            component="li"
            direction={{ sm: "row" }}
            key={document.id}
            spacing={2}
            sx={{
              alignItems: { sm: "center" },
              borderBottom: 1,
              borderColor: "divider",
              justifyContent: "space-between",
              p: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
              <FileText aria-hidden="true" color="var(--mui-palette-primary-main)" size={20} />
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 600 }} variant="body2">
                  {document.fileName}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {document.size} · {document.uploadedAt}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip label={document.status} size="small" variant="outlined" />
              <IconButton aria-label={`Download ${document.fileName}`} size="small">
                <Download aria-hidden="true" size={16} />
              </IconButton>
              <IconButton
                aria-label={`Delete ${document.fileName}`}
                onClick={() => setDocumentToDelete(document)}
                size="small"
              >
                <Trash2 aria-hidden="true" size={16} />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
      <ConfirmDialog
        description={`Delete ${documentToDelete?.fileName ?? "this document"}?`}
        intent="destructive"
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={() => setDocumentToDelete(null)}
        open={Boolean(documentToDelete)}
        title="Delete document?"
      />
    </Stack>
  );
}
