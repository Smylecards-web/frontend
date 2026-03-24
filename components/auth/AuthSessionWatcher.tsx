"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { clearSession } from "@/modules/auth/auth.slice";
import { baseApi } from "@/services/api/baseApi";
import type { RootState } from "@/store";

const TICK_MS = 60_000;

export function AuthSessionWatcher() {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const tokenExpiresAt = useSelector((s: RootState) => s.auth.tokenExpiresAt);

  useEffect(() => {
    if (!token || !tokenExpiresAt) {
      return;
    }
    const tick = () => {
      const t = Date.parse(tokenExpiresAt);
      if (!Number.isNaN(t) && t <= Date.now()) {
        dispatch(clearSession());
        dispatch(baseApi.util.resetApiState());
      }
    };
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [dispatch, token, tokenExpiresAt]);

  return null;
}
