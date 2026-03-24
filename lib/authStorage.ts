const AUTH_STORAGE_KEY = "smylecards.auth.v1";

export type PersistedAuthPayload = {
  token: string;
  user: unknown;
  tokenExpiresAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  return t <= Date.now();
}

export function readPersistedAuth(): PersistedAuthPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const token = parsed.token;
    const user = parsed.user;
    const tokenExpiresAt =
      typeof parsed.tokenExpiresAt === "string" || parsed.tokenExpiresAt === null
        ? (parsed.tokenExpiresAt as string | null)
        : null;
    if (typeof token !== "string" || token.length === 0) return null;
    if (isExpired(tokenExpiresAt)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return { token, user, tokenExpiresAt };
  } catch {
    return null;
  }
}

export function writePersistedAuth(payload: PersistedAuthPayload | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!payload) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    if (isExpired(payload.tokenExpiresAt)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch {
  }
}
