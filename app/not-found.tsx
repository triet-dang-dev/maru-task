import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--mui-palette-background-default)] px-4 py-12 text-[var(--mui-palette-text-primary)] sm:px-6">
      <Paper className="w-full max-w-xl p-6 sm:p-8" component="section" variant="outlined">
        <Typography color="primary.main" sx={{ fontWeight: 750 }} variant="body2">
          Error 404
        </Typography>
        <Typography component="h1" sx={{ mt: 2 }} variant="h2">
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 6, mt: 3 }} variant="body1">
          The route does not exist in this boilerplate. Return home to continue building from a
          known state.
        </Typography>
        <Button href="/">Back home</Button>
      </Paper>
    </main>
  );
}
