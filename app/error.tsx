"use client";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--mui-palette-background-default)] px-4 py-12 text-[var(--mui-palette-text-primary)] sm:px-6">
      <Paper
        className="flex w-full max-w-xl flex-col items-start gap-6 p-6 sm:p-8"
        component="section"
        variant="outlined"
      >
        <div className="space-y-2">
          <Typography color="primary.main" sx={{ fontWeight: 750 }} variant="body2">
            Recoverable route error
          </Typography>
          <Typography component="h1" variant="h2">
            Something went wrong
          </Typography>
          <Typography color="text.secondary" variant="body1">
            The current route hit a recoverable error. Try again, or return to a stable page.
          </Typography>
          {error.digest ? (
            <Typography className="font-mono text-xs" color="text.secondary" variant="caption">
              Error digest: {error.digest}
            </Typography>
          ) : null}
        </div>

        <Button onClick={reset}>Try again</Button>
      </Paper>
    </main>
  );
}
