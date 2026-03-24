"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { useLogoutMutation } from "@/modules/auth/auth.api";
import { clearSession } from "@/modules/auth/auth.slice";
import { useGetEventRoomContextQuery } from "@/modules/event/event.api";
import { baseApi } from "@/services/api/baseApi";
import type { AppDispatch, RootState } from "@/store";
import { envelopeErrorMessage } from "@/lib/envelopeErrorMessage";

function InvalidAccess({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-6 text-center">
      <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">Event room</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p>
    </main>
  );
}

function queryErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }
  const s = (error as { status: unknown }).status;
  return typeof s === "number" ? s : undefined;
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function EventRoomGate() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventSlug = typeof params.eventSlug === "string" ? params.eventSlug : "";
  const access = searchParams.get("access")?.trim() ?? "";
  const quickEntry = searchParams.get("quick") === "1";
  const authToken = useSelector((state: RootState) => state.auth.token);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const clientReady = useIsClient();

  const skipQuery = !eventSlug || !access || !authToken;

  const { data, error, isError, isFetching, isSuccess } = useGetEventRoomContextQuery(
    { eventSlug, access, quick: quickEntry },
    { skip: skipQuery },
  );

  useEffect(() => {
    if (!eventSlug || !access || authToken) {
      return;
    }
    router.replace(`/invite/${eventSlug}?access=${encodeURIComponent(access)}`);
  }, [access, authToken, eventSlug, router]);

  useEffect(() => {
    if (!isError || !error || !eventSlug || !access) {
      return;
    }
    if (queryErrorStatus(error) === 401) {
      dispatch(clearSession());
      dispatch(baseApi.util.resetApiState());
      router.replace(`/invite/${eventSlug}?access=${encodeURIComponent(access)}`);
    }
  }, [access, dispatch, error, eventSlug, isError, router]);

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
    }
    router.replace(`/invite/${eventSlug}?access=${encodeURIComponent(access)}`);
  };

  if (!access) {
    return (
      <InvalidAccess
        title="Invite link required"
        body="This event room can only be opened with the full link from your invitation (email or QR). The address alone isn’t enough — ask the host to resend the invite if you need access."
      />
    );
  }

  if (!clientReady) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-6">
        <p className="text-sm text-zinc-400">Loading…</p>
      </main>
    );
  }

  if (!authToken) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-6 text-center">
        <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">Event room</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Sign in required</h1>
        <p className="mt-3 max-w-md text-sm text-zinc-400">
          To know who is in the room (for messages and photos later), you need to verify your email
          in this browser. We&apos;re sending you to the invite flow — use the same email you were
          invited with.
        </p>
        <p className="mt-6 text-sm text-zinc-500">Redirecting…</p>
      </main>
    );
  }

  if (isFetching && !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-6">
        <p className="text-sm text-zinc-400">Joining the event room…</p>
      </main>
    );
  }

  if (isError) {
    const status = queryErrorStatus(error);
    if (status === 401) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-6 text-center">
          <p className="text-sm text-zinc-400">Session expired. Redirecting to sign in…</p>
        </main>
      );
    }
    return (
      <InvalidAccess
        title="Couldn’t open this room"
        body={envelopeErrorMessage(
          error,
          "This invitation link is invalid or incomplete. Use the link from your invite email or QR code.",
        )}
      />
    );
  }

  if (isSuccess && data) {
    const { event, viewer } = data;
    const roomRoleLabel =
      viewer.eventRole === "host" ? "HOST" : "GUEST";
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6">
        <header className="mb-8 border-b border-zinc-800 pb-4 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">Event room</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{event.title}</h1>
              <p className="mt-3 text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
                {roomRoleLabel}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Signed in as{" "}
                <span className="font-medium text-zinc-200">{viewer.email}</span>
                {viewer.username ? (
                  <>
                    {" "}
                    <span className="text-zinc-500">·</span> @{viewer.username}
                  </>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void onLogout()}
              disabled={isLoggingOut}
              className="shrink-0 rounded-full border border-zinc-600 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-200 uppercase hover:bg-zinc-800 disabled:opacity-50"
            >
              {isLoggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-semibold text-white">Coming soon</h2>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            We are polishing the Event Room experience. Comments and shared photos will use your
            signed-in profile above.
          </p>
        </div>
      </main>
    );
  }

  return null;
}
