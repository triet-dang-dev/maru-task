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
import { useToast } from "@/components/ui/Toast";
import { projectDocumentsApiService } from "@/services/api/backend-services/project-documents";

export interface ProjectDocumentItem {
  fileName: string;
  id: string;
  size: string;
  status: "Uploaded" | "Uploading";
  uploadedAt: string;
}

interface ProjectDocumentsPanelProps {
  documents?: ProjectDocumentItem[];
  onDeleteDocument?: (documentId: string) => Promise<void> | void;
  onUploadDocument?: (doc: ProjectDocumentItem) => Promise<void> | void;
  projectId?: string;
}

const defaultDocs: ProjectDocumentItem[] = [
  {
    fileName: "release-plan.pdf",
    id: "document-1",
    size: "2 MB",
    status: "Uploaded",
    uploadedAt: "18 minutes ago",
  },
];

export function ProjectDocumentsPanel({
  documents = defaultDocs,
  onDeleteDocument,
  onUploadDocument,
  projectId,
}: ProjectDocumentsPanelProps) {
  const { success } = useToast();
  const [docList, setDocList] = useState<ProjectDocumentItem[]>(documents);
  const [isUploading, setIsUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ProjectDocumentItem | null>(null);

  const handleStartUpload = () => {
    setIsUploading(true);
    onUploadDocument?.({
      fileName: `document-${Date.now().toString().slice(-4)}.pdf`,
      id: `doc-${Date.now()}`,
      size: "1.5 MB",
      status: "Uploaded",
      uploadedAt: "Just now",
    });
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    if (projectId) {
      try {
        await projectDocumentsApiService.delete({
          pathParams: { documentId: documentToDelete.id, projectId },
        });
      } catch {
        // Fallback for mock mode
      }
    }

    if (onDeleteDocument) {
      await onDeleteDocument(documentToDelete.id);
    }

    setDocList((prev) => prev.filter((doc) => doc.id !== documentToDelete.id));
    success(`Deleted ${documentToDelete.fileName}.`);
    setDocumentToDelete(null);
  };

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
          onClick={handleStartUpload}
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
        {docList.map((document) => (
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
        description={`Are you sure you want to delete ${documentToDelete?.fileName ?? "this document"}?`}
        intent="destructive"
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
        open={Boolean(documentToDelete)}
        title="Delete document?"
      />
    </Stack>
  );
}
