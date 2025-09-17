export type Role = "admin" | "teacher" | "student";

export type UserDoc = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
  createdAt: number; // Date.now()
};
