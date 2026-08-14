import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { designTokens } from "@/theme/tokens";

const metrics = [
  { detail: "AA contrast target", label: "Accessibility", value: "WCAG 2.1" },
  { detail: "Mobile first", label: "Layout", value: "4 breakpoints" },
  { detail: "Semantic aliases", label: "Color system", value: "11 steps" },
  { detail: "Base unit", label: "Spacing", value: "4 px" },
];

const swatches = [
  { color: designTokens.color.brand[50], label: "50" },
  { color: designTokens.color.brand[200], label: "200" },
  { color: designTokens.color.brand[400], label: "400" },
  { color: designTokens.color.brand[600], label: "600" },
  { color: designTokens.color.brand[900], label: "900" },
];

export function DashboardOverview() {
  return (
    <Stack component="section" id="foundation" spacing={10}>
      <Paper variant="outlined">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          {metrics.map((metric, index) => (
            <Box
              key={metric.label}
              sx={{
                borderBottom: { xs: index < 2 ? 1 : 0, lg: 0 },
                borderColor: "divider",
                borderRight: {
                  xs: index % 2 === 0 ? 1 : 0,
                  lg: index < metrics.length - 1 ? 1 : 0,
                },
                p: { xs: 5, sm: 6 },
              }}
            >
              <Typography color="text.secondary" variant="caption">
                {metric.label}
              </Typography>
              <Typography component="p" sx={{ mt: 2 }} variant="h3">
                {metric.value}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                {metric.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Box>
        <Box sx={{ maxWidth: 680 }}>
          <Typography component="h2" variant="h2">
            Design system foundation
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 3 }} variant="body1">
            One restrained teal accent, a cool neutral scale, deterministic type hierarchy, and
            component states shared through MUI theme tokens.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 6,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(300px, 0.65fr)" },
            mt: 7,
          }}
        >
          <Paper sx={{ p: { xs: 6, sm: 8 } }} variant="outlined">
            <Typography component="h3" variant="h4">
              Color & component states
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
              Brand color is reserved for navigation, focus, and primary actions. Feedback colors
              remain semantic.
            </Typography>

            <Box
              aria-label="Brand color scale"
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                mt: 6,
                overflow: "hidden",
                borderRadius: 3,
              }}
            >
              {swatches.map((swatch) => (
                <Box
                  key={swatch.label}
                  sx={{
                    bgcolor: swatch.color,
                    color: Number(swatch.label) >= 600 ? "#ffffff" : "#0f172a",
                    minHeight: 88,
                    p: 3,
                  }}
                >
                  <Typography component="span" sx={{ fontSize: 11, fontWeight: 750 }}>
                    {swatch.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 7 }} />
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 2 }}>
              <Button size="small">Primary</Button>
              <Button size="small" variant="outline">
                Secondary
              </Button>
              <Button size="small" variant="ghost">
                Ghost
              </Button>
              <StatusChip label="Active" tone="success" />
              <StatusChip label="Needs review" tone="warning" />
            </Stack>
            <Alert severity="info" sx={{ mt: 6 }}>
              Focus, hover, active, disabled, loading, empty, and error states are defined as
              first-class patterns.
            </Alert>
          </Paper>

          <Paper sx={{ p: { xs: 6, sm: 8 } }} variant="outlined">
            <Typography component="h3" variant="h4">
              Typography
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
              Avenir Next with stable system fallbacks keeps the starter fast and avoids runtime
              font downloads.
            </Typography>
            <Stack divider={<Divider flexItem />} spacing={5} sx={{ mt: 7 }}>
              <Box>
                <Typography color="text.secondary" variant="caption">
                  Display / 64
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 34, sm: 42 },
                    fontWeight: 700,
                    letterSpacing: "-0.045em",
                    lineHeight: 1.05,
                  }}
                >
                  Build clearly.
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="caption">
                  Heading / 24
                </Typography>
                <Typography variant="h3">Reusable by default</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="caption">
                  Body / 16
                </Typography>
                <Typography color="text.secondary" variant="body1">
                  Interfaces stay readable across dense enterprise workflows and narrow screens.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
}
