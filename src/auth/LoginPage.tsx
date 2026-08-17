import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./auth.css";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Leave the login page as soon as we're authenticated — covers email,
  // Google, and landing here while already signed in.
  useEffect(() => {
    if (auth.user) navigate("/", { replace: true });
  }, [auth.user, navigate]);

  useEffect(() => {
    auth.clearError();
    if (auth.rememberedEmail) {
      setEmail(auth.rememberedEmail);
      setRemember(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setFieldError("Enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setFieldError("Password must be at least 6 characters.");
      return;
    }
    setFieldError(null);
    await auth.signIn(email, password, remember);
  };

  const forgotPassword = async () => {
    if (!email.includes("@")) {
      setFieldError("Enter a valid email first.");
      return;
    }
    await auth.sendPasswordResetEmail(email);
    if (!auth.errorMessage) {
      alert("Check your inbox for a password reset link.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/poker_pal_logo.png" alt="PokerPal" className="auth-logo" />
        <p className="auth-tagline">Run the game. Track the stats.</p>

        {(auth.errorMessage || fieldError) && (
          <div className="auth-error">{fieldError ?? auth.errorMessage}</div>
        )}

        <form className="auth-form" onSubmit={submit}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="auth-link" onClick={forgotPassword}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit" disabled={auth.isLoading}>
            {auth.isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button
          type="button"
          className="auth-google"
          disabled={auth.isLoading}
          onClick={() => auth.signInWithGoogle(remember)}
        >
          Continue with Google
        </button>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
