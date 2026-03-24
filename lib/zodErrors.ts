import type { z } from "zod";

export function firstZodIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
