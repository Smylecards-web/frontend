"use client";

import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { useDispatch, useSelector } from "react-redux";

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
import { useCreateEventMutation } from "@/modules/event/event.api";
import { createEventInputSchema } from "@/modules/event/event.schema";
import type { AppDispatch, RootState } from "@/store";
import { appButtonPrimary } from "@/lib/appUi";
import { errorMessageFromRtk } from "@/lib/errorMessageFromRtk";
import { centeredNumericCodeFieldSx } from "@/lib/muiCodeFieldSx";
import { firstZodIssueMessage } from "@/lib/zodErrors";

type HostStep =
  | "email"
  | "verify"
  | "profile"
  | "event"
  | "invite";

export default function HostStartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const authToken = useSelector((state: RootState) => state.auth.token);
  const tokenExpiresAt = useSelector(
    (state: RootState) => state.auth.tokenExpiresAt,
  );
  const [step, setStep] = useState<HostStep>("email");
  const [email, setEmail] = useState("");
  const [eventPin, setEventPin] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [occasion, setOccasion] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [mainLocation, setMainLocation] = useState("");
  const [description, setDescription] = useState("");
  const [invitePayload, setInvitePayload] = useState<{
    eventSlug: string;
    inviteUrl: string;
    qrPayload: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();

  const inviteLink = useMemo(
    () => invitePayload?.inviteUrl ?? "",
    [invitePayload],
  );

  const eventDateMin = dayjs().startOf("day");

  const onEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsedOtp = requestOtpInputSchema.safeParse({
      email,
      context: "host" as const,
    });
    const parsedPin = eventPinSchema.safeParse(eventPin);
    if (!parsedOtp.success) {
      setFormError(firstZodIssueMessage(parsedOtp.error));
      return;
    }
    if (!parsedPin.success) {
      setFormError(firstZodIssueMessage(parsedPin.error));
      return;
    }
    try {
      await requestOtp(parsedOtp.data).unwrap();
      setStep("verify");
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const onVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = verifyOtpInputSchema.safeParse({
      email,
      code: otpCode,
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
      setStep("profile");
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
      if (authToken) {
        dispatch(
          setSession({
            token: authToken,
            user,
            tokenExpiresAt: tokenExpiresAt ?? undefined,
          }),
        );
      }
      setStep("event");
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  const onEventSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = createEventInputSchema.safeParse({
      occasion,
      date: eventDate,
      mainLocation,
      description,
      locations: [],
      title: occasion,
      coverImageUrl: avatarUrl.trim() || undefined,
      videoMessageUrl: undefined,
      pin: eventPin,
    });
    if (!parsed.success) {
      setFormError(firstZodIssueMessage(parsed.error));
      return;
    }
    try {
      const result = await createEvent({
        occasion: parsed.data.occasion,
        date: parsed.data.date,
        mainLocation: parsed.data.mainLocation,
        description: parsed.data.description,
        locations: parsed.data.locations,
        title: parsed.data.title,
        coverImageUrl: parsed.data.coverImageUrl?.trim() || undefined,
        videoMessageUrl: parsed.data.videoMessageUrl?.trim() || undefined,
        pin: parsed.data.pin,
      }).unwrap();
      setInvitePayload(result);
      setStep("invite");
    } catch (err) {
      setFormError(errorMessageFromRtk(err));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 app-pad-y">
      <div className="mb-6">
        <p className="text-xs tracking-[0.28em] text-zinc-400 uppercase">Host flow</p>
      </div>

      {formError && (
        <p className="mb-4 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={onEmailSubmit} className="flex flex-1 flex-col justify-between gap-6">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Enter your email</h1>
            <p className="text-sm text-zinc-400">
              We will send a 6-digit verification code that expires in 10 minutes.
            </p>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <TextField
              label="4-digit event PIN"
              type="password"
              value={eventPin}
              onChange={(e) =>
                setEventPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
              }
              required
              helperText="This PIN will be used to access your event."
              inputProps={{
                inputMode: "numeric",
                maxLength: 4,
                autoComplete: "new-password",
              }}
              sx={centeredNumericCodeFieldSx(4)}
            />
          </section>
          <button
            type="submit"
            disabled={isRequestingOtp}
            className={appButtonPrimary}
          >
            {isRequestingOtp ? "Sending…" : "Continue"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={onVerifySubmit} className="flex flex-1 flex-col justify-between gap-6">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Verify your email</h1>
            <p className="text-sm text-zinc-400">
              Enter your 6-digit code. Didn&apos;t receive it? Resend from the previous step.
            </p>
            <TextField
              label="Verification code"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/[^0-9]/g, ""))
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
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              helperText="Optional"
            />
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

      {step === "event" && (
        <form onSubmit={onEventSubmit} className="flex flex-1 flex-col justify-between gap-6">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Create event</h1>
            <p className="text-sm text-zinc-400">
              Basic details first, event enhancements can be added later.
            </p>
            <TextField
              label="Occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Wedding, birthday…"
              required
            />
            <DatePicker
              enableAccessibleFieldDOMStructure={false}
              label="Event date"
              format="DD/MM/YYYY"
              minDate={eventDateMin}
              shouldDisableDate={(day) => day.startOf("day").isBefore(eventDateMin)}
              value={eventDate ? dayjs(eventDate) : null}
              onChange={(value: Dayjs | null) => {
                if (!value || !value.isValid()) {
                  setEventDate("");
                  return;
                }
                const picked = value.startOf("day");
                if (picked.isBefore(eventDateMin)) {
                  setEventDate("");
                  return;
                }
                setEventDate(picked.format("YYYY-MM-DD"));
              }}
              slotProps={{
                popper: { sx: { zIndex: 1500 } },
                textField: {
                  required: true,
                },
              }}
            />
            <TextField
              label="Main location"
              value={mainLocation}
              onChange={(e) => setMainLocation(e.target.value)}
              placeholder="Venue or area"
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Message for your guests"
              required
              multiline
              minRows={4}
            />
          </section>
          <button
            type="submit"
            disabled={isCreatingEvent}
            className={appButtonPrimary}
          >
            {isCreatingEvent ? "Creating…" : "Generate Invite"}
          </button>
        </form>
      )}

      {step === "invite" && invitePayload && (
        <section className="flex flex-1 flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Invite ready</h1>
            <p className="text-sm text-zinc-400">
              Share the guest invite (QR or link). Only links that include your private access key work — pasting the room path alone will not let anyone in.
            </p>
            <div className="flex justify-center rounded-xl border border-zinc-800 bg-white p-4">
              <QRCode
                value={invitePayload.inviteUrl}
                size={220}
                level="M"
                className="h-auto max-w-full"
              />
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">Invitation link</p>
              <p className="mt-1 break-all text-sm text-zinc-100">{inviteLink}</p>
            </div>
          </div>
          <Link
            href={invitePayload.inviteUrl}
            className={`inline-flex items-center justify-center ${appButtonPrimary}`}
          >
            Open invitation
          </Link>
        </section>
      )}
    </main>
  );
}
