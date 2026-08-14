import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import { TopBar } from "../components/TopBar";
import "./ClocksListPage.css";

interface ClockSummary {
  id: string;
  name: string;
}

/** Accepts either a raw doc id or a full "?t=<id>" clock link. */
function extractClockId(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("t") ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function ClocksListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clocks, setClocks] = useState<ClockSummary[]>([]);
  const [idInput, setIdInput] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "timers"), where("createdBy", "==", user.uid));
    return onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({
          id: d.id,
          name: (d.data().tournamentName as string) || "Untitled clock",
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setClocks(list);
    });
  }, [user]);

  const openById = (e: FormEvent) => {
    e.preventDefault();
    const id = extractClockId(idInput);
    if (id) navigate(`/clock?t=${encodeURIComponent(id)}`);
  };

  return (
    <div>
      <TopBar />
      <main className="clocks-main">
        <h1>Tournament Clocks</h1>

        <form className="clocks-open-form" onSubmit={openById}>
          <input
            placeholder="Paste a clock link or tournament ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <button type="submit">Open</button>
        </form>

        <h2>Your clocks</h2>
        {clocks.length === 0 ? (
          <p className="clocks-empty">
            No clocks yet — start one from the app (Manage Tournament →
            Tournament Clock, or Blinds Clocks on the home screen).
          </p>
        ) : (
          <ul className="clocks-list">
            {clocks.map((c) => (
              <li key={c.id}>
                <Link to={`/clock?t=${encodeURIComponent(c.id)}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
