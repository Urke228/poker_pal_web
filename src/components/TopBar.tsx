import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./TopBar.css";

export function TopBar() {
  const { user, signOutUser } = useAuth();
  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-brand">
        <img src="/poker_pal_logo.png" alt="" />
        <span>PokerPal</span>
      </Link>
      <div className="top-bar-user">
        <span>{user?.email ?? ""}</span>
        <button onClick={() => signOutUser()}>Sign out</button>
      </div>
    </header>
  );
}
