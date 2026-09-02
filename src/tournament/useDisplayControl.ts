import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export interface DisplayControl {
  /** Which tab the organizer's phone wants shown, or null when unset. */
  tab: string | null;
  /** Bumped by the phone to force a data refetch. */
  refreshToken: number | null;
  /** How to draw the Seating tab: "table" | "graphical" (null = default). */
  seatingView: string | null;
}

/**
 * Subscribes to `displays/{tournamentId}` — the phone's remote control for the
 * TV display. Real-time, like the clock; this is the intentional Firestore
 * exception that lets the organizer drive the display from their phone.
 */
export function useDisplayControl(tournamentId: string): DisplayControl {
  const [control, setControl] = useState<DisplayControl>({
    tab: null,
    refreshToken: null,
    seatingView: null,
  });

  useEffect(() => {
    return onSnapshot(
      doc(db, "displays", tournamentId),
      (snap) => {
        const data = snap.data();
        setControl({
          tab: typeof data?.tab === "string" ? data.tab : null,
          refreshToken:
            typeof data?.refreshToken === "number" ? data.refreshToken : null,
          seatingView:
            typeof data?.seatingView === "string" ? data.seatingView : null,
        });
      },
      () => setControl({ tab: null, refreshToken: null, seatingView: null }),
    );
  }, [tournamentId]);

  return control;
}
