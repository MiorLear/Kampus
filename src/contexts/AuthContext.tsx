import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Role, UserDoc } from "@/lib/types";

type AuthState = {
  user: User | null;
  role: Role | null;
  loading: boolean;
};

const Ctx = createContext<AuthState>({ user: null, role: null, loading: true });
export function useAuth() { return useContext(Ctx); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setState({ user: null, role: null, loading: false }); return; }
      const snap = await getDoc(doc(db, "users", u.uid));
      const role = (snap.data()?.role ?? "student") as Role;
      setState({ user: u, role, loading: false });
    });
    return () => unsub();
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
