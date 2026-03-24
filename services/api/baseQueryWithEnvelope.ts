import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

import type { ApiEnvelope } from "./api.types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  prepareHeaders(headers, { getState }) {
    const token = (
      getState() as { auth?: { token?: string | null } }
    ).auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "message" in value &&
    "data" in value
  );
}

export const baseQueryWithEnvelope: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const err = result.error;
    const status = typeof err.status === "number" ? err.status : undefined;
    const payload = err.data;

    if (isApiEnvelope(payload) && payload.success === false) {
      return {
        error: {
          status: status ?? 422,
          data: payload,
        } as FetchBaseQueryError,
      };
    }

    return result;
  }

  const body = result.data;

  if (isApiEnvelope(body)) {
    if (body.success === false) {
      return {
        error: {
          status: "CUSTOM_ERROR",
          data: body,
        } as FetchBaseQueryError,
      };
    }

    return { data: body.data };
  }

  return result;
};
