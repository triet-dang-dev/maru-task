"use client";

import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Play, Square } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";

interface WorkItemTimerButtonProps {
  onTimeLogged?: (elapsedSeconds: number) => void;
  size?: "medium" | "small";
  workItemId: string;
  workItemSubject?: string;
}

export function WorkItemTimerButton({
  onTimeLogged,
  size = "small",
  workItemId,
  workItemSubject = "Work Package",
}: WorkItemTimerButtonProps) {
  const { success } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      onTimeLogged?.(elapsedSeconds);
      const spentTime = formatTime(elapsedSeconds);
      success(`Recorded ${spentTime} spent on #${workItemId}: ${workItemSubject}.`);
      setElapsedSeconds(0);
    } else {
      setIsRunning(true);
      setElapsedSeconds(0);
    }
  };

  if (isRunning) {
    return (
      <Tooltip title="Stop timer & log time">
        <MuiButton
          aria-label={`Stop timer for #${workItemId}`}
          className="op-wp-timer-button op-wp-timer-button--active"
          color="error"
          onClick={handleToggleTimer}
          size={size}
          startIcon={<Square aria-hidden="true" fill="currentColor" size={12} />}
          sx={{
            animation: "pulse 1.5s infinite",
            bgcolor: "error.main",
            borderRadius: 1,
            color: "white",
            fontWeight: 700,
            px: 1.5,
            textTransform: "none",
            "&:hover": { bgcolor: "error.dark" },
          }}
          variant="contained"
        >
          <Typography sx={{ fontSize: size === "small" ? "0.75rem" : "0.875rem", fontWeight: 700 }}>
            {formatTime(elapsedSeconds)}
          </Typography>
        </MuiButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Start timer">
      <MuiButton
        aria-label={`Start timer for #${workItemId}`}
        className="op-wp-timer-button"
        color="inherit"
        onClick={handleToggleTimer}
        size={size}
        startIcon={<Play aria-hidden="true" fill="currentColor" size={12} />}
        sx={{
          borderColor: "divider",
          borderRadius: 1,
          color: "text.secondary",
          fontSize: size === "small" ? "0.75rem" : "0.875rem",
          fontWeight: 600,
          textTransform: "none",
          "&:hover": { borderColor: "primary.main", color: "primary.main" },
        }}
        variant="outlined"
      >
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          Timer
        </Box>
      </MuiButton>
    </Tooltip>
  );
}
