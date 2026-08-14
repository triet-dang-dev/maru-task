import { z } from "zod";

export const exampleRecordSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  notifyOwner: z.boolean(),
  owner: z.string().trim().email("Owner must be a valid email"),
  status: z.enum(["ACTIVE", "DRAFT", "PAUSED"]),
});

export type ExampleRecordFormValues = z.infer<typeof exampleRecordSchema>;
