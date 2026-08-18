"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createProject } from "@/features/projects/service";

import { loadMyPageData } from "../service";
import { MyPageAddWidgetDialog } from "./MyPageAddWidgetDialog";
import { MyPageWidgetCard } from "./MyPageWidgetCard";
import {
  myPageWidgetCatalog,
  type MyPageWidgetData,
  type MyPageWidgetDefinition,
} from "./my-page-model";

type CreateProjectFormValues = {
  description: string;
  name: string;
};

const STORAGE_KEY = "maru_task_my_page_widgets";
const DEFAULT_WIDGET_IDS = ["assigned", "spent-time", "favorites", "calendar"];

function getInitialWidgets(): MyPageWidgetDefinition[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const mapped = ids
          .map((id) => myPageWidgetCatalog.find((w) => w.id === id))
          .filter((w): w is MyPageWidgetDefinition => Boolean(w));
        if (mapped.length > 0) return mapped;
      }
    } catch {}
  }
  return DEFAULT_WIDGET_IDS.map((id) => myPageWidgetCatalog.find((w) => w.id === id)!).filter(Boolean);
}

function toProjectCode(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function MyPageDashboard() {
  const { error: toastError, success: toastSuccess } = useToast();
  const router = useRouter();
  const [data, setData] = useState<MyPageWidgetData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [widgets, setWidgets] = useState<MyPageWidgetDefinition[]>(getInitialWidgets);

  const { control, handleSubmit, reset, watch } = useForm<CreateProjectFormValues>({
    defaultValues: { description: "", name: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const projectCode = toProjectCode(watch("name"));

  useEffect(() => {
    let isMounted = true;

    loadMyPageData()
      .then((loadedData) => {
        if (isMounted) setData(loadedData);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("Your personal overview could not be loaded.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage, toastError]);

  const saveWidgets = (updated: MyPageWidgetDefinition[]) => {
    setWidgets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map((w) => w.id)));
    } catch {}
  };

  // Filter widgets to those with data or customText
  const visibleWidgets = widgets.filter((widget) => {
    if (!data) return false;
    switch (widget.type) {
      case "calendar":
        return data.calendarEvents.length > 0;
      case "favoriteProjects":
        return data.favoriteProjects.length > 0;
      case "spentTime":
        return data.spentTime.length > 0;
      case "workPackagesAssigned":
        return data.workPackages.length > 0;
      case "workPackagesCreated":
        return data.workPackages.slice(1).length > 0;
      case "news":
        return (data.news || []).length > 0;
      case "customText":
        return true;
    }
  });

  const moveWidget = (visibleIndex: number, direction: -1 | 1) => {
    const nextVisibleIndex = visibleIndex + direction;
    if (nextVisibleIndex < 0 || nextVisibleIndex >= visibleWidgets.length) return;
    const currentWidget = visibleWidgets[visibleIndex];
    const targetWidget = visibleWidgets[nextVisibleIndex];

    const currentIndexInAll = widgets.findIndex((w) => w.id === currentWidget.id);
    const targetIndexInAll = widgets.findIndex((w) => w.id === targetWidget.id);
    if (currentIndexInAll === -1 || targetIndexInAll === -1) return;

    const reordered = [...widgets];
    [reordered[currentIndexInAll], reordered[targetIndexInAll]] = [
      reordered[targetIndexInAll],
      reordered[currentIndexInAll],
    ];
    saveWidgets(reordered);
  };

  const removeWidget = (id: string) => {
    saveWidgets(widgets.filter((w) => w.id !== id));
    toastSuccess("Widget removed from dashboard.");
  };

  const handleAddWidget = (widget: MyPageWidgetDefinition) => {
    if (!widgets.some((w) => w.id === widget.id)) {
      saveWidgets([...widgets, widget]);
      toastSuccess(`Added "${widget.title}" widget.`);
    }
    setIsAddWidgetOpen(false);
  };

  const resetToDefaultLayout = () => {
    const defaultWidgets = DEFAULT_WIDGET_IDS.map((id) =>
      myPageWidgetCatalog.find((w) => w.id === id)!,
    ).filter(Boolean);
    saveWidgets(defaultWidgets);
    toastSuccess("Dashboard reset to default layout.");
  };

  const closeCreateProject = () => {
    if (isCreatingProject) return;
    reset();
    setIsCreateProjectOpen(false);
  };

  const handleCreateProject = async ({ description, name }: CreateProjectFormValues) => {
    setIsCreatingProject(true);
    try {
      const project = await createProject({
        code: projectCode || null,
        description: description.trim() || null,
        name: name.trim(),
      });
      reset();
      setIsCreateProjectOpen(false);
      router.push(`/projects/${project.id}`);
    } catch (submitError) {
      toastError(submitError instanceof Error ? submitError.message : "Unable to create project.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading my page" lines={6} />;

  if (errorMessage) {
    return (
      <EmptyState
        description="Your personal overview could not be loaded. Please try again later."
        title="My page is unavailable"
      />
    );
  }

  if (!data) return null;


  const availableWidgets = myPageWidgetCatalog.filter(
    (catalogItem) => !widgets.some((active) => active.id === catalogItem.id),
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 4 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            My page
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Your personal overview of work, time, and projects.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Button
            onClick={() => setIsAddWidgetOpen(true)}
            startIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
            variant="outline"
          >
            Add widget
          </Button>
          <Button
            onClick={resetToDefaultLayout}
            startIcon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
            variant="ghost"
          >
            Reset layout
          </Button>
          <Button onClick={() => setIsCreateProjectOpen(true)} variant="solid">
            Create project
          </Button>
        </Stack>
      </Stack>

      {visibleWidgets.length === 0 ? (
        <EmptyState
          action={
            <Stack direction="row" spacing={1.5}>
              <Button onClick={() => setIsAddWidgetOpen(true)} variant="outline">
                Add widget
              </Button>
              <Button onClick={resetToDefaultLayout} variant="solid">
                Reset to default
              </Button>
            </Stack>
          }
          description="Your assigned work, time, projects, and calendar events will appear here when available."
          title="No personal data yet"
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          {visibleWidgets.map((widget, index) => (
            <MyPageWidgetCard
              data={data}
              index={index}
              key={widget.id}
              onMove={(direction) => moveWidget(index, direction)}
              onRemove={() => removeWidget(widget.id)}
              total={visibleWidgets.length}
              widget={widget}
            />
          ))}
        </Box>
      )}

      {/* Add Widget Dialog */}
      {isAddWidgetOpen ? (
        <MyPageAddWidgetDialog
          availableWidgets={availableWidgets}
          onCancel={() => setIsAddWidgetOpen(false)}
          onSelect={handleAddWidget}
        />
      ) : null}

      {/* Create Project Modal */}
      {isCreateProjectOpen ? (
        <Modal
          actions={
            <>
              <Button disabled={isCreatingProject} onClick={closeCreateProject} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isCreatingProject}
                form="create-project"
                type="submit"
                variant="solid"
              >
                {isCreatingProject ? "Creating..." : "Create project"}
              </Button>
            </>
          }
          closeDisabled={isCreatingProject}
          onClose={closeCreateProject}
          open
          title="Create project"
        >
          <Stack
            component="form"
            id="create-project"
            noValidate
            onSubmit={handleSubmit(handleCreateProject)}
            spacing={3}
          >
            <InputField
              autoFocus
              control={control}
              label="Project name"
              name="name"
              rules={{
                validate: (value) => value.trim().length > 0 || "Please enter a project name.",
              }}
            />
            <InputField disabled label="Project code" name="code" value={projectCode} />
            <InputField
              control={control}
              label="Description"
              minRows={3}
              multiline
              name="description"
            />
          </Stack>
        </Modal>
      ) : null}
    </Box>
  );
}
