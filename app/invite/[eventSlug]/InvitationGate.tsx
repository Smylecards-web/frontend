"use client";

import TextField from "@mui/material/TextField";
import { FormEvent, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  useRequestOtpMutation,
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} from "@/modules/auth/auth.api";
import {
  eventPinSchema,
  requestOtpInputSchema,
  updateProfileInputSchema,
  verifyOtpInputSchema,
} from "@/modules/auth/auth.schema";
import { setSession } from "@/modules/auth/auth.slice";
import {
  eventApi,
  useCheckAcceptInviteMutation,
  useForgotPinResetMutation,
  useGetInvitationQuery,
  useJoinEventMutation,
  useLoginWithPinMutation,
  useRequestForgotPinOtpMutation,
} from "@/modules/event/event.api";
import { store, type AppDispatch } from "@/store";
import { errorMessageFromRtk } from "@/lib/errorMessageFromRtk";
import { envelopeErrorMessage } from "@/lib/envelopeErrorMessage";
import { centeredNumericCodeFieldSx } from "@/lib/muiCodeFieldSx";
import { appButtonPrimary, appButtonSecondary } from "@/lib/appUi";
import { firstZodIssueMessage } from "@/lib/zodErrors";
import { GuestOnboardingSlides } from "@/components/invite/GuestOnboardingSlides";
import { GUEST_ONBOARDING_SLIDES } from "@/content/guest-onboarding-slides";

function InvalidAccess({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 app-pad-y">
      <p className="text-xs tracking-[0.28em] text-zinc-400 uppercase">Guest invitation</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p>
    </main>
  );
}

type GuestStep =
  | "welcome"
  | "email"
  | "otp"
  | "profile"
  | "onboarding"
  | "forgotPinEmail"
  | "forgotPinFinish";

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
  const [eventPin, setEventPin] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const onboardingScrollRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotPinEmail, setForgotPinEmail] = useState("");
  const [forgotPinOtp, setForgotPinOtp] = useState("");
  const [forgotPinNew, setForgotPinNew] = useState("");

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [checkAcceptInvite, { isLoading: isCheckingAccept }] =
    useCheckAcceptInviteMutation();
  const [loginWithPin, { isLoading: isLoggingInWithPin }] =
    useLoginWithPinMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [joinEvent, { isLoading: isJoining }] = useJoinEventMutation();
  const [requestForgotPinOtp, { isLoading: isSendingForgotOtp }] =
    useRequestForgotPinOtpMutation();
  const [forgotPinReset, { isLoading: isResettingPin }] =
    useForgotPinResetMutation();

  useLayoutEffect(() => {
    if (step !== "onboarding") {
      return;
    }
    onboardingScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [step]);

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
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 app-pad-y">
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

  const goToFullRoomAfterJoin = async () => {
    try {
      await joinEvent({
        eventSlug,
        access,
        pin: eventPin,
      }).unwrap();
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
      return;
    }
    if (roomHrefFull) {
      router.push(roomHrefFull);
    }
  };

  const onEmailContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const pinResult = eventPinSchema.safeParse(eventPin);
    if (!pinResult.success) {
      setFormError(firstZodIssueMessage(pinResult.error));
      return;
    }

    if (entryMode === "quick") {
      try {
        const result = await loginWithPin({
          eventSlug,
          access,
          email: email.trim(),
          pin: pinResult.data,
        }).unwrap();
        dispatch(
          setSession({
            token: result.token,
            user: result.user,
            tokenExpiresAt: result.tokenExpiresAt ?? null,
          }),
        );
        router.push(roomHrefQuick);
      } catch (err) {
        setFormError(errorMessageFromRtk(err));
      }
      return;
    }

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
      await checkAcceptInvite({
        eventSlug,
        access,
        email: parsed.data.email,
      }).unwrap();
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

  const onForgotPinEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!forgotPinEmail.trim()) {
      setFormError("Email is required");
      return;
    }
    try {
      await requestForgotPinOtp({
        eventSlug,
        access,
        email: forgotPinEmail.trim(),
      }).unwrap();
      setForgotPinOtp("");
      setForgotPinNew("");
      setStep("forgotPinFinish");
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const onForgotPinFinishSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const otpParsed = verifyOtpInputSchema.safeParse({
      email: forgotPinEmail.trim(),
      code: forgotPinOtp,
    });
    const pinParsed = eventPinSchema.safeParse(forgotPinNew);
    if (!otpParsed.success) {
      setFormError(firstZodIssueMessage(otpParsed.error));
      return;
    }
    if (!pinParsed.success) {
      setFormError(firstZodIssueMessage(pinParsed.error));
      return;
    }
    try {
      const result = await forgotPinReset({
        eventSlug,
        access,
        email: otpParsed.data.email,
        code: otpParsed.data.code,
        newPin: pinParsed.data,
      }).unwrap();
      dispatch(
        setSession({
          token: result.token,
          user: result.user,
          tokenExpiresAt: result.tokenExpiresAt ?? null,
        }),
      );
      setEventPin(pinParsed.data);
      setEmail(otpParsed.data.email);
      setForgotPinEmail("");
      setForgotPinOtp("");
      setForgotPinNew("");
      if (roomHrefFull) {
        router.push(roomHrefFull);
      }
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const busyEmail =
    isRequestingOtp ||
    isCheckingAccept ||
    isLoggingInWithPin ||
    isJoining;

  return (
    <>
      {step === "onboarding" && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950">
          {formError && (
            <div className="shrink-0 border-b border-red-900/55 bg-red-950/45 px-4 py-3 text-center text-sm text-red-200">
              {formError}
            </div>
          )}
          <div className="min-h-0 min-w-0 flex-1">
            <GuestOnboardingSlides
              slides={GUEST_ONBOARDING_SLIDES}
              scrollRef={onboardingScrollRef}
              activeIndex={onboardingIndex}
              onActiveIndexChange={setOnboardingIndex}
              isJoining={isJoining}
              onSkip={() => void goToFullRoomAfterJoin()}
            />
          </div>
        </div>
      )}

      {step !== "onboarding" && (
        <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 app-pad-y">
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
              className={appButtonPrimary}
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
              className={appButtonSecondary}
            >
              Already joined
            </button>
            <div className="flex flex-col gap-1.5 text-center text-xs leading-relaxed text-zinc-500">
              <p>
                First time? <span className="text-zinc-400">Accept invitation</span>.
              </p>
              <p>
                Returning with the same email? <span className="text-zinc-400">Already joined</span>{" "}
                uses email + PIN — only if you&apos;ve joined this event before.
              </p>
            </div>
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
                ? "Enter the email and 4-digit PIN you set for this event."
                : "We’ll send a 6-digit verification code that expires in 10 minutes. You’ll also create a 4-digit event PIN — you’ll use email + that code next time you return."}
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
            <TextField
              label="4-digit event PIN"
              type="password"
              value={eventPin}
              onChange={(ev) =>
                setEventPin(ev.target.value.replace(/[^0-9]/g, "").slice(0, 4))
              }
              required
              helperText={
                entryMode === "quick"
                  ? "Enter the 4-digit code you set for this event."
                  : "Create a 4-digit code (numbers only) for this event."
              }
              inputProps={{
                inputMode: "numeric",
                maxLength: 4,
                autoComplete: "new-password",
              }}
              sx={centeredNumericCodeFieldSx(4)}
            />
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setForgotPinEmail(email.trim());
                setStep("forgotPinEmail");
              }}
              className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Forgot PIN?
            </button>
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
            disabled={busyEmail}
            className={appButtonPrimary}
          >
            {entryMode === "quick"
              ? isLoggingInWithPin
                ? "Signing in…"
                : "Continue"
              : isCheckingAccept || isRequestingOtp
                ? "Sending…"
                : "Continue"}
          </button>
        </form>
      )}

      {step === "forgotPinEmail" && (
        <form
          onSubmit={onForgotPinEmailSubmit}
          className="flex flex-1 flex-col justify-between gap-6"
        >
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Reset your PIN</h1>
            <p className="text-sm text-zinc-400">
              Enter your email. We&apos;ll send a verification code so you can set a new PIN for this
              event.
            </p>
            <TextField
              label="Email"
              type="email"
              value={forgotPinEmail}
              onChange={(ev) => setForgotPinEmail(ev.target.value)}
              required
              autoComplete="email"
            />
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setStep("email");
              }}
              className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
          </section>
          <button
            type="submit"
            disabled={isSendingForgotOtp}
            className={appButtonPrimary}
          >
            {isSendingForgotOtp ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "forgotPinFinish" && (
        <form
          onSubmit={onForgotPinFinishSubmit}
          className="flex flex-1 flex-col justify-between gap-6"
        >
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Set a new PIN</h1>
            <p className="text-sm text-zinc-400">
              Enter the code from your email, then choose a new 4-digit PIN for this event.
            </p>
            <TextField
              label="Verification code"
              value={forgotPinOtp}
              onChange={(ev) =>
                setForgotPinOtp(ev.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              inputProps={{
                inputMode: "numeric",
                maxLength: 6,
                autoComplete: "one-time-code",
              }}
              sx={centeredNumericCodeFieldSx(6)}
            />
            <TextField
              label="New 4-digit PIN"
              type="password"
              value={forgotPinNew}
              onChange={(ev) =>
                setForgotPinNew(ev.target.value.replace(/[^0-9]/g, "").slice(0, 4))
              }
              required
              helperText="Enter exactly 4 numbers."
              inputProps={{
                inputMode: "numeric",
                maxLength: 4,
                autoComplete: "new-password",
              }}
              sx={centeredNumericCodeFieldSx(4)}
            />
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setStep("forgotPinEmail");
              }}
              className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
          </section>
          <button
            type="submit"
            disabled={isResettingPin}
            className={appButtonPrimary}
          >
            {isResettingPin ? "Saving…" : "Update PIN"}
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
              sx={centeredNumericCodeFieldSx(6)}
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
            className={appButtonPrimary}
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
            className={appButtonPrimary}
          >
            {isUpdatingProfile ? "Saving…" : "Next"}
          </button>
        </form>
      )}

        </main>
      )}
    </>
  );
}
