"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

function toProjectCode(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function MyPageDashboard() {
  const { error: toastError } = useToast();
  const router = useRouter();
  const [data, setData] = useState<MyPageWidgetData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [widgets, setWidgets] = useState<MyPageWidgetDefinition[]>(() =>
    myPageWidgetCatalog.slice(0, 3),
  );
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

  const visibleWidgets = widgets.filter((widget) => {
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
      case "customText":
        return true;
    }
  });
  const moveWidget = (index: number, direction: -1 | 1) => {
    setWidgets((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
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
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button onClick={() => setIsCreateProjectOpen(true)} variant="solid">
            Create project
          </Button>
        </Stack>
      </Stack>

      {visibleWidgets.length === 0 ? (
        <EmptyState
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
              onRemove={() =>
                setWidgets((current) => current.filter((item) => item.id !== widget.id))
              }
              total={visibleWidgets.length}
              widget={widget}
            />
          ))}
        </Box>
      )}

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
