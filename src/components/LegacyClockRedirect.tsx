import type { ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

/**
 * Keeps older clock links working.
 *
 * The mobile app used to share the display as `/?t=<id>`; the canonical form is
 * now `/clock?t=<id>`. Links already handed out — pasted into a chat, opened on
 * a TV, bookmarked — still carry the old shape, so the root redirects them
 * instead of showing the home page and dropping the parameter.
 *
 * The redirect happens before any authentication check, so a display that is
 * not signed in lands on the clock page and is prompted there rather than being
 * bounced to the login screen and losing the tournament id along the way.
 */
export function LegacyClockRedirect({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const clockId = params.get("t");

  if (clockId) {
    return <Navigate to={`/clock?t=${encodeURIComponent(clockId)}`} replace />;
  }
  return <>{children}</>;
}
