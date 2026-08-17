"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Check, Copy, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export interface SharedUser {
  email: string;
  id: string;
  name: string;
  role: "comment" | "edit" | "view";
}

interface WorkItemShareModalProps {
  onClose: () => void;
  open: boolean;
  projectId: string;
  workItemId: string;
  workItemSubject?: string;
}

const defaultSharedUsers: SharedUser[] = [
  { email: "morgan.tate@example.com", id: "u-1", name: "Morgan Tate", role: "edit" },
  { email: "dana.chen@example.com", id: "u-2", name: "Dana Chen", role: "comment" },
];

export function WorkItemShareModal({
  onClose,
  open,
  projectId,
  workItemId,
  workItemSubject = "Work Package",
}: WorkItemShareModalProps) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"comment" | "edit" | "view">("view");
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(defaultSharedUsers);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/projects/${projectId}/work-items/${workItemId}`
    : `/projects/${projectId}/work-items/${workItemId}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopied(true);
    success("Work package link copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = () => {
    const email = inviteEmail.trim();
    if (!email) return;

    const newUser: SharedUser = {
      email,
      id: `u-${Date.now()}`,
      name: email.split("@")[0] || email,
      role: inviteRole,
    };

    setSharedUsers((prev) => [...prev, newUser]);
    setInviteEmail("");
    success(`Shared #${workItemId} with ${email}.`);
  };

  const handleRemoveMember = (userId: string) => {
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <Modal
      actions={
        <Button onClick={onClose} variant="solid">
          Done
        </Button>
      }
      onClose={onClose}
      open={open}
      title={`Share #${workItemId}: ${workItemSubject}`}
    >
      <Stack spacing={3}>
        <Box>
          <Typography color="text.secondary" sx={{ mb: 1 }} variant="caption">
            Direct link
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              slotProps={{ htmlInput: { "aria-label": "Shareable link", readOnly: true } }}
              value={shareUrl}
            />
            <Button
              onClick={handleCopyLink}
              startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
              variant="outline"
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }} variant="subtitle2">
            Invite members or collaborators
          </Typography>
          <Stack direction={{ sm: "row" }} spacing={1}>
            <TextField
              fullWidth
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address..."
              size="small"
              slotProps={{ htmlInput: { "aria-label": "Member email address" } }}
              value={inviteEmail}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="share-role-label">Permission</InputLabel>
              <Select
                label="Permission"
                labelId="share-role-label"
                onChange={(e) => setInviteRole(e.target.value as "comment" | "edit" | "view")}
                value={inviteRole}
              >
                <MenuItem value="view">Can view</MenuItem>
                <MenuItem value="comment">Can comment</MenuItem>
                <MenuItem value="edit">Can edit</MenuItem>
              </Select>
            </FormControl>
            <Button
              disabled={!inviteEmail.trim()}
              onClick={handleAddMember}
              startIcon={<UserPlus size={16} />}
            >
              Invite
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography color="text.secondary" sx={{ mb: 1 }} variant="caption">
            People with access ({sharedUsers.length})
          </Typography>
          <Stack divider={<Divider />} spacing={1.5}>
            {sharedUsers.map((user) => (
              <Stack
                direction="row"
                key={user.id}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{user.name}</Typography>
                  <Typography color="text.secondary" variant="caption">
                    {user.email}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Chip
                    label={user.role === "edit" ? "Can edit" : user.role === "comment" ? "Can comment" : "Can view"}
                    size="small"
                    variant="outlined"
                  />
                  <IconButton
                    aria-label={`Remove access for ${user.name}`}
                    onClick={() => handleRemoveMember(user.id)}
                    size="small"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
}
