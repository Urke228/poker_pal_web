import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;
  if (!user) {
    // Carry where they were headed, including the query string, so signing in
    // returns them there. This matters most for a clock link opened on a TV:
    // without it the tournament id is lost at the login screen.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
