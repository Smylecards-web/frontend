import { configureStore } from "@reduxjs/toolkit";

import { readPersistedAuth, writePersistedAuth } from "@/lib/authStorage";
import type { AuthState, AuthUser } from "@/modules/auth/auth.types";
import { authReducer } from "@/modules/auth/auth.slice";
import { eventReducer } from "@/modules/event/event.slice";
import { baseApi } from "@/services/api/baseApi";

function authPreloadFromStorage(): { auth: AuthState } | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const p = readPersistedAuth();
  if (!p) {
    return undefined;
  }
  return {
    auth: {
      token: p.token,
      user: p.user as AuthUser,
      tokenExpiresAt: p.tokenExpiresAt,
    },
  };
}

const authPreload = authPreloadFromStorage();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    event: eventReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  ...(authPreload ? { preloadedState: authPreload } : {}),
});

function authPersistenceKey(auth: AuthState): string {
  return `${auth.token ?? ""}\0${auth.user?.id ?? ""}\0${auth.tokenExpiresAt ?? ""}`;
}

let lastAuthPersistenceKey = authPersistenceKey(store.getState().auth);

store.subscribe(() => {
  if (typeof window === "undefined") {
    return;
  }
  const auth = store.getState().auth;
  const nextKey = authPersistenceKey(auth);
  if (nextKey === lastAuthPersistenceKey) {
    return;
  }
  lastAuthPersistenceKey = nextKey;
  if (auth.token && auth.user) {
    writePersistedAuth({
      token: auth.token,
      user: auth.user,
      tokenExpiresAt: auth.tokenExpiresAt,
    });
  } else {
    writePersistedAuth(null);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
