"use client";

import { Provider } from "react-redux";

import { AuthSessionWatcher } from "@/components/auth/AuthSessionWatcher";
import { MuiProvider } from "@/components/mui/MuiProvider";
import { store } from "@/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthSessionWatcher />
      <MuiProvider>{children}</MuiProvider>
    </Provider>
  );
}
