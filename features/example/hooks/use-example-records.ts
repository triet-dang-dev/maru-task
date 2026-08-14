"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createExampleRecord, listExampleRecords } from "../services/example-records";
import type { ExampleRecord } from "../types";

const exampleRecordsQueryKey = ["example-records"] as const;

export function useExampleRecords() {
  return useQuery({
    queryFn: listExampleRecords,
    queryKey: exampleRecordsQueryKey,
  });
}

export function useCreateExampleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExampleRecord,
    onSuccess: (record) => {
      queryClient.setQueryData<ExampleRecord[]>(exampleRecordsQueryKey, (current = []) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
    },
  });
}
