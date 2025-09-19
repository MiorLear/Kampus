import { db } from "../firebase";
import {
  addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where
} from "firebase/firestore";

export async function createCourse(payload: { title: string; teacherUid: string }) {
  return addDoc(collection(db, "courses"), payload);
}

export async function listCoursesByTeacher(teacherUid: string) {
  const q = query(collection(db, "courses"), where("teacherUid", "==", teacherUid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCourse(id: string) {
  const snap = await getDoc(doc(db, "courses", id));
  return snap.data();
}

export async function updateCourse(id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, "courses", id), data);
}
