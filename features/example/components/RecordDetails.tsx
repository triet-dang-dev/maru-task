import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { StatusChip } from "@/components/ui/StatusChip";

import type { ExampleRecord } from "../types";
import { statusLabel, statusTone } from "./record-status";

export function RecordDetails({ record }: { record: ExampleRecord }) {
  return (
    <Box component="dl" sx={{ display: "grid", gap: 4, m: 0 }}>
      <Box>
        <Typography component="dt" sx={{ fontWeight: 700 }} variant="body2">
          Owner
        </Typography>
        <Typography component="dd" color="text.secondary" sx={{ m: 0, mt: 1 }} variant="body2">
          {record.owner}
        </Typography>
      </Box>
      <Box>
        <Typography component="dt" sx={{ fontWeight: 700 }} variant="body2">
          Status
        </Typography>
        <Box component="dd" sx={{ m: 0, mt: 1 }}>
          <StatusChip label={statusLabel[record.status]} tone={statusTone[record.status]} />
        </Box>
      </Box>
      <Box>
        <Typography component="dt" sx={{ fontWeight: 700 }} variant="body2">
          Created
        </Typography>
        <Typography component="dd" color="text.secondary" sx={{ m: 0, mt: 1 }} variant="body2">
          {new Date(record.createdAt).toLocaleString("en-US")}
        </Typography>
      </Box>
    </Box>
  );
}
