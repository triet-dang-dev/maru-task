"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { SelectBox } from "@/components/ui/SelectBox";
import { useToast } from "@/components/ui/Toast";
import { createProject } from "@/features/projects/service";
import { createWorkItem } from "@/features/work-items/service";

import { loadHomeData } from "../service";
import type { HomeData } from "../types";
import { HomeAnnouncementBanner } from "./HomeAnnouncementBanner";
import { HomeAssignedTasksWidget } from "./HomeAssignedTasksWidget";
import { HomeMeetingsWidget } from "./HomeMeetingsWidget";
import { HomeMetricsGrid } from "./HomeMetricsGrid";
import { HomeNewsWidget } from "./HomeNewsWidget";
import { HomeQuickActions } from "./HomeQuickActions";
import { HomeRecentProjectsList } from "./HomeRecentProjectsList";
import { HomeResourceLinks } from "./HomeResourceLinks";

type CreateProjectFormValues = {
  description: string;
  name: string;
};

type CreateWorkItemFormValues = {
  projectId: string;
  title: string;
};

function toProjectCode(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function HomePageContent() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [data, setData] = useState<HomeData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreateWorkItemOpen, setIsCreateWorkItemOpen] = useState(false);
  const [isCreatingWorkItem, setIsCreatingWorkItem] = useState(false);

  // Project form
  const {
    control: projectControl,
    handleSubmit: handleProjectSubmit,
    reset: resetProjectForm,
    watch: watchProject,
  } = useForm<CreateProjectFormValues>({
    defaultValues: { description: "", name: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const projectCode = toProjectCode(watchProject("name"));

  // Work item form
  const {
    control: workItemControl,
    handleSubmit: handleWorkItemSubmit,
    reset: resetWorkItemForm,
  } = useForm<CreateWorkItemFormValues>({
    defaultValues: { projectId: "", title: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const fetchData = () => {
    setIsLoading(true);
    setErrorMessage(undefined);
    loadHomeData()
      .then((loadedData) => {
        setData(loadedData);
      })
      .catch(() => {
        setErrorMessage("Home workspace overview could not be loaded.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage, toastError]);

  const closeCreateProject = () => {
    if (isCreatingProject) return;
    resetProjectForm();
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
      toastSuccess(`Project "${project.name}" created.`);
      resetProjectForm();
      setIsCreateProjectOpen(false);
      router.push(`/projects/${project.id}`);
    } catch (submitError) {
      toastError(submitError instanceof Error ? submitError.message : "Unable to create project.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const closeCreateWorkItem = () => {
    if (isCreatingWorkItem) return;
    resetWorkItemForm();
    setIsCreateWorkItemOpen(false);
  };

  const handleCreateWorkItem = async ({ projectId, title }: CreateWorkItemFormValues) => {
    setIsCreatingWorkItem(true);
    try {
      await createWorkItem({ projectId, title: title.trim() });
      toastSuccess(`Work item "${title.trim()}" created.`);
      resetWorkItemForm();
      setIsCreateWorkItemOpen(false);
      fetchData();
    } catch (submitError) {
      toastError(submitError instanceof Error ? submitError.message : "Unable to create work item.");
    } finally {
      setIsCreatingWorkItem(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading workspace overview" lines={8} />;
  }

  if (errorMessage && !data) {
    return (
      <EmptyState
        action={
          <Button onClick={fetchData} variant="solid">
            Retry
          </Button>
        }
        description="We encountered an issue loading your workspace overview. Please try again."
        title="Workspace unavailable"
      />
    );
  }

  if (!data) return null;

  const projectOptions = data.recentProjects.map((p) => ({
    label: p.name,
    value: p.id,
  }));

  return (
    <Stack spacing={{ xs: 4, md: 5 }}>
      {/* 1. Page Header & Quick Actions */}
      <PageHeader
        actions={
          <HomeQuickActions
            onCreateProject={() => setIsCreateProjectOpen(true)}
            onCreateWorkItem={() => {
              if (projectOptions.length > 0) {
                resetWorkItemForm({ projectId: projectOptions[0].value, title: "" });
              }
              setIsCreateWorkItemOpen(true);
            }}
          />
        }
        description="Your centralized project management workspace across projects, boards, and agile teams."
        eyebrow="Workspace Overview"
        title="Home"
      />

      {/* 2. Announcement Banner if present */}
      {data.announcement ? (
        <HomeAnnouncementBanner announcement={data.announcement} />
      ) : null}

      {/* 3. KPI Metrics Summary Cards */}
      <HomeMetricsGrid metrics={data.metrics} />

      {/* 4. Main 2-Column Widget Grid */}
      <Box
        sx={{
          display: "grid",
          gap: { xs: 3, lg: 4 },
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        {/* Left Column: Projects & Meetings */}
        <Stack spacing={{ xs: 3, lg: 4 }}>
          <HomeRecentProjectsList
            onCreateProject={() => setIsCreateProjectOpen(true)}
            projects={data.recentProjects}
          />
          <HomeMeetingsWidget meetings={data.meetings} />
        </Stack>

        {/* Right Column: Work Packages & News */}
        <Stack spacing={{ xs: 3, lg: 4 }}>
          <HomeAssignedTasksWidget
            onCreateWorkItem={() => {
              if (projectOptions.length > 0) {
                resetWorkItemForm({ projectId: projectOptions[0].value, title: "" });
              }
              setIsCreateWorkItemOpen(true);
            }}
            tasks={data.assignedTasks}
          />
          <HomeNewsWidget news={data.news} />
        </Stack>
      </Box>

      {/* 5. Resource Links & Documentation Grid */}
      <HomeResourceLinks links={data.resourceLinks} />

      {/* Modal: Create Project */}
      {isCreateProjectOpen ? (
        <Modal
          actions={
            <>
              <Button disabled={isCreatingProject} onClick={closeCreateProject} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isCreatingProject}
                form="create-project-home"
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
            id="create-project-home"
            noValidate
            onSubmit={handleProjectSubmit(handleCreateProject)}
            spacing={3}
          >
            <InputField
              autoFocus
              control={projectControl}
              label="Project name"
              name="name"
              rules={{
                validate: (value) => value.trim().length > 0 || "Please enter a project name.",
              }}
            />
            <InputField disabled label="Project code" name="code" value={projectCode} />
            <InputField
              control={projectControl}
              label="Description"
              minRows={3}
              multiline
              name="description"
            />
          </Stack>
        </Modal>
      ) : null}

      {/* Modal: Create Work Item */}
      {isCreateWorkItemOpen ? (
        <Modal
          actions={
            <>
              <Button disabled={isCreatingWorkItem} onClick={closeCreateWorkItem} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isCreatingWorkItem}
                form="create-work-item-home"
                type="submit"
                variant="solid"
              >
                {isCreatingWorkItem ? "Creating..." : "Create work item"}
              </Button>
            </>
          }
          closeDisabled={isCreatingWorkItem}
          onClose={closeCreateWorkItem}
          open
          title="Create work item"
        >
          <Stack
            component="form"
            id="create-work-item-home"
            noValidate
            onSubmit={handleWorkItemSubmit(handleCreateWorkItem)}
            spacing={3}
          >
            {projectOptions.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No active projects available. Please create a project first.
              </Typography>
            ) : (
              <>
                <SelectBox
                  control={workItemControl}
                  label="Target project"
                  name="projectId"
                  options={projectOptions}
                  rules={{ required: "Please select a project." }}
                />
                <InputField
                  autoFocus
                  control={workItemControl}
                  label="Work item title / subject"
                  name="title"
                  rules={{
                    validate: (value) => value.trim().length > 0 || "Please enter a work item title.",
                  }}
                />
              </>
            )}
          </Stack>
        </Modal>
      ) : null}
    </Stack>
  );
}
