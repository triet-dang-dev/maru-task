"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingState } from "@/components/ui/LoadingState";

import { MyPageAddWidgetDialog } from "./MyPageAddWidgetDialog";
import { MyPageWidgetCard } from "./MyPageWidgetCard";
import {
  defaultMyPageWidgetData,
  defaultMyPageWidgets,
  myPageWidgetCatalog,
  type MyPageWidgetData,
  type MyPageWidgetDefinition,
} from "./my-page-model";

export function MyPageDashboard({
  data = defaultMyPageWidgetData,
  errorMessage,
  initialWidgets = defaultMyPageWidgets,
  isLoading = false,
}: {
  data?: MyPageWidgetData;
  errorMessage?: string;
  initialWidgets?: MyPageWidgetDefinition[];
  isLoading?: boolean;
}) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  if (isLoading) return <LoadingState label="Loading my page" lines={6} />;
  if (errorMessage) {
    return (
      <InlineAlert title="Unable to load my page" tone="error">
        {errorMessage}
      </InlineAlert>
    );
  }

  const availableWidgets = myPageWidgetCatalog.filter(
    (candidate) => !widgets.some((widget) => widget.type === candidate.type),
  );
  const moveWidget = (index: number, direction: -1 | 1) => {
    setWidgets((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
  };

  return (
    <Box>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            My page
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Your personal overview of work, time, and projects.
          </Typography>
        </Box>
        <Button
          disabled={availableWidgets.length === 0}
          onClick={() => setIsAddingWidget(true)}
          startIcon={<Plus aria-hidden="true" size={16} />}
        >
          Add widget
        </Button>
      </Stack>

      {widgets.length === 0 ? (
        <EmptyState
          action={<Button onClick={() => setIsAddingWidget(true)}>Add widget</Button>}
          description="Add work package, time, calendar, or project widgets to build your overview."
          title="Your page has no widgets yet"
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          {widgets.map((widget, index) => (
            <MyPageWidgetCard
              data={data}
              index={index}
              key={widget.id}
              onMove={(direction) => moveWidget(index, direction)}
              onRemove={() =>
                setWidgets((current) => current.filter((item) => item.id !== widget.id))
              }
              total={widgets.length}
              widget={widget}
            />
          ))}
        </Box>
      )}

      {isAddingWidget ? (
        <MyPageAddWidgetDialog
          availableWidgets={availableWidgets}
          onCancel={() => setIsAddingWidget(false)}
          onSelect={(widget) => {
            setWidgets((current) => [...current, widget]);
            setIsAddingWidget(false);
          }}
        />
      ) : null}
    </Box>
  );
}
