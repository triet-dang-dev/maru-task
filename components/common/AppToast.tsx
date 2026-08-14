"use client";

import toast, { Toaster, type ToastOptions } from "react-hot-toast";

export function AppToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          "rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm",
        duration: 4000,
      }}
    />
  );
}

export const appToast = {
  dismiss: toast.dismiss,
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
};
