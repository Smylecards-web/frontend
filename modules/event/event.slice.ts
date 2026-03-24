import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { EventInvitePayload, EventState } from "./event.types";

const initialState: EventState = {
  latestInvite: null,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setLatestInvite: (state, action: PayloadAction<EventInvitePayload>) => {
      state.latestInvite = action.payload;
    },
  },
});

export const { setLatestInvite } = eventSlice.actions;
export const eventReducer = eventSlice.reducer;
