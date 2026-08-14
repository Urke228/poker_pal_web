import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Same default asset paths the mobile app uses — they resolve from the
// Flutter app's own bundled assets regardless of which client created the
// account, so it's safe to write the same strings from the web app.
const DEFAULT_AVATAR = "lib/assets/images/avatars/avatar1.png";
const DEFAULT_BACKGROUND = "lib/assets/images/backgrounds/background1.png";
const REMEMBERED_EMAIL_KEY = "pokerpal_email";

export type AuthErrorCode =
  | "none"
  | "invalid-email"
  | "wrong-password"
  | "user-not-found"
  | "email-in-use"
  | "weak-password"
  | "network"
  | "google-canceled"
  | "unknown";

const ERROR_MESSAGES: Record<AuthErrorCode, string | null> = {
  none: null,
  "invalid-email": "Invalid email address.",
  "wrong-password": "Incorrect email or password.",
  "user-not-found": "No user found with that email.",
  "email-in-use": "An account already exists for that email.",
  "weak-password": "Password is too weak (min 6 characters).",
  network: "Network error, please try again.",
  "google-canceled": "Google sign-in was cancelled.",
  unknown: "An unknown error occurred.",
};

function mapAuthErrorCode(code: string): AuthErrorCode {
  switch (code) {
    case "auth/invalid-email":
      return "invalid-email";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "wrong-password";
    case "auth/user-not-found":
      return "user-not-found";
    case "auth/email-already-in-use":
      return "email-in-use";
    case "auth/weak-password":
      return "weak-password";
    case "auth/network-request-failed":
      return "network";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "google-canceled";
    default:
      return "unknown";
  }
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  rememberedEmail: string;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (
    username: string,
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<void>;
  signInWithGoogle: (remember: boolean) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function createUserProfile(uid: string, username: string, email: string | null) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const name = username.trim();
  await setDoc(ref, {
    username: name,
    username_lowercase: name.toLowerCase(),
    email,
    joinedAt: serverTimestamp(),
    followers: [],
    following: [],
    photoURL: DEFAULT_AVATAR,
    backgroundURL: DEFAULT_BACKGROUND,
    tournaments: [],
  });
}

function persistEmail(remember: boolean, email: string) {
  if (remember) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<AuthErrorCode>("none");

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    [],
  );

  const clearError = () => setErrorCode("none");

  const signIn = async (email: string, password: string, remember: boolean) => {
    setErrorCode("none");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      persistEmail(remember, email);
    } catch (e) {
      setErrorCode(mapAuthErrorCode((e as { code?: string }).code ?? ""));
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    username: string,
    email: string,
    password: string,
    remember: boolean,
  ) => {
    setErrorCode("none");
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(cred.user.uid, username, email);
      persistEmail(remember, email);
    } catch (e) {
      setErrorCode(mapAuthErrorCode((e as { code?: string }).code ?? ""));
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (remember: boolean) => {
    setErrorCode("none");
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const name =
        cred.user.displayName ?? cred.user.email?.split("@")[0] ?? "Player";
      await createUserProfile(cred.user.uid, name, cred.user.email);
      if (cred.user.email) persistEmail(remember, cred.user.email);
    } catch (e) {
      setErrorCode(mapAuthErrorCode((e as { code?: string }).code ?? ""));
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setErrorCode("none");
    setIsLoading(true);
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (e) {
      setErrorCode(mapAuthErrorCode((e as { code?: string }).code ?? ""));
    } finally {
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isLoading,
      errorMessage: ERROR_MESSAGES[errorCode],
      clearError,
      rememberedEmail: localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "",
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordResetEmail,
      signOutUser,
    }),
    [user, ready, isLoading, errorCode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
