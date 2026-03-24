import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";

import { toCreateEventBody } from "./event.model";
import type {
  CreateEventRequest,
  EventInvitationView,
  EventInvitePayload,
  EventRoomContext,
  QuickEntryEligibility,
} from "./event.types";

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
    checkQuickEntryEligibility: builder.mutation<
      QuickEntryEligibility,
      { eventSlug: string; access: string; email: string }
    >({
      query: ({ eventSlug, access, email }) => ({
        url: `/events/${eventSlug}/invite/check-quick-entry`,
        method: "POST",
        body: { access, email },
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
  useCheckQuickEntryEligibilityMutation,
} = eventApi;
