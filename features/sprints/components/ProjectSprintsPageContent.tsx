"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { LoadingState } from "@/components/ui/LoadingState";
import { SectionCard, SectionCardContent } from "@/components/ui/SectionCard";
import { useToast } from "@/components/ui/Toast";

import { createSprint, getSprints } from "../service";
import type { SprintsResponse } from "../types";
import { ProjectSprintsPanel } from "./ProjectSprintsPanel";

type CreateSprintFormValues = {
  endDate: string;
  name: string;
  startDate: string;
};

function toUtcIsoString(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;
}

export function ProjectSprintsPageContent({ projectId }: { projectId: string }) {
  const { error: toastError } = useToast();
  const [data, setData] = useState<SprintsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { control, getValues, handleSubmit, reset } = useForm<CreateSprintFormValues>({
    defaultValues: { endDate: "", name: "", startDate: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setData(await getSprints(projectId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sprints.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await load();
      if (!isMounted) return;
    })();

    return () => {
      isMounted = false;
    };
  }, [load]);

  useEffect(() => {
    if (error) toastError(error);
  }, [error, toastError]);

  useEffect(() => {
    if (createError) toastError(createError);
  }, [createError, toastError]);

  const handleCreate = useCallback(
    async ({ endDate, name, startDate }: CreateSprintFormValues) => {
      setCreateError(null);
      setIsCreating(true);
      try {
        await createSprint(projectId, {
          endDate: toUtcIsoString(endDate),
          name: name.trim(),
          startDate: toUtcIsoString(startDate),
        });

        reset();
        await load();
      } catch (submitError) {
        setCreateError(
          submitError instanceof Error ? submitError.message : "Unable to create sprint.",
        );
      } finally {
        setIsCreating(false);
      }
    },
    [load, projectId, reset],
  );

  if (isLoading) return <LoadingState label="Loading sprints" />;
  if (error) {
    return (
      <EmptyState
        description="Sprints could not be loaded. Please try again later."
        title="Sprints are unavailable"
      />
    );
  }
  if (!data) return null;

  return (
    <SectionCard>
      <SectionCardContent>
        <form
          noValidate
          onSubmit={handleSubmit(handleCreate)}
          style={{
            alignItems: "end",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <InputField
            control={control}
            label="Sprint name"
            name="name"
            placeholder="Enter sprint name"
            rules={{
              validate: (value) => value.trim().length > 0 || "Please enter a sprint name.",
            }}
          />
          <InputField control={control} label="Start date" name="startDate" type="date" />
          <InputField
            control={control}
            label="End date"
            name="endDate"
            rules={{
              validate: (value) => {
                const startDate = getValues("startDate");
                return (
                  !startDate ||
                  !value ||
                  startDate <= value ||
                  "Sprint end date must be on or after the start date."
                );
              },
            }}
            type="date"
          />
          <Button disabled={isCreating} type="submit">
            {isCreating ? "Creating..." : "Create sprint"}
          </Button>
        </form>
        <ProjectSprintsPanel data={data} />
      </SectionCardContent>
    </SectionCard>
  );
}
