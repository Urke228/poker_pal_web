import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { ClockDoc } from "./clockMath";

export type ClockDocState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ok"; doc: ClockDoc };

/** Subscribes to `timers/{id}` in real time. */
export function useClockDoc(id: string | null): ClockDocState {
  const [state, setState] = useState<ClockDocState>({ status: "loading" });

  useEffect(() => {
    if (!id) {
      setState({ status: "error", message: "No clock specified." });
      return;
    }
    setState({ status: "loading" });
    return onSnapshot(
      doc(db, "timers", id),
      (snap) => {
        if (!snap.exists()) {
          setState({ status: "not-found" });
          return;
        }
        setState({ status: "ok", doc: snap.data() as ClockDoc });
      },
      (err) => {
        setState({ status: "error", message: err.message });
      },
    );
  }, [id]);

  return state;
}
