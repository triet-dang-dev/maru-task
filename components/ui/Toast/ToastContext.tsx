"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MuiButton from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ToastTone = "error" | "info" | "success" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  action?: ToastAction;
  durationMs?: number;
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  dismiss: (id: string) => void;
  error: (message: string, action?: ToastAction) => string;
  info: (message: string, action?: ToastAction) => string;
  showToast: (options: Omit<ToastItem, "id">) => string;
  success: (message: string, action?: ToastAction) => string;
  warning: (message: string, action?: ToastAction) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneConfigs = {
  error: {
    border: "#d32f2f",
    icon: <AlertCircle aria-hidden="true" color="#d32f2f" size={18} />,
  },
  info: {
    border: "#0288d1",
    icon: <Info aria-hidden="true" color="#0288d1" size={18} />,
  },
  success: {
    border: "#2e7d32",
    icon: <CheckCircle2 aria-hidden="true" color="#2e7d32" size={18} />,
  },
  warning: {
    border: "#ed6c02",
    icon: <AlertTriangle aria-hidden="true" color="#ed6c02" size={18} />,
  },
};

const fallbackToastValue: ToastContextValue = {
  dismiss: () => {},
  error: () => "",
  info: () => "",
  showToast: () => "",
  success: () => "",
  warning: () => "",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ action, durationMs = 4500, message, tone }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newToast: ToastItem = { action, durationMs, id, message, tone };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismiss(id);
        }, durationMs);
      }

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, action?: ToastAction) => showToast({ action, message, tone: "success" }),
    [showToast],
  );

  const error = useCallback(
    (message: string, action?: ToastAction) => showToast({ action, message, tone: "error" }),
    [showToast],
  );

  const info = useCallback(
    (message: string, action?: ToastAction) => showToast({ action, message, tone: "info" }),
    [showToast],
  );

  const warning = useCallback(
    (message: string, action?: ToastAction) => showToast({ action, message, tone: "warning" }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ dismiss, error, info, showToast, success, warning }}>
      {children}
      {/* OpenProject Toast Container */}
      <Box
        aria-live="polite"
        className="op-toasts-container"
        sx={{
          top: 24,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxWidth: 420,
          pointerEvents: "none",
          position: "fixed",
          right: 24,
          width: "100%",
          zIndex: 2000,
        }}
      >
        {toasts.map((t) => {
          const config = toneConfigs[t.tone] || toneConfigs.info;
          return (
            <Box
              aria-atomic="true"
              className={`op-toast op-toast--${t.tone}`}
              key={t.id}
              role="status"
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderLeft: `4px solid ${config.border}`,
                borderRadius: "4px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                p: 2,
                pointerEvents: "auto",
                transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Box sx={{ flexShrink: 0, mt: 0.25 }}>{config.icon}</Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.4 }} variant="body2">
                    {t.message}
                  </Typography>
                  {t.action ? (
                    <MuiButton
                      onClick={() => {
                        t.action?.onClick();
                        dismiss(t.id);
                      }}
                      size="small"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        mt: 1,
                        p: 0,
                        textTransform: "none",
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      {t.action.label}
                    </MuiButton>
                  ) : null}
                </Box>
                <IconButton
                  aria-label="Dismiss toast"
                  onClick={() => dismiss(t.id)}
                  size="small"
                  sx={{ color: "text.secondary", mt: -0.5, p: 0.5 }}
                >
                  <X aria-hidden="true" size={14} />
                </IconButton>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context ?? fallbackToastValue;
}
