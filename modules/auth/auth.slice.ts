import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthState, AuthUser } from "./auth.types";

const initialState: AuthState = {
  token: null,
  user: null,
  tokenExpiresAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        token: string;
        user: AuthUser;
        tokenExpiresAt?: string | null;
      }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (action.payload.tokenExpiresAt !== undefined) {
        state.tokenExpiresAt = action.payload.tokenExpiresAt ?? null;
      }
    },
    clearSession: (state) => {
      state.token = null;
      state.user = null;
      state.tokenExpiresAt = null;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
