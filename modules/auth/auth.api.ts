import { TAG_TYPES } from "@/constants/tagTypes";
import { clearSession } from "@/modules/auth/auth.slice";
import { baseApi } from "@/services/api/baseApi";

import {
  toOtpRequestBody,
  toUpdateProfileBody,
  toVerifyOtpBody,
} from "./auth.model";
import type {
  AuthUser,
  OtpRequest,
  OtpRequestResponse,
  UpdateProfilePayload,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./auth.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOtp: builder.mutation<OtpRequestResponse, OtpRequest>({
      query: (payload) => ({
        url: "/auth/request-otp",
        method: "POST",
        body: toOtpRequestBody(payload),
      }),
      invalidatesTags: [TAG_TYPES.AUTH],
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (payload) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: toVerifyOtpBody(payload),
      }),
      invalidatesTags: [TAG_TYPES.AUTH],
    }),
    updateProfile: builder.mutation<AuthUser, UpdateProfilePayload>({
      query: (payload) => ({
        url: "/user",
        method: "PATCH",
        body: toUpdateProfileBody(payload),
      }),
      invalidatesTags: [TAG_TYPES.AUTH],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
        } finally {
          dispatch(clearSession());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApi;
