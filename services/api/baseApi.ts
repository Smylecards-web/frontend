import { createApi } from "@reduxjs/toolkit/query/react";
import { TAG_TYPE_LIST } from "@/constants/tagTypes";

import { baseQueryWithEnvelope } from "./baseQueryWithEnvelope";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithEnvelope,
  tagTypes: TAG_TYPE_LIST,
  endpoints: () => ({}),
});
