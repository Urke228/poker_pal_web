import { useSearchParams } from "react-router-dom";
import { useClockDoc } from "./useClockDoc";
import { ClockDisplay } from "./ClockDisplay";
import "./clock.css";

export function ClockPage() {
  const [params] = useSearchParams();
  const id = params.get("t");
  const state = useClockDoc(id);

  if (state.status === "loading") {
    return (
      <div className="clock-page" data-theme="felt">
        <div className="clock-message">Connecting…</div>
      </div>
    );
  }
  if (state.status === "not-found") {
    return (
      <div className="clock-page" data-theme="felt">
        <div className="clock-message">
          No clock for this tournament yet. Start it from the app first.
        </div>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="clock-page" data-theme="felt">
        <div className="clock-message">Read failed: {state.message}</div>
      </div>
    );
  }
  return <ClockDisplay doc={state.doc} />;
}
