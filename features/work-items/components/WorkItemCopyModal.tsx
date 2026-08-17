"use client";

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface WorkItemCopyModalProps {
  onClose: () => void;
  onCopy?: (copyPayload: {
    copyAttachments: boolean;
    copyRelations: boolean;
    copySubtasks: boolean;
    copyWatchers: boolean;
    subject: string;
    targetProjectId: string;
  }) => void;
  open: boolean;
  projectId: string;
  workItemId: string;
  workItemSubject?: string;
}

export function WorkItemCopyModal({
  onClose,
  onCopy,
  open,
  projectId,
  workItemId,
  workItemSubject = "Work Package",
}: WorkItemCopyModalProps) {
  const { success } = useToast();
  const [targetProjectId, setTargetProjectId] = useState<string>(projectId);
  const [subject, setSubject] = useState<string>(`Copy of ${workItemSubject}`);
  const [copyAttachments, setCopyAttachments] = useState<boolean>(true);
  const [copyWatchers, setCopyWatchers] = useState<boolean>(true);
  const [copySubtasks, setCopySubtasks] = useState<boolean>(false);
  const [copyRelations, setCopyRelations] = useState<boolean>(false);

  const handleDuplicate = () => {
    if (!subject.trim()) return;

    onCopy?.({
      copyAttachments,
      copyRelations,
      copySubtasks,
      copyWatchers,
      subject,
      targetProjectId,
    });

    success(`Duplicated #${workItemId} as "${subject}".`);
    onClose();
  };

  return (
    <Modal
      actions={
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", width: "100%" }}>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={!subject.trim()}
            onClick={handleDuplicate}
            startIcon={<Copy size={16} />}
            variant="solid"
          >
            Duplicate work package
          </Button>
        </Stack>
      }
      onClose={onClose}
      open={open}
      title={`Duplicate #${workItemId}: ${workItemSubject}`}
    >
      <Stack spacing={3}>
        <FormControl fullWidth size="small">
          <InputLabel id="copy-target-project-label">Target project</InputLabel>
          <Select
            label="Target project"
            labelId="copy-target-project-label"
            onChange={(e) => setTargetProjectId(e.target.value)}
            value={targetProjectId}
          >
            <MenuItem value={projectId}>Current project ({projectId})</MenuItem>
            <MenuItem value="demo-project">Demo Project</MenuItem>
            <MenuItem value="client-portal">Client Portal</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="New work package title"
          onChange={(e) => setSubject(e.target.value)}
          required
          size="small"
          value={subject}
        />

        <Stack spacing={1}>
          <Typography color="text.secondary" variant="caption">
            Include in duplicate
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyAttachments}
                  onChange={(e) => setCopyAttachments(e.target.checked)}
                  size="small"
                />
              }
              label="Attachments & files"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyWatchers}
                  onChange={(e) => setCopyWatchers(e.target.checked)}
                  size="small"
                />
              }
              label="Watchers"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={copySubtasks}
                  onChange={(e) => setCopySubtasks(e.target.checked)}
                  size="small"
                />
              }
              label="Sub-tasks & child packages"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyRelations}
                  onChange={(e) => setCopyRelations(e.target.checked)}
                  size="small"
                />
              }
              label="Predecessor & successor relations"
            />
          </FormGroup>
        </Stack>
      </Stack>
    </Modal>
  );
}
