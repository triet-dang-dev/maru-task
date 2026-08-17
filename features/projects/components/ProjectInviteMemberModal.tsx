"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface ProjectInviteMemberModalProps {
  onClose: () => void;
  onInvite: (member: { email: string; message?: string; role: string }) => void;
  open: boolean;
}

export function ProjectInviteMemberModal({
  onClose,
  onInvite,
  open,
}: ProjectInviteMemberModalProps) {
  const { success } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSend = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Please enter an email address.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    onInvite({ email: trimmedEmail, message: message.trim(), role });
    success(`Invitation sent to ${trimmedEmail} as ${role}.`);
    setEmail("");
    setMessage("");
    setEmailError("");
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
            disabled={!email.trim()}
            onClick={handleSend}
            startIcon={<Send size={16} />}
            variant="solid"
          >
            Send invitation
          </Button>
        </Stack>
      }
      onClose={onClose}
      open={open}
      title="Invite member"
    >
      <Stack spacing={2.5}>
        <Typography color="text.secondary" variant="body2">
          The invited user will receive an email with instructions to access this project.
        </Typography>

        <TextField
          autoFocus
          error={Boolean(emailError)}
          fullWidth
          helperText={emailError}
          label="Email address"
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          placeholder="name@organization.com"
          required
          size="small"
          slotProps={{ htmlInput: { "aria-label": "Email address" } }}
          type="email"
          value={email}
        />

        <FormControl fullWidth size="small">
          <InputLabel id="invite-role-label">Project role</InputLabel>
          <Select
            label="Project role"
            labelId="invite-role-label"
            onChange={(e) => setRole(e.target.value)}
            value={role}
          >
            <MenuItem value="Project manager">Project manager (Full administration)</MenuItem>
            <MenuItem value="Developer">Developer (Manage and edit work packages)</MenuItem>
            <MenuItem value="Viewer">Viewer (Read-only access)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Personal invitation message (optional)"
          multiline
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a welcoming note..."
          rows={3}
          size="small"
          value={message}
        />
      </Stack>
    </Modal>
  );
}
