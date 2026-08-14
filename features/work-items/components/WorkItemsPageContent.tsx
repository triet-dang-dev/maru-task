"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingState } from "@/components/ui/LoadingState";

import { getWorkItems } from "../service";
import type { WorkItemsViewModel } from "../types";
import { WorkItemsPanelClient } from "./WorkItemsPanelClient";

interface WorkItemsPageContentProps {
  projectId: string;
}

export function WorkItemsPageContent({ projectId }: WorkItemsPageContentProps) {
  const [data, setData] = useState<WorkItemsViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getWorkItems(projectId);
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load work items.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await load();
      if (!isMounted) {
        return;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [load]);

  if (isLoading) {
    return <LoadingState label="Loading work items" />;
  }

  if (error) {
    return (
      <InlineAlert title="Unable to load work items" tone="error">
        {error}
      </InlineAlert>
    );
  }

  if (!data) {
    return (
      <EmptyState
        description="The work-items view did not return any data."
        title="No work-items data"
      />
    );
  }

  return <WorkItemsPanelClient data={data} projectId={projectId} onRefresh={load} />;
}
