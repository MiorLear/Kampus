// src/services/user.ts
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { Role } from "../lib/types";

export async function ensureUserDoc(
  uid: string,
  data: { role: Role; email?: string | null; displayName?: string | null }
) {
  await setDoc(
    doc(db, "users", uid),
    { ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getUserRole(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return (snap.data()?.role as Role | undefined) ?? null;
}

export async function getUserDoc(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}