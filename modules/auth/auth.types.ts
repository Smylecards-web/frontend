export type OtpContext = "host" | "guest";

export type OtpRequest = {
  email: string;
  context: OtpContext;
  eventSlug?: string;
};

export type OtpRequestResponse = {
  expiresInSeconds: number;
};

export type VerifyOtpRequest = {
  email: string;
  code: string;
  username?: string;
  avatarUrl?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
};

export type VerifyOtpResponse = {
  token: string;
  tokenExpiresAt?: string | null;
  isNewUser: boolean;
  user: AuthUser;
};

export type UpdateProfilePayload = {
  username: string;
  avatarUrl?: string;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  tokenExpiresAt: string | null;
};
