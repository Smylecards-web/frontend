import type { OtpRequest, UpdateProfilePayload, VerifyOtpRequest } from "./auth.types";

export function toOtpRequestBody(payload: OtpRequest) {
  return {
    email: payload.email,
    context: payload.context,
    event_slug: payload.eventSlug,
  };
}

export function toVerifyOtpBody(payload: VerifyOtpRequest) {
  return {
    email: payload.email,
    code: payload.code,
    username: payload.username,
    avatar_url: payload.avatarUrl,
  };
}

export function toUpdateProfileBody(payload: UpdateProfilePayload) {
  const body: { username: string; avatar_url?: string } = {
    username: payload.username,
  };
  if (payload.avatarUrl) {
    body.avatar_url = payload.avatarUrl;
  }
  return body;
}
