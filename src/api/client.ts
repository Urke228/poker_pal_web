import { auth } from "../firebase";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

if (!API_BASE) {
  // Without this the calls resolve relative to the dev server and come back as
  // puzzling 404s from Vite rather than from the API. Note that a .env file
  // saved with a UTF-8 BOM will do this too: the BOM becomes part of the first
  // key's name, so VITE_API_BASE_URL reads as undefined.
  throw new Error(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env.local, point it " +
      "at the emulator or the deployed API, and restart the dev server.",
  );
}

/**
 * A failed API call. `code` is the stable identifier the backend sends in
 * `{error: {code, message}}`; branch on it rather than on the message text.
 */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** True when the session expired and the user needs to sign in again. */
  get isAuthExpired(): boolean {
    return this.status === 401;
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let code = "UNKNOWN";
  let message = `Request failed (${res.status}).`;
  try {
    const body = await res.json();
    if (body?.error?.code) code = body.error.code;
    if (body?.error?.message) message = body.error.message;
  } catch {
    // A non-JSON body (a proxy error page, say) leaves the defaults in place.
  }
  return new ApiError(res.status, code, message);
}

async function requestJson<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch only rejects for network-level failures, never for HTTP errors.
    throw new ApiError(0, "NETWORK", "Could not reach the server. Check your connection.");
  }

  if (!res.ok) throw await toApiError(res);

  // 204 and other empty bodies are normal for deletes.
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const get = <T>(path: string) => requestJson<T>("GET", path);
export const post = <T>(path: string, body?: unknown) => requestJson<T>("POST", path, body);
export const put = <T>(path: string, body?: unknown) => requestJson<T>("PUT", path, body);
export const del = <T>(path: string) => requestJson<T>("DELETE", path);

/** Turns any thrown value into something safe to render. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}
