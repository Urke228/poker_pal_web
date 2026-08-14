import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    [],
  );

  if (!ready) return null;

  return (
    <main id="root-shell">
      <h1>PokerPal</h1>
      <p>{user ? `Signed in as ${user.email ?? user.uid}` : "Not signed in"}</p>
    </main>
  );
}

export default App;
