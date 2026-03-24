import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function errorMessageFromRtk(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as FetchBaseQueryError).data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  }
  return fallback;
}
