"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { UserProfilePopover } from "@/components/ui/UserProfilePopover";
import { projectsApiService } from "@/services/api/backend-services/projects";
import { ProjectInviteMemberModal } from "./ProjectInviteMemberModal";
import { ProjectQuerySettings } from "./ProjectQuerySettings";

const initialMembers = [
  { active: true, email: "dana.chen@example.com", id: "member-1", name: "Dana Chen", role: "Project manager" },
  { active: true, email: "riley.park@example.com", id: "member-2", name: "Riley Park", role: "Developer" },
  { active: false, email: "morgan.tate@example.com", id: "member-3", name: "Morgan Tate", role: "Viewer" },
];

export function ProjectSettingsWorkspace({ projectId }: { projectId?: string } = {}) {
  const [membersList, setMembersList] = useState(initialMembers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<(typeof initialMembers)[number] | null>(null);
  const [disableKeyboardShortcuts, setDisableKeyboardShortcuts] = useState(false);
  const [autoHidePopups, setAutoHidePopups] = useState(true);
  const [warnOnLeavingUnsaved, setWarnOnLeavingUnsaved] = useState(true);

  const handleInvite = async (newMember: { email: string; message?: string; role: string }) => {
    if (projectId) {
      try {
        await projectsApiService.addMember({
          body: { email: newMember.email, role: newMember.role },
          pathParams: { projectId },
        });
      } catch {
        // Fallback to local state if backend route is in mock mode or error
      }
    }

    const namePart = newMember.email.split("@")[0] || "User";
    const name = namePart
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    setMembersList((prev) => [
      ...prev,
      {
        active: true,
        email: newMember.email,
        id: `member-${Date.now()}`,
        name,
        role: newMember.role,
      },
    ]);
  };

  const handleRemoveMember = async () => {
    if (memberToRemove) {
      if (projectId) {
        try {
          await projectsApiService.removeMember({
            pathParams: { projectId, userId: memberToRemove.id },
          });
        } catch {
          // Fallback to local state
        }
      }
      setMembersList((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    }
  };

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
              <th className="py-2" scope="col">
                Member
              </th>
              <th className="py-2" scope="col">
                Role
              </th>
              <th className="py-2" scope="col">
                Status
              </th>
              <th className="py-2" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {membersList.map((member) => (
              <tr className="border-b border-[var(--mui-palette-divider)]" key={member.id}>
                <td className="py-3 text-sm">
                  <UserProfilePopover
                    user={{
                      email: member.email,
                      name: member.name,
                      role: member.role,
                    }}
                  >
                    <span className="font-semibold text-slate-800 hover:text-blue-700 hover:underline cursor-pointer">
                      {member.name}
                    </span>
                  </UserProfilePopover>
                </td>
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
              slotProps={{ input: { "aria-label": "Disable keyboard shortcuts" } }}
            />
            Disable keyboard shortcuts
          </label>
          <label>
            <Switch
              checked={autoHidePopups}
              onChange={(_, checked) => setAutoHidePopups(checked)}
              slotProps={{ input: { "aria-label": "Auto-hide popups" } }}
            />
            Auto-hide popups
          </label>
          <label>
            <Switch
              checked={warnOnLeavingUnsaved}
              onChange={(_, checked) => setWarnOnLeavingUnsaved(checked)}
              slotProps={{ input: { "aria-label": "Warn before leaving unsaved changes" } }}
            />
            Warn before leaving unsaved changes
          </label>
        </Stack>
      </Box>
      <ProjectQuerySettings />
      
      <ProjectInviteMemberModal
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
        open={isInviteOpen}
      />

      <ConfirmDialog
        description={`Remove ${memberToRemove?.name ?? "this member"} from the project?`}
        intent="destructive"
        onCancel={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        open={Boolean(memberToRemove)}
        title="Remove member?"
      />
    </Stack>
  );
}
