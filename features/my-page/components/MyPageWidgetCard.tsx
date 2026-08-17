import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowLeft, ArrowRight, GripVertical, X } from "lucide-react";
import Link from "next/link";

import { IconButton } from "@/components/ui/IconButton";

import type { MyPageWidgetData, MyPageWidgetDefinition, MyPageWidgetType } from "./my-page-model";

function WorkPackageWidget({ data, type }: { data: MyPageWidgetData; type: MyPageWidgetType }) {
  const items = type === "workPackagesCreated" ? data.workPackages.slice(1) : data.workPackages;
  return (
    <Stack divider={<Divider flexItem />}>
      {items.map((item) => (
        <Box key={item.id} sx={{ px: 3, py: 2 }}>
          <Typography
            component={Link}
            href={`/projects/${item.projectId}/work-items/${item.id}`}
            sx={{ color: "primary.main", fontWeight: 700 }}
            variant="body2"
          >
            {item.id} · {item.subject}
          </Typography>
          <Typography color="text.secondary" sx={{ display: "block", mt: 0.5 }} variant="caption">
            Migration · {item.status}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function WidgetContent({ data, type }: { data: MyPageWidgetData; type: MyPageWidgetType }) {
  if (type === "workPackagesAssigned" || type === "workPackagesCreated") {
    return <WorkPackageWidget data={data} type={type} />;
  }
  if (type === "spentTime") {
    return (
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          {data.spentTime.map((entry) => (
            <Box key={entry.day} sx={{ textAlign: "center" }}>
              <Typography color="text.secondary" variant="caption">
                {entry.day}
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{entry.hours}h</Typography>
            </Box>
          ))}
        </Stack>
        <Typography sx={{ mt: 3, textAlign: "right" }} variant="body2">
          Total: {data.spentTime.reduce((total, entry) => total + entry.hours, 0)} hours
        </Typography>
      </Box>
    );
  }
  if (type === "favoriteProjects") {
    return (
      <Stack divider={<Divider flexItem />}>
        {data.favoriteProjects.map((project) => (
          <Typography
            component={Link}
            href={`/projects/${project.id}`}
            key={project.id}
            sx={{ color: "primary.main", px: 3, py: 2 }}
            variant="body2"
          >
            {project.name}
          </Typography>
        ))}
      </Stack>
    );
  }
  if (type === "calendar") {
    return (
      <Stack divider={<Divider flexItem />}>
        {data.calendarEvents.map((event) => (
          <Typography key={event} sx={{ px: 3, py: 2 }} variant="body2">
            {event}
          </Typography>
        ))}
      </Stack>
    );
  }
  return (
    <Typography color="text.secondary" sx={{ px: 3, py: 4 }}>
      Click configure to add your own text.
    </Typography>
  );
}

export function MyPageWidgetCard({
  data,
  index,
  onMove,
  onRemove,
  total,
  widget,
}: {
  data: MyPageWidgetData;
  index: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  total: number;
  widget: MyPageWidgetDefinition;
}) {
  return (
    <Paper
      aria-label={widget.title}
      component="section"
      sx={{ minWidth: 0, overflow: "hidden" }}
      variant="outlined"
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          <GripVertical aria-hidden="true" color="currentColor" size={17} />
          <Typography component="h2" noWrap sx={{ fontWeight: 700 }} variant="subtitle1">
            {widget.title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label={`Move ${widget.title} earlier`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            size="small"
          >
            <ArrowLeft aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            aria-label={`Move ${widget.title} later`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            size="small"
          >
            <ArrowRight aria-hidden="true" size={15} />
          </IconButton>
          <IconButton aria-label={`Remove ${widget.title} widget`} onClick={onRemove} size="small">
            <X aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
      <WidgetContent data={data} type={widget.type} />
    </Paper>
  );
}
