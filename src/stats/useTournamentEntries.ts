import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import type { TournamentEntry } from "./statsMath";

export function useTournamentEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      const raw = (snap.data()?.tournaments as TournamentEntry[] | undefined) ?? [];
      setEntries(raw);
      setReady(true);
    });
  }, [user]);

  return { entries, ready };
}

export async function addTournamentEntry(
  uid: string,
  entry: Omit<TournamentEntry, "id">,
) {
  const ref = doc(db, "users", uid);
  const withId: TournamentEntry = {
    ...entry,
    id: `${Date.now()}${Math.random().toString(16).slice(2)}`,
  };
  const snap = await getDoc(ref);
  const current = (snap.data()?.tournaments as TournamentEntry[] | undefined) ?? [];
  await updateDoc(ref, { tournaments: [...current, withId] });
}

export async function deleteTournamentEntry(uid: string, entryId: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const current = (snap.data()?.tournaments as TournamentEntry[] | undefined) ?? [];
  await updateDoc(ref, {
    tournaments: current.filter((e) => e.id !== entryId),
  });
}
