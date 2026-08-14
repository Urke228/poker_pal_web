import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./auth.css";

export function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    auth.clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setFieldError("Enter a username.");
      return;
    }
    if (!email.includes("@")) {
      setFieldError("Enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setFieldError("Password must be at least 6 characters.");
      return;
    }
    if (confirm !== password) {
      setFieldError("Passwords do not match.");
      return;
    }
    setFieldError(null);
    await auth.signUp(username, email, password, false);
    if (!auth.errorMessage) navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/poker_pal_logo.png" alt="PokerPal" className="auth-logo" />
        <p className="auth-tagline">Create your account</p>

        {(auth.errorMessage || fieldError) && (
          <div className="auth-error">{fieldError ?? auth.errorMessage}</div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={auth.isLoading}>
            {auth.isLoading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
