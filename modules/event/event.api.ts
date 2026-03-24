import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";

import type { AuthUser } from "@/modules/auth/auth.types";

import { toCreateEventBody } from "./event.model";
import type {
  CreateEventRequest,
  EventInvitationView,
  EventInvitePayload,
  EventRoomContext,
} from "./event.types";

export type LoginWithPinResponse = {
  token: string;
  tokenExpiresAt?: string | null;
  user: AuthUser;
};

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<EventInvitePayload, CreateEventRequest>({
      query: (payload) => ({
        url: "/events",
        method: "POST",
        body: toCreateEventBody(payload),
      }),
      invalidatesTags: [TAG_TYPES.EVENT, TAG_TYPES.INVITATION],
    }),
    getInvitation: builder.query<
      EventInvitationView,
      { eventSlug: string; access: string }
    >({
      query: ({ eventSlug, access }) => ({
        url: `/events/${eventSlug}/invite`,
        params: { access },
      }),
      providesTags: (_r, _e, { eventSlug }) => [
        { type: TAG_TYPES.INVITATION, id: eventSlug },
      ],
    }),
    checkAcceptInvite: builder.mutation<
      { ok: boolean },
      { eventSlug: string; access: string; email: string }
    >({
      query: ({ eventSlug, access, email }) => ({
        url: `/events/${eventSlug}/invite/check-accept`,
        method: "POST",
        body: { access, email },
      }),
    }),
    loginWithPin: builder.mutation<
      LoginWithPinResponse,
      { eventSlug: string; access: string; email: string; pin: string }
    >({
      query: ({ eventSlug, access, email, pin }) => ({
        url: `/events/${eventSlug}/login-with-pin`,
        method: "POST",
        body: { access, email, pin },
      }),
    }),
    joinEvent: builder.mutation<
      { eventSlug: string },
      { eventSlug: string; access: string; pin: string }
    >({
      query: ({ eventSlug, access, pin }) => ({
        url: `/events/${eventSlug}/join`,
        method: "POST",
        body: { access, pin },
      }),
      invalidatesTags: [TAG_TYPES.EVENT],
    }),
    requestForgotPinOtp: builder.mutation<
      { expiresInSeconds: number },
      { eventSlug: string; access: string; email: string }
    >({
      query: ({ eventSlug, access, email }) => ({
        url: `/events/${eventSlug}/forgot-pin/request`,
        method: "POST",
        body: { access, email },
      }),
    }),
    forgotPinReset: builder.mutation<
      LoginWithPinResponse,
      {
        eventSlug: string;
        access: string;
        email: string;
        code: string;
        newPin: string;
      }
    >({
      query: ({ eventSlug, access, email, code, newPin }) => ({
        url: `/events/${eventSlug}/forgot-pin/reset`,
        method: "POST",
        body: { access, email, code, new_pin: newPin },
      }),
    }),
    getEventRoomContext: builder.query<
      EventRoomContext,
      { eventSlug: string; access: string; quick?: boolean }
    >({
      query: ({ eventSlug, access, quick }) => ({
        url: `/events/${eventSlug}/room-context`,
        params: {
          access,
          ...(quick ? { quick: "1" } : {}),
        },
      }),
      providesTags: (_r, _e, { eventSlug }) => [
        { type: TAG_TYPES.EVENT, id: `${eventSlug}-room` },
      ],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetEventRoomContextQuery,
  useGetInvitationQuery,
  useCheckAcceptInviteMutation,
  useLoginWithPinMutation,
  useJoinEventMutation,
  useRequestForgotPinOtpMutation,
  useForgotPinResetMutation,
} = eventApi;
