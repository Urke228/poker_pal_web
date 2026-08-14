import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Calls the poker_pal_api backend, attaching the signed-in user's ID token. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
