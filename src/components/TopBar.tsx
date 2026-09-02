import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./TopBar.css";

const NAV = [
  { to: "/tournaments", label: "Tournaments" },
  { to: "/stats", label: "Stats" },
  { to: "/profile", label: "Profile" },
];

export function TopBar() {
  const { user, signOutUser } = useAuth();
  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-brand">
        <img src="/poker_pal_logo.png" alt="" />
        <span>PokerPal</span>
      </Link>
      <nav className="top-bar-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "is-active" : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="top-bar-user">
        <span className="top-bar-email">{user?.email ?? ""}</span>
        <button onClick={() => signOutUser()}>Sign out</button>
      </div>
    </header>
  );
}
