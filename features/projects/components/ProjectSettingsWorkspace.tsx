"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";

const members = [
  { active: true, id: "member-1", name: "Dana Chen", role: "Project manager" },
  { active: true, id: "member-2", name: "Riley Park", role: "Developer" },
  { active: false, id: "member-3", name: "Morgan Tate", role: "Viewer" },
];

export function ProjectSettingsWorkspace() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<(typeof members)[number] | null>(null);
  const [disableKeyboardShortcuts, setDisableKeyboardShortcuts] = useState(false);
  const [autoHidePopups, setAutoHidePopups] = useState(true);
  const [warnOnLeavingUnsaved, setWarnOnLeavingUnsaved] = useState(true);

  return (
    <Stack spacing={6}>
      <Box>
        <Stack
          direction={{ sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 3 }}
        >
          <Box>
            <Typography component="h1" variant="h1">
              Project settings
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Manage project access and personal workspace preferences.
            </Typography>
          </Box>
          <Button
            onClick={() => setIsInviteOpen(true)}
            startIcon={<UserPlus aria-hidden="true" size={16} />}
          >
            Invite member
          </Button>
        </Stack>
        <Typography component="h2" sx={{ fontWeight: 700, mb: 2 }} variant="h3">
          Members
        </Typography>
        <table aria-label="Project members" className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--mui-palette-divider)] text-xs">
              <th className="py-2">Member</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr className="border-b border-[var(--mui-palette-divider)]" key={member.id}>
                <td className="py-3 text-sm">{member.name}</td>
                <td className="py-3 text-sm">{member.role}</td>
                <td className="py-3">
                  <Chip
                    color={member.active ? "success" : "default"}
                    label={member.active ? "Active" : "Inactive"}
                    size="small"
                  />
                </td>
                <td className="py-3 text-right">
                  <IconButton
                    aria-label={`Remove ${member.name}`}
                    onClick={() => setMemberToRemove(member)}
                    size="small"
                  >
                    ×
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <Box>
        <Typography component="h2" sx={{ fontWeight: 700, mb: 2 }} variant="h3">
          Preferences
        </Typography>
        <Stack spacing={1}>
          <label>
            <Switch
              checked={disableKeyboardShortcuts}
              onChange={(_, checked) => setDisableKeyboardShortcuts(checked)}
            />
            Disable keyboard shortcuts
          </label>
          <label>
            <Switch
              checked={autoHidePopups}
              onChange={(_, checked) => setAutoHidePopups(checked)}
            />
            Auto-hide popups
          </label>
          <label>
            <Switch
              checked={warnOnLeavingUnsaved}
              onChange={(_, checked) => setWarnOnLeavingUnsaved(checked)}
            />
            Warn before leaving unsaved changes
          </label>
        </Stack>
      </Box>
      <Modal
        actions={
          <>
            <Button onClick={() => setIsInviteOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={() => setIsInviteOpen(false)}>Send invitation</Button>
          </>
        }
        onClose={() => setIsInviteOpen(false)}
        open={isInviteOpen}
        title="Invite member"
      >
        <TextField fullWidth label="Email address" type="email" />
      </Modal>
      <ConfirmDialog
        description={`Remove ${memberToRemove?.name ?? "this member"} from the project?`}
        intent="destructive"
        onCancel={() => setMemberToRemove(null)}
        onConfirm={() => setMemberToRemove(null)}
        open={Boolean(memberToRemove)}
        title="Remove member?"
      />
    </Stack>
  );
}
