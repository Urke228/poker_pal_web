import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Public web API key — safe to expose; access is gated by Firestore security
// rules on the same project (see poker_pal_api/firestore.rules).
const firebaseConfig = {
  apiKey: "AIzaSyAuhvML4uAoUSWTbtyoQgro9eF_WyDlZWo",
  authDomain: "pokerpal-a1451.firebaseapp.com",
  projectId: "pokerpal-a1451",
  storageBucket: "pokerpal-a1451.firebasestorage.app",
  messagingSenderId: "700253035192",
  appId: "1:700253035192:web:52b3f99141d1d4f1f1f24d",
  measurementId: "G-L2Z6V0Z1E3",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
