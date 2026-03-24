"use client";

import TextField from "@mui/material/TextField";
import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  useRequestOtpMutation,
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} from "@/modules/auth/auth.api";
import {
  requestOtpInputSchema,
  updateProfileInputSchema,
  verifyOtpInputSchema,
} from "@/modules/auth/auth.schema";
import { setSession } from "@/modules/auth/auth.slice";
import {
  eventApi,
  useCheckQuickEntryEligibilityMutation,
  useGetInvitationQuery,
} from "@/modules/event/event.api";
import { store, type AppDispatch } from "@/store";
import { errorMessageFromRtk } from "@/lib/errorMessageFromRtk";
import { envelopeErrorMessage } from "@/lib/envelopeErrorMessage";
import { firstZodIssueMessage } from "@/lib/zodErrors";

const ONBOARDING_CARDS = [
  {
    title: "You’re among friends",
    body: "This room is only for people who were invited. Be kind and keep the vibe positive.",
  },
  {
    title: "Moments are shared here",
    body: "Soon you’ll be able to comment and share photos. Your signed-in name will appear with what you post.",
  },
  {
    title: "Ready when you are",
    body: "You can skip these tips anytime. Tap below to open the event room.",
  },
] as const;

function InvalidAccess({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-6">
      <p className="text-xs tracking-[0.28em] text-zinc-400 uppercase">Guest invitation</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p>
    </main>
  );
}

type GuestStep = "welcome" | "email" | "otp" | "profile" | "onboarding";

type EntryMode = "full" | "quick";

function hasGuestProfileComplete(username: string | null | undefined): boolean {
  return Boolean(username?.trim());
}

export default function InvitationGate() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventSlug = typeof params.eventSlug === "string" ? params.eventSlug : "";
  const access = searchParams.get("access")?.trim() ?? "";

  const { roomHrefFull, roomHrefQuick } = useMemo(() => {
    if (!eventSlug || !access) {
      return { roomHrefFull: "", roomHrefQuick: "" };
    }
    const base = `/event/${eventSlug}/room?access=${encodeURIComponent(access)}`;
    return {
      roomHrefFull: base,
      roomHrefQuick: `${base}&quick=1`,
    };
  }, [eventSlug, access]);

  const skip = !eventSlug || !access;

  const { data, error, isError, isFetching, isSuccess } = useGetInvitationQuery(
    { eventSlug, access },
    { skip },
  );

  const [step, setStep] = useState<GuestStep>("welcome");
  const [entryMode, setEntryMode] = useState<EntryMode>("full");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [checkQuickEntry, { isLoading: isCheckingQuickEntry }] =
    useCheckQuickEntryEligibilityMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  if (!access) {
    return (
      <InvalidAccess
        title="Missing invite link"
        body="Open the invitation using the full URL from your host (email or QR). If you only copied part of the address, go back and use the complete link — it includes a private access key."
      />
    );
  }

  if (isFetching && !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-6">
        <p className="text-sm text-zinc-400">Loading invitation…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <InvalidAccess
        title="Invalid or expired invite"
        body={envelopeErrorMessage(
          error,
          "We couldn’t verify this invitation. Ask the host for a fresh invite link or QR code.",
        )}
      />
    );
  }

  if (!isSuccess || !data) {
    return null;
  }

  const goToFullRoom = () => {
    if (roomHrefFull) {
      router.push(roomHrefFull);
    }
  };

  const onEmailContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = requestOtpInputSchema.safeParse({
      email,
      context: "guest" as const,
      eventSlug,
    });
    if (!parsed.success) {
      setFormError(firstZodIssueMessage(parsed.error));
      return;
    }
    try {
      if (entryMode === "quick") {
        await checkQuickEntry({
          eventSlug,
          access,
          email: parsed.data.email,
        }).unwrap();
      }
      await requestOtp(parsed.data).unwrap();
      setCode("");
      setStep("otp");
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const onOtpVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = verifyOtpInputSchema.safeParse({
      email,
      code,
    });
    if (!parsed.success) {
      setFormError(firstZodIssueMessage(parsed.error));
      return;
    }
    try {
      const result = await verifyOtp({
        email: parsed.data.email,
        code: parsed.data.code,
      }).unwrap();
      dispatch(
        setSession({
          token: result.token,
          user: result.user,
          tokenExpiresAt: result.tokenExpiresAt ?? null,
        }),
      );

      if (entryMode === "quick") {
        router.push(roomHrefQuick);
        return;
      }

      if (!hasGuestProfileComplete(result.user.username)) {
        setUsername(result.user.username?.trim() ?? "");
        setAvatarUrl(result.user.avatarUrl?.trim() ?? "");
        setStep("profile");
        return;
      }

      try {
        await dispatch(
          eventApi.endpoints.getEventRoomContext.initiate({
            eventSlug,
            access,
            quick: true,
          }),
        ).unwrap();
        router.push(roomHrefFull);
      } catch {
        setOnboardingIndex(0);
        setStep("onboarding");
      }
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = updateProfileInputSchema.safeParse({
      username,
      avatarUrl: avatarUrl.trim() || undefined,
    });
    if (!parsed.success) {
      setFormError(firstZodIssueMessage(parsed.error));
      return;
    }
    try {
      const user = await updateProfile({
        username: parsed.data.username,
        avatarUrl: parsed.data.avatarUrl?.trim() || undefined,
      }).unwrap();
      const { token, tokenExpiresAt } = store.getState().auth;
      if (token) {
        dispatch(
          setSession({
            token,
            user,
            tokenExpiresAt: tokenExpiresAt ?? undefined,
          }),
        );
      }
      setOnboardingIndex(0);
      setStep("onboarding");
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const card = ONBOARDING_CARDS[onboardingIndex];
  const isLastCard = onboardingIndex >= ONBOARDING_CARDS.length - 1;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6">
      <div className="mb-6">
        <p className="text-xs tracking-[0.28em] text-zinc-400 uppercase">Guest invitation</p>
      </div>

      {formError && (
        <p className="mb-4 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}

      {step === "welcome" && (
        <section className="flex flex-1 flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold leading-tight text-white">{data.title}</h1>
            <p className="text-sm text-zinc-400">{data.invitationText}</p>
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="relative aspect-video bg-linear-to-br from-zinc-800 to-zinc-950">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                    <svg
                      className="ml-1 h-7 w-7 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
                Video from your host · Coming soon
              </p>
            </div>
            <p className="text-sm text-zinc-400">
              When it&apos;s ready, you&apos;ll watch a short message here, then join the event room.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setEntryMode("full");
                setStep("email");
              }}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900"
            >
              Accept invitation
            </button>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setEntryMode("quick");
                setStep("email");
              }}
              className="rounded-full border border-zinc-700 bg-transparent px-5 py-3 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
            >
              Already joined
            </button>
            <p className="text-center text-xs leading-relaxed text-zinc-500">
              First time? <span className="text-zinc-400">Accept invitation</span>. Returning with the
              same email? <span className="text-zinc-400">Already joined</span> skips tips — only if
              you&apos;ve accepted this event before.
            </p>
          </div>
        </section>
      )}

      {step === "email" && (
        <form onSubmit={onEmailContinue} className="flex flex-1 flex-col justify-between gap-6">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">
              {entryMode === "quick" ? "Welcome back" : "Enter your email"}
            </h1>
            <p className="text-sm text-zinc-400">
              {entryMode === "quick"
                ? "We’ll send a 6-digit code to confirm it’s you. You need to have accepted this invite once before with this email."
                : "We’ll send a 6-digit verification code that expires in 10 minutes."}
            </p>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setStep("welcome");
              }}
              className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
          </section>
          <button
            type="submit"
            disabled={isRequestingOtp || isCheckingQuickEntry}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
          >
            {isCheckingQuickEntry
              ? "Checking…"
              : isRequestingOtp
                ? "Sending…"
                : "Continue"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={onOtpVerify} className="flex flex-1 flex-col justify-between gap-6">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Verify your email</h1>
            <p className="text-sm text-zinc-400">
              Enter your 6-digit code. We sent it to{" "}
              <span className="font-medium text-zinc-200">{email}</span>. Didn&apos;t receive it? Go
              back and tap Continue again to resend.
            </p>
            <TextField
              label="Verification code"
              value={code}
              onChange={(ev) => setCode(ev.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              required
              inputProps={{
                inputMode: "numeric",
                maxLength: 6,
                autoComplete: "one-time-code",
              }}
              sx={{
                "& .MuiOutlinedInput-input": {
                  textAlign: "center",
                  letterSpacing: "0.35em",
                  fontSize: "1.375rem",
                  fontWeight: 500,
                },
              }}
            />
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setCode("");
                setStep("email");
              }}
              className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Use a different email
            </button>
          </section>
          <button
            type="submit"
            disabled={isVerifying}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
          >
            {isVerifying ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={onProfileSubmit} className="flex flex-1 flex-col justify-between gap-6">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Set up your profile</h1>
            <p className="text-sm text-zinc-400">
              Add your profile image and pick a unique username.
            </p>
            <TextField
              label="Profile image URL"
              type="url"
              value={avatarUrl}
              onChange={(ev) => setAvatarUrl(ev.target.value)}
              placeholder="https://…"
              helperText="Optional"
            />
            <TextField
              label="Username"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              placeholder="Choose a unique username"
              required
              autoComplete="username"
            />
          </section>
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
          >
            {isUpdatingProfile ? "Saving…" : "Next"}
          </button>
        </form>
      )}

      {step === "onboarding" && card && (
        <section className="flex flex-1 flex-col justify-between gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center gap-2">
              {ONBOARDING_CARDS.map((c, i) => (
                <span
                  key={c.title}
                  className={`h-1.5 rounded-full transition-all ${
                    i === onboardingIndex ? "w-8 bg-white" : "w-1.5 bg-zinc-600"
                  }`}
                  aria-hidden
                />
              ))}
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">Tip {onboardingIndex + 1} of 3</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.body}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={goToFullRoom}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900"
            >
              {isLastCard ? "Enter event room" : "Skip to event room"}
            </button>
            {!isLastCard && (
              <button
                type="button"
                onClick={() => setOnboardingIndex((i) => i + 1)}
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
              >
                Next tip
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
