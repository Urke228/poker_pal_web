import { get, put } from "./client";

/**
 * A result the player chose to show on their public profile. Written only by
 * PUT /users/me/featured — the server copies place and winnings from the real
 * finalized standings, so a card can be chosen and renamed but never forged.
 */
export interface FeaturedResult {
  tournamentId: string;
  name: string;
  date: string | null;
  place: number | null;
  winnings: number;
}

export interface Me {
  uid: string;
  email: string | null;
  username: string | null;
  photoURL: string | null;
  backgroundURL: string | null;
  followers: number;
  following: number;
  hasProfile: boolean;
  featuredResults: FeaturedResult[];
}

/**
 * Profile art is stored as the Flutter app's asset path
 * (`lib/assets/images/avatars/avatar1.png`). The same images are bundled under
 * `public/avatars` and `public/backgrounds`, so serving them here is a matter
 * of mapping the filename. Absolute URLs (a future upload feature) pass through.
 */
export function profileArtUrl(
  path: string | null | undefined,
  kind: "avatars" | "backgrounds",
): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const file = path.split("/").pop();
  return file ? `/${kind}/${file}` : null;
}

/** The signed-in user's own profile. */
export function getMe(): Promise<Me> {
  return get<Me>("/users/me");
}

/**
 * Sets which finished tournaments show on the caller's public profile. Only
 * ids and optional display names travel; the server fills in the rest.
 */
export async function setFeatured(
  items: { tournamentId: string; name?: string }[],
): Promise<FeaturedResult[]> {
  const res = await put<{ featuredResults: FeaturedResult[] }>(
    "/users/me/featured",
    { items },
  );
  return res.featuredResults;
}
