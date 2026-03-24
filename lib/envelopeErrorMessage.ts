import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function envelopeErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return fallback;
  }
  const data = (error as FetchBaseQueryError).data;
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}
